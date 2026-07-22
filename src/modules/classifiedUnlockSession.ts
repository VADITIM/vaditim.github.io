import { ref } from 'vue'
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import QRCode from 'qrcode'

import { API_BASE_URL } from './apiBaseUrl'
import { isClassifiedUnlocked, triggerClassifiedUnlock } from './sectionsClassifiedUnlock'

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

  connection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/unlock-hub`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('unlocked', () => {
    stopUnlockSession()
    triggerClassifiedUnlock()
  })

  // A reconnect drops the server-side group membership, so re-subscribe every time.
  connection.onreconnected(() => void subscribe())

  try {
    await connection.start()
    await rotateSession()
  } catch (error) {
    console.error('[unlock] hub connection failed', error)
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

async function rotateSession(): Promise<void> {
  sessionId = createSessionId()
  await subscribe()

  const unlockUrl = new URL(window.location.href)
  unlockUrl.search = `?unlock=${sessionId}`
  unlockUrl.hash = ''
  unlockQrDataUrl.value = await QRCode.toDataURL(unlockUrl.toString(), {
    margin: 1,
    width: 512,
    color: { dark: '#000000ff', light: '#ffffffff' },
  })

  refreshTimer = window.setTimeout(() => void rotateSession(), SESSION_REFRESH_MS)
}

async function subscribe(): Promise<void> {
  if (!sessionId || connection?.state !== HubConnectionState.Connected) return
  await connection.invoke('Subscribe', sessionId)
}

function createSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
