'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-800">
        Bienvenido, {user?.email}
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/map" className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
          <p className="text-2xl mb-2">🗺️</p>
          <p className="font-medium text-gray-800">Mapa en vivo</p>
          <p className="text-sm text-gray-400 mt-1">Ubicaciones de la flota en tiempo real</p>
        </Link>

        <Link href="/dashboard/charts" className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
          <p className="text-2xl mb-2">📊</p>
          <p className="font-medium text-gray-800">Gráficos</p>
          <p className="text-sm text-gray-400 mt-1">Historial de velocidad y combustible</p>
        </Link>

        {user?.role === 'admin' && (
          <Link href="/dashboard/alerts" className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow border border-yellow-200">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="font-medium text-gray-800">Alertas</p>
            <p className="text-sm text-gray-400 mt-1">Panel de alertas predictivas</p>
          </Link>
        )}
      </div>
    </div>
  )
}