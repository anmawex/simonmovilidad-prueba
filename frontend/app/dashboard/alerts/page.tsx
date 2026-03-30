'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAlerts } from '@/hooks/useAlerts'
import { useWebSocket } from '@/hooks/useWebSocket'
import AlertsTable from '@/components/alerts/AlertsTable'
import type { WSMessage } from '@/types'

export default function AlertsPage() {
  const { user, loading: loadingAuth } = useAuth()
  const router = useRouter()

  // redirige si no es admin
  useEffect(() => {
    if (!loadingAuth && user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, loadingAuth])

  const { alerts, loading, error, addAlert, resolveAlert } = useAlerts()

  // recibe alertas nuevas por WebSocket en tiempo real
  const handleMessage = useCallback((msg: WSMessage) => {
    addAlert(msg)
  }, [addAlert])

  useWebSocket(handleMessage)

  // contadores para el resumen
  const activeCount   = alerts.filter(a => !a.resolved).length
  const resolvedCount = alerts.filter(a => a.resolved).length
  const fuelCount     = alerts.filter(a => a.type === 'low_fuel' && !a.resolved).length

  if (loadingAuth || !user) return null

  return (
    <div className="flex flex-col gap-6">

      {/* encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Panel de alertas</h1>
        <span className="text-xs text-gray-400">Solo visible para administradores</span>
      </div>

      {/* tarjetas de resumen */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="Alertas activas"
          value={activeCount}
          color={activeCount > 0 ? 'red' : 'green'}
        />
        <SummaryCard
          label="Combustible crítico"
          value={fuelCount}
          color={fuelCount > 0 ? 'amber' : 'green'}
        />
        <SummaryCard
          label="Resueltas"
          value={resolvedCount}
          color="gray"
        />
      </div>

      {/* tabla */}
      <div className="bg-white rounded-xl shadow p-6">
        {loading && (
          <p className="text-gray-400 text-sm">Cargando alertas...</p>
        )}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        {!loading && !error && (
          <AlertsTable alerts={alerts} onResolve={resolveAlert} />
        )}
      </div>

    </div>
  )
}

function SummaryCard({
  label, value, color
}: {
  label: string
  value: number
  color: 'red' | 'amber' | 'green' | 'gray'
}) {
  const colors = {
    red:   'bg-red-50   text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
    gray:  'bg-gray-50  text-gray-700',
  }

  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  )
}