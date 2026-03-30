'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import { simpleCache } from '@/lib/cache/simple'
import { useOnlineStatus } from './useOnlineStatus'
import type { Vehicle } from '@/types'

export function useVehicles() {
  const isOnline = useOnlineStatus()

  // inicializamos basándonos en el estado actual de conexión
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    () => simpleCache.getVehicles()
  )
  const [loading, setLoading] = useState(isOnline)
  const [fromCache, setFromCache] = useState(!isOnline)

  // ajustamos estado durante el render si isOnline cambia
  // esto evita cascading renders al no usar useEffect para cambios síncronos
  const [prevIsOnline, setPrevIsOnline] = useState(isOnline)
  if (isOnline !== prevIsOnline) {
    setPrevIsOnline(isOnline)
    // cambiamos el estado inmediatamente durante el render
    if (!isOnline) {
      setFromCache(true)
      setLoading(false)
    } else {
      setFromCache(false)
      setLoading(true)
    }
  }

  useEffect(() => {
    // si no estamos online, el estado ya se ajustó en el render
    if (!isOnline) return

    let ignore = false

    // con conexión: fetch del backend y actualiza caché
    api.get<Vehicle[]>('/api/vehicles')
      .then(data => {
        if (!ignore) {
          setVehicles(data)
          simpleCache.saveVehicles(data)
          simpleCache.setLastSync()
          setFromCache(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          // si el fetch falla, cae en caché
          setVehicles(simpleCache.getVehicles())
          setFromCache(true)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [isOnline])

  return { vehicles, loading, fromCache }
}