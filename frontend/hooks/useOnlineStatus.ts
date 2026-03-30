'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true // supone que está online en el servidor
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  return isOnline
}