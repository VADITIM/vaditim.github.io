import { ref } from 'vue'

import { API_BASE_URL } from './apiBaseUrl'
import { setOwnComment, type CommentEntry } from './extraComments'
import { setOwnRating } from './extraRating'
import { applyServerUnlockState } from './sectionsClassifiedUnlock'
import { computeCoarseFingerprint, computeFingerprint } from './visitorFingerprint'

export interface VisitorSession {
  visitorId: string
  comment: CommentEntry | null
  rating: number | null
  isUnlocked: boolean
}

/** True once the server has answered — or failed to; either way nothing is still pending. */
export const isVisitorSessionResolved = ref(false)

let pendingSession: Promise<VisitorSession | null> | null = null

/**
 * One request answers who the visitor is for the guestbook, the rating and the
 * classified unlock at once, so the three can never disagree. It also issues or
 * refreshes the identity cookie, which puts every later request on the exact-match
 * path. Deduplicated: the first caller starts it, everyone else awaits that answer.
 */
export function resolveVisitorSession(): Promise<VisitorSession | null> {
  pendingSession ??= requestVisitorSession()
  return pendingSession
}

async function requestVisitorSession(): Promise<VisitorSession | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/visitor/session`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint: computeFingerprint(),
        coarseFingerprint: computeCoarseFingerprint(),
      }),
    })
    if (!response.ok) throw new Error(`Visitor session responded ${response.status}`)

    const session: VisitorSession = await response.json()
    setOwnComment(session.comment)
    setOwnRating(session.rating)
    applyServerUnlockState(session.isUnlocked)
    return session
  } catch (error) {
    console.error('[visitor] session resolve failed', error)
    return null
  } finally {
    isVisitorSessionResolved.value = true
  }
}
