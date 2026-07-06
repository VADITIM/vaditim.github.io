import { ref } from 'vue'

const STORAGE_KEY = 'classified-section-unlocked'

/** Persists across visits so a returning visitor keeps the section without rescanning. */
export const isClassifiedUnlocked = ref(localStorage.getItem(STORAGE_KEY) === 'true')

/** Drives the "Section Unlocked!" popup; set true once, dismissed by the popup itself. */
export const showUnlockPopup = ref(false)

export function unlockClassifiedSection() {
  isClassifiedUnlocked.value = true
  localStorage.setItem(STORAGE_KEY, 'true')
}

/**
 * Placeholder for the real QR-scan unlock (see TASKS.md "Classified Section; QR
 * code unlock"). Wired to a click for now; swap the call site for the SignalR
 * `unlocked` event handler once the backend lands. No-op if already unlocked
 * so re-triggering (e.g. a second click) never replays the popup.
 */
export function triggerClassifiedUnlock() {
  if (isClassifiedUnlocked.value) return
  unlockClassifiedSection()
  showUnlockPopup.value = true
}
