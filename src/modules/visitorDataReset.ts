import { API_BASE_URL } from './apiBaseUrl'

/**
 * Erases every trace of this visitor: their guestbook comment and identity cookie on the
 * server, and the unlock flag in local storage. Reloads so every module re-reads a clean
 * slate — notably the classified section, which locks itself again.
 */
export async function deleteAllVisitorData(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/visitor`, { method: 'DELETE', credentials: 'include' })
  } catch (error) {
    // Local state is still worth clearing even when the API is unreachable.
    console.error('[visitor] server-side delete failed', error)
  }

  localStorage.clear()
  sessionStorage.clear()
  window.location.reload()
}
