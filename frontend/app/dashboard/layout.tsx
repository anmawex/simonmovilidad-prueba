'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 text-primary border-4 border-current border-t-transparent rounded-full" />
      </div>
    )
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard Resumen', icon: '📊' },
    { href: '/dashboard/map', label: 'Mapa en vivo', icon: '🗺️' },
    { href: '/dashboard/charts', label: 'Gráficos Históricos', icon: '📈' },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-secondary border-b border-border z-50">
        <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-300">
          Simón
        </p>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          {mobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-secondary/50 backdrop-blur-md border-r border-border p-5 gap-4 
        absolute md:relative z-40 h-[calc(100vh-64px)] md:h-screen transition-all shadow-xl
      `}>
        <div className="hidden md:block mb-8 px-2">
          <p className="text-2xl font-black tracking-tight text-white mb-1">
            Simón <span className="text-primary">App</span>
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Fleet Management
          </p>
        </div>

        <nav className="flex flex-col gap-2 flex-1 mt-4 md:mt-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}

          {user.role === 'admin' && (
            <>
              <div className="my-2 h-px bg-border w-full" />
              <p className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Admin</p>
              <Link 
                href="/dashboard/alerts" 
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${pathname === '/dashboard/alerts' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'text-muted-foreground hover:bg-muted hover:text-amber-400'}
                `}
              >
                <span className="text-lg">🚨</span>
                Centro de Alertas
              </Link>
            </>
          )}
        </nav>

        {/* User Card inside Sidebar */}
        <div className="mt-auto p-4 bg-muted/50 rounded-xl border border-border flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-sm font-bold text-black shadow-inner">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-400/10 hover:bg-red-400/20 py-2 rounded-lg transition-colors border border-red-400/20"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background md:p-8 p-4 relative">
        {/* Subtle grid background for the premium dev look */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}