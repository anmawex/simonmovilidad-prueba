'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api/client'
import type { Alert, WSMessage } from '@/types'

export function useAlerts() {
  const [alerts, setAlerts]   = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // carga alertas activas desde la DB
  useEffect(() => {
    api.get<Alert[]>('/api/alerts')
      .then(setAlerts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // agrega alerta nueva que llega por WebSocket
  const addAlert = useCallback((msg: WSMessage) => {
    if (msg.event !== 'alert') return
    const alert = msg.payload as Alert
    setAlerts(prev => [alert, ...prev]) // más reciente primero
  }, [])

  // Resuelve una alerta (llama al backend y actualiza el estado local)
  const resolveAlert = useCallback(async (alertId: string) => {
    await api.patch(`/api/alerts/${alertId}/resolve`)
    setAlerts(prev =>
      prev.map(a => a.id === alertId ? { ...a, resolved: true } : a)
    )
  }, [])

  return { alerts, loading, error, addAlert, resolveAlert }
}