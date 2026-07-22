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
 * Called by `classifiedUnlockSession` when the hub pushes `unlocked`. No-op if
 * already unlocked so a duplicate push never replays the popup.
 */
export function triggerClassifiedUnlock() {
  if (isClassifiedUnlocked.value) return
  unlockClassifiedSection()
  showUnlockPopup.value = true
}
