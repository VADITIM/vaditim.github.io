import { ref } from 'vue'
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import QRCode from 'qrcode'

import { API_BASE_URL } from './apiBaseUrl'
import { isClassifiedUnlocked, triggerClassifiedUnlock } from './sectionsClassifiedUnlock'
import { computeCoarseFingerprint, computeFingerprint } from './visitorFingerprint'
import { resolveVisitorSession } from './visitorSession'

/** Must stay under the server's 15-minute session lifetime so the QR is never dead on screen. */
const SESSION_REFRESH_MS = 14 * 60 * 1000

/** Data URL of the QR the desktop shows; empty until the first session is minted. */
export const unlockQrDataUrl = ref('')

let connection: HubConnection | null = null
let sessionId = ''
let refreshTimer = 0

/**
 * Desktop side: mints a session, shows its QR, and unlocks the classified section the
 * moment a phone scans it. Safe to call once from app startup — no-ops if the visitor
 * already unlocked on a previous visit.
 */
export async function startUnlockSession(): Promise<void> {
  if (isClassifiedUnlocked.value || connection) return

  // The server, not the cached flag, decides whether this visitor still needs to scan;
  // minting a session first would flash a QR at someone who unlocked months ago.
  await resolveVisitorSession()
  if (isClassifiedUnlocked.value || connection) return

  connection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/unlock-hub`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build()

  connection.on('unlocked', (claimToken: string) => {
    stopUnlockSession()
    void persistUnlockForVisitor(claimToken)
  })

  // A reconnect drops the server-side group membership, so re-subscribe every time.
  connection.onreconnected(() => void subscribe())

  // The QR is drawn from the session id alone, so it must not wait on the hub —
  // an API that is down or still deploying would otherwise leave the card blank.
  await rotateSession()

  try {
    await connection.start()
    await subscribe()
  } catch (error) {
    console.warn('[unlock] hub unreachable; the QR will not unlock anything yet', error)
  }
}

export function stopUnlockSession(): void {
  window.clearTimeout(refreshTimer)
  refreshTimer = 0
  void connection?.stop()
  connection = null
}

/**
 * Phone side: the QR points back at the site with `?unlock=<sessionId>`, so a page
 * load carrying that param is a scan. Resolves to whether the unlock landed.
 */
export async function claimUnlockFromUrl(): Promise<boolean | null> {
  const scannedSessionId = new URLSearchParams(window.location.search).get('unlock')
  if (!scannedSessionId) return null

  try {
    const response = await fetch(`${API_BASE_URL}/unlock/${encodeURIComponent(scannedSessionId)}`, { method: 'POST' })
    return response.ok
  } catch (error) {
    console.error('[unlock] claim failed', error)
    return false
  }
}

/**
 * The phone claimed the session, but the unlock belongs to this machine — so the
 * desktop writes the row itself, against its own cookie and fingerprints. The
 * one-time token from the push is what authorizes the write; without it the
 * endpoint would be a free "unlock me" for anyone who found it.
 */
async function persistUnlockForVisitor(claimToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/unlock/claim`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claimToken,
        fingerprint: computeFingerprint(),
        coarseFingerprint: computeCoarseFingerprint(),
      }),
    })
    if (!response.ok) throw new Error(`Unlock claim responded ${response.status}`)
  } catch (error) {
    // The visitor scanned and earned it; a failed write only costs them the
    // persistence, so unlock anyway and let the next scan try again.
    console.error('[unlock] persisting the claim failed', error)
  }
  triggerClassifiedUnlock()
}

async function rotateSession(): Promise<void> {
  sessionId = createSessionId()

  const unlockUrl = new URL(window.location.href)
  unlockUrl.search = `?unlock=${sessionId}`
  unlockUrl.hash = ''
  unlockQrDataUrl.value = await QRCode.toDataURL(unlockUrl.toString(), {
    margin: 1,
    width: 512,
    // White modules on a fully transparent quiet zone, so the code sits on the
    // card's own dark surface instead of a white tile punched out of it.
    color: { dark: '#ffffffff', light: '#00000000' },
  })

  await subscribe()
  refreshTimer = window.setTimeout(() => void rotateSession(), SESSION_REFRESH_MS)
}

// Best-effort: a session with nobody subscribed simply can't be claimed, which is
// the same outcome as a failed scan — never worth breaking the page over.
async function subscribe(): Promise<void> {
  if (!sessionId || connection?.state !== HubConnectionState.Connected) return
  try {
    await connection.invoke('Subscribe', sessionId)
  } catch (error) {
    console.warn('[unlock] subscribe failed', error)
  }
}

function createSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
