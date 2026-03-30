'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import type { Vehicle } from '@/types'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get<Vehicle[]>('/api/vehicles')
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { vehicles, loading }
}