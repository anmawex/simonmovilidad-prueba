'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api/client'
import { saveToCache, getReadingsByVehicle, pruneOldReadings } from '@/lib/cache/db'
import { useOnlineStatus } from './useOnlineStatus'
import type { SensorReading } from '@/types'

export function useVehicleHistory(vehicleId: string, limit = 50) {
  const isOnline = useOnlineStatus()
  
  // inicializamos basándonos en si tenemos un vehicleId
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading]   = useState(!!vehicleId)
  const [error, setError]       = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

  // ajustamos estado durante el render si los inputs cambian
  // esto evita "cascading renders" al no usar useEffect para cambios síncronos
  const [prevVehicleId, setPrevVehicleId] = useState(vehicleId)
  const [prevIsOnline, setPrevIsOnline]   = useState(isOnline)

  if (vehicleId !== prevVehicleId || isOnline !== prevIsOnline) {
    setPrevVehicleId(vehicleId)
    setPrevIsOnline(isOnline)
    
    // reseteamos el estado inmediatamente durante la fase de render
    setLoading(!!vehicleId)
    setError(null)
    if (vehicleId !== prevVehicleId) {
      setReadings([]) // limpia historial si cambia de vehículo
    }
  }

  useEffect(() => {
    if (!vehicleId) return

    let ignore = false

    const fetchData = async () => {
      if (!isOnline) {
        // sin conexión: carga desde IndexedDB
        try {
          const data = await getReadingsByVehicle(vehicleId)
          if (!ignore) {
            setReadings(data)
            setFromCache(true)
            setLoading(false)
          }
        } catch {
          if (!ignore) {
            setError('Sin conexión y sin datos en caché')
            setLoading(false)
          }
        }
        return
      }

      // con conexión: fetch del backend
      try {
        const data = await api.get<SensorReading[]>(`/api/sensors/readings/${vehicleId}?limit=${limit}`)
        if (ignore) return
        
        const sorted = data.reverse()
        setReadings(sorted)
        setFromCache(false)
        setLoading(false)

        // operaciones de persistencia (no bloquean UI)
        await saveToCache('readings', sorted)
        await pruneOldReadings()
      } catch {
        if (ignore) return
        
        // si falla el fetch (ej: error 500), intenta desde IndexedDB
        const cached = await getReadingsByVehicle(vehicleId)
        if (!ignore) {
          setReadings(cached)
          setFromCache(true)
          if (cached.length === 0) setError('Error al conectar con el servidor')
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [vehicleId, isOnline, limit])

  // agrega lectura nueva en tiempo real y la persiste en IndexedDB
  const addReading = useCallback((reading: SensorReading) => {
    if (reading.vehicle_id !== vehicleId) return
    setReadings(prev => {
      const updated = [...prev.slice(-49), reading]
      saveToCache('readings', [reading]) // persiste el punto nuevo
      return updated
    })
  }, [vehicleId])

  return { readings, loading, error, fromCache, addReading }
}