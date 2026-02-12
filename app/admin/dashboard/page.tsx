'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getAdminStats, isAdmin } from '@/lib/admin'
import { Users, Phone, Clock, DollarSign, TrendingUp, Activity } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCalls: 0,
    totalMinutes: 0,
    estimatedRevenue: 0,
  })

  useEffect(() => {
    async function checkAdminAndLoadStats() {
      try {
        const admin = await isAdmin()
        
        if (!admin) {
          router.push('/dashboard')
          return
        }

        const adminStats = await getAdminStats()
        setStats(adminStats)
      } catch (error) {
        console.error('Error:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadStats()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-1">Gestión de clientes y usuarios de la plataforma SaaS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Usuarios Activos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Llamadas del Mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Llamadas del Mes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCalls}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Minutos Usados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Minutos Usados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatMinutes(stats.totalMinutes)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Ingresos Estimados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Estimados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.estimatedRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
              <p className="text-sm text-gray-600 mt-1">Ver y gestionar todos los usuarios</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </a>

        <a
          href="/admin/plans"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Planes</h3>
              <p className="text-sm text-gray-600 mt-1">Configurar planes y precios</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </a>

        <a
          href="/admin/usage"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tracking de Uso</h3>
              <p className="text-sm text-gray-600 mt-1">Ver uso detallado por usuario</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </a>
      </div>
    </div>
  )
}
