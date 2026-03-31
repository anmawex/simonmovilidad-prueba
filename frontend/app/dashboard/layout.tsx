'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import OfflineBanner from '@/components/ui/OfflineBanner'
import {
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  Truck
} from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Cierra el sidebar cada vez que la ruta cambia
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false)
  }, [pathname])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 text-primary border-4 border-current border-t-transparent rounded-full" />
      </div>
    )
  }

  const navLinks = [
    { href: '/dashboard',        label: 'Dashboard Resumen',  icon: LayoutDashboard },
    { href: '/dashboard/map',    label: 'Mapa en vivo',        icon: MapIcon },
    { href: '/dashboard/charts', label: 'Gráficos Históricos', icon: BarChart3 },
  ]

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">

      {/* ── MOBILE TOPBAR ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-secondary border-b border-border z-40 shrink-0">
        <p className="text-lg font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Simón <span className="text-primary">App</span>
        </p>
        <button
          aria-label="Abrir menú"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ── BACKDROP (oscurece el contenido en móvil) ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-50
        md:static md:w-64 md:h-screen md:shrink-0
        flex flex-col
        bg-secondary/95 md:bg-secondary/50 backdrop-blur-md
        border-r border-border p-5 gap-4 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Logo + close */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            <p className="text-xl font-black tracking-tight text-white">
              Simón <span className="text-primary">App</span>
            </p>
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="px-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Fleet Management
        </p>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 flex-1 mt-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}

          {user.role === 'admin' && (
            <>
              <div className="my-2 h-px bg-border w-full" />
              <p className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Admin</p>
              <Link
                href="/dashboard/alerts"
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${pathname === '/dashboard/alerts'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'text-muted-foreground hover:bg-muted hover:text-amber-400'}
                `}
              >
                <Bell className={`w-5 h-5 shrink-0 ${pathname === '/dashboard/alerts' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <span className="truncate">Centro de Alertas</span>
              </Link>
            </>
          )}
        </nav>

        {/* User Card */}
        <div className="mt-auto p-4 bg-muted/50 rounded-xl border border-border flex flex-col gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-sm font-bold text-black">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-400/10 hover:bg-red-400/20 py-2.5 rounded-lg transition-colors border border-red-400/20"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8 relative">
        <OfflineBanner />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}