'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, BarChart3, Settings, LogOut, Video, Megaphone, UtensilsCrossed, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { useDashboardIndustryOptional } from '@/contexts/DashboardIndustryContext'

const navInmobiliario = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Llamadas', href: '/dashboard/calls', icon: Phone },
  { name: 'Campañas', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Probar Agente', href: '/dashboard/test-agent', icon: Video },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

const navRestaurante = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Llamadas', href: '/dashboard/calls', icon: Phone },
  { name: 'Pedidos', href: '/dashboard/pedidos', icon: UtensilsCrossed },
  { name: 'Reservaciones', href: '/dashboard/reservaciones', icon: Calendar },
  { name: 'Promociones', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Probar Agente', href: '/dashboard/test-agent', icon: Video },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const industryContext = useDashboardIndustryOptional()
  const industry = industryContext?.industry ?? 'restaurante'

  const navigation = useMemo(() => {
    if (industry === 'restaurante') return navRestaurante
    return navInmobiliario
  }, [industry])

  useEffect(() => {
    async function checkAdmin() {
      const admin = await isAdmin()
      setUserIsAdmin(admin)
    }
    checkAdmin()
  }, [])

  const handleLogout = async () => {
    window.location.href = '/login'
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">Voila Voice AI</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
        
        {/* Nota: Los admins ahora son redirigidos automáticamente a /admin */}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
