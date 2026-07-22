/**
 * Site traffic, shown as a GitHub-contributions-style calendar. Each visitor can
 * contribute at most one point per 6-hour window per day — the server enforces
 * this, the module just fires once per page load and trusts the response.
 */

import { ref } from 'vue'

import { API_BASE_URL } from './apiBaseUrl'
import { computeCoarseFingerprint, computeFingerprint } from './visitorFingerprint'

export interface HeatmapDay {
  date: string
  count: number
}

export const heatmapDays = ref<HeatmapDay[]>([])

export async function loadHeatmapSummary(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/heatmap/summary`, { credentials: 'include' })
    if (!response.ok) throw new Error(`Heatmap summary responded ${response.status}`)
    heatmapDays.value = await response.json()
  } catch (error) {
    console.error('[heatmap] summary load failed', error)
  }
}

/** Fire-and-forget: worth recording the visit, never worth blocking or retrying it. */
export async function recordHeatmapVisit(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/heatmap`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint: computeFingerprint(), coarseFingerprint: computeCoarseFingerprint() }),
    })
    if (!response.ok) throw new Error(`Heatmap point responded ${response.status}`)
    const saved = await response.json()
    heatmapDays.value = saved.days
  } catch (error) {
    console.error('[heatmap] recording the visit failed', error)
  }
}
