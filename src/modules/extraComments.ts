import { computed, ref } from 'vue'

import { API_BASE_URL } from './apiBaseUrl'
import { computeFingerprint } from './visitorFingerprint'

export interface CommentEntry {
  id: number
  name: string
  text: string
  createdAtUtc: string
  /** False once the visitor has spent their single edit; the server is the authority. */
  canEdit: boolean
}

export type CommentSubmitState =
  | 'idle' | 'sending' | 'sent' | 'saved' | 'alreadyPosted' | 'editSpent' | 'rateLimited' | 'error'

const VISITOR_NAME_KEY = 'visitor-name'

export const comments = ref<CommentEntry[]>([])
export const ownComment = ref<CommentEntry | null>(null)

/**
 * The name this visitor signed their comment with, or null if they haven't posted.
 * Mirrored into localStorage because the loading greeting reads it at `t=0`, long
 * before a round-trip to the API could answer.
 */
export const visitorName = ref<string | null>(localStorage.getItem(VISITOR_NAME_KEY))
export const submitState = ref<CommentSubmitState>('idle')
export const isCommentsLoaded = ref(false)
export const isCommentsUnavailable = ref(false)

export const canEditComment = computed(() => ownComment.value?.canEdit === true)

/** The public list only; who the visitor is comes from `visitorSession`, never from here. */
export async function loadComments(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/`, { credentials: 'include' })
    if (!response.ok) throw new Error(`Comments list responded ${response.status}`)
    comments.value = await response.json()
    isCommentsUnavailable.value = false
  } catch (error) {
    console.error('[comments] load failed', error)
    isCommentsUnavailable.value = true
  }
  isCommentsLoaded.value = true
}

/** Called by `visitorSession` once identity resolves, and by every write below. */
export function setOwnComment(comment: CommentEntry | null): void {
  ownComment.value = comment
  visitorName.value = comment?.name ?? null
  if (comment) localStorage.setItem(VISITOR_NAME_KEY, comment.name)
  else localStorage.removeItem(VISITOR_NAME_KEY)
}

export async function submitComment(name: string, text: string): Promise<void> {
  submitState.value = 'sending'
  try {
    const response = await fetch(`${API_BASE_URL}/comments/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, text, fingerprint: computeFingerprint() }),
    })
    if (response.ok) {
      setOwnComment(await response.json())
      submitState.value = 'sent'
      await loadComments()
    } else if (response.status === 409) {
      submitState.value = 'alreadyPosted'
    } else if (response.status === 429) {
      submitState.value = 'rateLimited'
    } else {
      submitState.value = 'error'
    }
  } catch {
    submitState.value = 'error'
  }
}

/**
 * The one edit a visitor gets. The server caps it, so a 409 here means the edit was
 * already spent on another browser — trust that answer over the local button state.
 */
export async function saveCommentEdit(name: string, text: string): Promise<void> {
  submitState.value = 'sending'
  try {
    const response = await fetch(`${API_BASE_URL}/comments/mine`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, text, fingerprint: computeFingerprint() }),
    })
    if (response.ok) {
      setOwnComment(await response.json())
      submitState.value = 'saved'
      await loadComments()
    } else if (response.status === 409) {
      if (ownComment.value) ownComment.value = { ...ownComment.value, canEdit: false }
      submitState.value = 'editSpent'
    } else if (response.status === 429) {
      submitState.value = 'rateLimited'
    } else {
      submitState.value = 'error'
    }
  } catch {
    submitState.value = 'error'
  }
}
