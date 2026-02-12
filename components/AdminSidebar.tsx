'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Users, Shield, DollarSign, TrendingUp, Settings, LogOut, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
  { name: 'Planes', href: '/admin/plans', icon: DollarSign },
  { name: 'Uso', href: '/admin/usage', icon: TrendingUp },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">Voila Admin</h1>
        </div>
        <p className="text-sm text-gray-400 mt-1">Panel de Control</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
