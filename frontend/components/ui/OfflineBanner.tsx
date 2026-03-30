'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { simpleCache } from '@/lib/cache/simple'

export default function OfflineBanner() {
  const isOnline  = useOnlineStatus()
  const lastSync  = simpleCache.getLastSync()

  if (isOnline) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
      <span className="text-amber-500 text-lg">⚠</span>
      <div>
        <p className="font-medium text-amber-800">Sin conexión</p>
        <p className="text-amber-600 text-xs">
          Mostrando datos en caché
          {lastSync && ` · última sincronización: ${new Date(lastSync).toLocaleTimeString('es-CO')}`}
        </p>
      </div>
    </div>
  )
}