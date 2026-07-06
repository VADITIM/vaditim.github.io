/**
 * Dev-only debug shortcut: pressing "1" wipes localStorage, sessionStorage,
 * cookies, and the Cache Storage API for this origin, then reloads; a fast
 * way to reset locked/unlocked section state and any other persisted state
 * while iterating. Never registered in production builds.
 */
async function clearSiteData() {
  localStorage.clear()
  sessionStorage.clear()

  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (!name) return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })

  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }

  window.location.reload()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== '1') return
  if (event.target instanceof HTMLElement) {
    const tag = event.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return
  }
  clearSiteData()
}

export function registerDebugCacheClear() {
  if (!import.meta.env.DEV) return () => {}

  window.addEventListener('keydown', handleKeydown)
  return () => window.removeEventListener('keydown', handleKeydown)
}
