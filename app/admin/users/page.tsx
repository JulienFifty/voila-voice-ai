'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllUsers, isAdmin } from '@/lib/admin'
import { Users, Mail, Calendar, Clock, Phone, DollarSign, Eye, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

interface User {
  id: string
  user_id: string
  email: string
  full_name: string | null
  company_name: string | null
  role: string
  active: boolean
  created_at: string
  user_subscriptions: Array<{
    plans: {
      name: string
      slug: string
      price_monthly: number
    } | null
  }>
  monthlyUsage: {
    total_minutes: number
    total_calls: number
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    async function loadUsers() {
      try {
        const admin = await isAdmin()
        
        if (!admin) {
          console.log('Usuario no es admin')
          alert('No tienes permisos de administrador. Verifica que tengas el rol "admin" en tu perfil en Supabase.')
          router.push('/dashboard')
          return
        }

        const allUsers = await getAllUsers()
        setUsers(allUsers)
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}. Verifica la consola para más detalles.`)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [router])

  const filteredUsers = users.filter(user => {
    if (filter === 'active') return user.active
    if (filter === 'inactive') return !user.active
    return true
  })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra todos los clientes de la plataforma SaaS</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Total: <span className="font-semibold">{users.length}</span> usuarios
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Todos ({users.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Activos ({users.filter(u => u.active).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'inactive'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Inactivos ({users.filter(u => !u.active).length})
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso del Mes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.company_name && (
                          <div className="text-xs text-gray-400">
                            {user.company_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.user_subscriptions && user.user_subscriptions.length > 0 ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.user_subscriptions[0].plans?.name || 'Sin plan'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(user.user_subscriptions[0].plans?.price_monthly || 0)}/mes
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatMinutes(user.monthlyUsage?.total_minutes || 0)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.monthlyUsage?.total_calls || 0} llamadas
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                        {user.role !== 'user' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role === 'admin' ? 'Admin' : 'Super Admin'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/users/${user.user_id}`)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
