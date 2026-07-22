import { ref } from 'vue'

const STORAGE_KEY = 'classified-section-unlocked'

/**
 * Read synchronously at module load so the section never flashes locked before the
 * server answers. A cache, not the source of truth — `applyServerUnlockState`
 * overwrites it as soon as `visitorSession` resolves.
 */
export const isClassifiedUnlocked = ref(localStorage.getItem(STORAGE_KEY) === 'true')

/** Drives the "Section Unlocked!" popup; set true once, dismissed by the popup itself. */
export const showUnlockPopup = ref(false)

export function unlockClassifiedSection() {
  isClassifiedUnlocked.value = true
  localStorage.setItem(STORAGE_KEY, 'true')
}

/** The server's answer wins over the cached flag in both directions. */
export function applyServerUnlockState(isUnlocked: boolean) {
  isClassifiedUnlocked.value = isUnlocked
  if (isUnlocked) localStorage.setItem(STORAGE_KEY, 'true')
  else localStorage.removeItem(STORAGE_KEY)
}

/**
 * Called by `classifiedUnlockSession` once the unlock is persisted against this
 * visitor. Only raises the popup — the section itself joins the nav on confirm, so
 * the new entry lands as the reward for the press instead of behind the overlay.
 * No-op if already unlocked so a duplicate push never replays the popup.
 */
export function triggerClassifiedUnlock() {
  if (isClassifiedUnlocked.value) return
  showUnlockPopup.value = true
}

/** The confirm press: activates the section, which is what mounts its nav entry. */
export function confirmClassifiedUnlock() {
  showUnlockPopup.value = false
  unlockClassifiedSection()
}
