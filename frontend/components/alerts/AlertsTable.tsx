'use client'

import { useState } from 'react'
import type { Alert } from '@/types'

interface Props {
  alerts: Alert[]
  onResolve: (id: string) => Promise<void>
}

const TYPE_LABELS: Record<string, string> = {
  low_fuel: 'Combustible bajo',
  high_temp: 'Temperatura alta',
}

const TYPE_COLORS: Record<string, string> = {
  low_fuel: 'bg-red-100 text-red-700',
  high_temp: 'bg-orange-100 text-orange-700',
}

export default function AlertsTable({ alerts, onResolve }: Props) {
  const [resolving, setResolving] = useState<string | null>(null)

  async function handleResolve(id: string) {
    setResolving(id)
    try {
      await onResolve(id)
    } finally {
      setResolving(null)
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-4xl mb-3">✓</span>
        <p className="text-sm">Sin alertas activas</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
            <th className="pb-3 pr-4">Tipo</th>
            <th className="pb-3 pr-4">Vehículo</th>
            <th className="pb-3 pr-4">Mensaje</th>
            <th className="pb-3 pr-4">Fecha</th>
            <th className="pb-3 pr-4">Estado</th>
            <th className="pb-3">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {alerts.map(alert => (
            <tr key={alert.id} className={alert.resolved ? 'opacity-50' : ''}>

              {/* tipo */}
              <td className="py-3 pr-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[alert.type] ?? 'bg-gray-100 text-gray-700'}`}>
                  {TYPE_LABELS[alert.type] ?? alert.type}
                </span>
              </td>

              {/* vehículo — ya viene enmascarado del backend */}
              <td className="py-3 pr-4 font-mono text-xs text-gray-600">
                {alert.vehicle_id}
              </td>

              {/* mensaje */}
              <td className="py-3 pr-4 text-gray-700">
                {alert.message}
              </td>

              {/* fecha */}
              <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                {new Date(alert.created_at).toLocaleString('es-CO', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </td>

              {/* estado */}
              <td className="py-3 pr-4">
                {alert.resolved ? (
                  <span className="text-green-600 text-xs font-medium">Resuelta</span>
                ) : (
                  <span className="text-red-500 text-xs font-medium">Activa</span>
                )}
              </td>

              {/* acción */}
              <td className="py-3">
                {!alert.resolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolving === alert.id}
                    className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {resolving === alert.id ? 'Resolviendo...' : 'Resolver'}
                  </button>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}