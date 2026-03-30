'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import type { SensorReading } from '@/types'

export function useVehicleHistory(vehicleId: string, limit = 50) {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading]   = useState(!!vehicleId)
  const [error, setError]       = useState<string | null>(null)

  // Sincronización de estado durante el renderizado para evitar cascading renders
  const [prevParams, setPrevParams] = useState({ vehicleId, limit })
  if (vehicleId !== prevParams.vehicleId || limit !== prevParams.limit) {
    setPrevParams({ vehicleId, limit })
    if (vehicleId) {
      setLoading(true)
      setError(null)
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!vehicleId) return

    let ignore = false

    api.get<SensorReading[]>(`/api/sensors/readings/${vehicleId}?limit=${limit}`)
      .then(data => {
        if (!ignore) setReadings(data.reverse())
      })
      .catch(err => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [vehicleId, limit])

  // Agrega lecturas en tiempo real desde el WebSocket
  function addReading(reading: SensorReading) {
    if (reading.vehicle_id !== vehicleId) return
    setReadings(prev => [...prev.slice(-49), reading]) // máximo 50 puntos
  }

  return { readings, loading, error, addReading }
}