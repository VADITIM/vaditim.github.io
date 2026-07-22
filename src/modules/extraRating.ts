import { ref } from 'vue'

import { API_BASE_URL } from './apiBaseUrl'
import { computeFingerprint } from './visitorFingerprint'

export interface RatingSummary {
  average: number
  count: number
  /** Votes per star, index 0 being one star — for a future breakdown bar. */
  distribution: number[]
}

export type RatingSubmitState = 'idle' | 'sending' | 'saved' | 'rateLimited' | 'error'

export const ratingSummary = ref<RatingSummary | null>(null)
export const ownRating = ref<number | null>(null)
export const ratingSubmitState = ref<RatingSubmitState>('idle')
export const isRatingUnavailable = ref(false)

export async function loadRatingSummary(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/ratings/summary`, { credentials: 'include' })
    if (!response.ok) throw new Error(`Rating summary responded ${response.status}`)
    ratingSummary.value = await response.json()
    isRatingUnavailable.value = false
  } catch (error) {
    console.error('[rating] summary load failed', error)
    isRatingUnavailable.value = true
  }
}

/** Called by `visitorSession` once identity resolves. */
export function setOwnRating(value: number | null): void {
  ownRating.value = value
}

/**
 * Unlike a comment this is an upsert — changing your mind is legitimate, so the
 * server updates the existing row rather than rejecting the second vote.
 */
export async function submitRating(value: number): Promise<void> {
  ratingSubmitState.value = 'sending'
  try {
    const response = await fetch(`${API_BASE_URL}/ratings`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, fingerprint: computeFingerprint() }),
    })
    if (response.ok) {
      const saved = await response.json()
      ownRating.value = saved.value
      ratingSummary.value = saved.summary
      ratingSubmitState.value = 'saved'
    } else if (response.status === 429) {
      ratingSubmitState.value = 'rateLimited'
    } else {
      ratingSubmitState.value = 'error'
    }
  } catch {
    ratingSubmitState.value = 'error'
  }
}
