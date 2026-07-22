import { ref } from 'vue'

import { API_BASE_URL } from './apiBaseUrl'

export interface CommentEntry {
  id: number
  name: string
  text: string
  createdAtUtc: string
}

export type CommentSubmitState = 'idle' | 'sending' | 'sent' | 'alreadyPosted' | 'rateLimited' | 'error'

export const comments = ref<CommentEntry[]>([])
export const ownComment = ref<CommentEntry | null>(null)
export const submitState = ref<CommentSubmitState>('idle')
export const isCommentsLoaded = ref(false)
export const isCommentsUnavailable = ref(false)

export async function loadComments(): Promise<void> {
  try {
    const [listResponse, mineResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/comments/`, { credentials: 'include' }),
      fetch(`${API_BASE_URL}/comments/mine`, { credentials: 'include' }),
    ])
    if (!listResponse.ok) throw new Error(`Comments list responded ${listResponse.status}`)
    comments.value = await listResponse.json()
    ownComment.value = mineResponse.ok ? await mineResponse.json() : null
    isCommentsUnavailable.value = false
    isCommentsLoaded.value = true
  } catch (error) {
    console.error('[comments] load failed', error)
    isCommentsUnavailable.value = true
    isCommentsLoaded.value = true
  }
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
      ownComment.value = await response.json()
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

// Weak identity signal, deliberately hand-rolled — deters casual double-posting only.
function computeFingerprint(): string {
  const signals = [
    getWebglRenderer(),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    `${window.devicePixelRatio}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    `${navigator.hardwareConcurrency}`,
    navigator.platform,
  ]
  return hashString(signals.join('||'))
}

function getWebglRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) return 'no-webgl'
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    return debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : 'masked'
  } catch {
    return 'webgl-error'
  }
}

function hashString(input: string): string {
  let hashA = 0x811c9dc5
  let hashB = 0x1000193
  for (let index = 0; index < input.length; index++) {
    const code = input.charCodeAt(index)
    hashA = Math.imul(hashA ^ code, 0x01000193)
    hashB = Math.imul(hashB + code, 0x85ebca6b) ^ (hashB >>> 13)
  }
  return (hashA >>> 0).toString(16).padStart(8, '0') + (hashB >>> 0).toString(16).padStart(8, '0')
}
