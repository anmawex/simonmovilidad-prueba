'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading || !user) return null

  return (
    <div className="min-h-screen flex">
      {/* sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col p-4 gap-2">
        <p className="text-lg font-semibold mb-4">Simon Movilidad</p>

        <Link href="/dashboard"        className="nav-link">Dashboard</Link>
        <Link href="/dashboard/map"    className="nav-link">Mapa en vivo</Link>
        <Link href="/dashboard/charts" className="nav-link">Gráficos</Link>

        {/* Solo visible para admin */}
        {user.role === 'admin' && (
          <Link href="/dashboard/alerts" className="nav-link text-yellow-400">
            Alertas
          </Link>
        )}

        <div className="mt-auto">
          <p className="text-xs text-gray-400 mb-2">{user.email}</p>
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* contenido */}
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  )
}