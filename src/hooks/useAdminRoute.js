import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}
export function useAdminRoute() {
  return useSyncExternalStore(subscribe, () => window.location.hash === '#/admin', () => false)
}
