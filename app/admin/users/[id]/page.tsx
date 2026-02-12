'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { Mail, Activity, CheckCircle, XCircle, Clock, PhoneCall, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

interface Plan {
  id: string
  name: string
  price_monthly: number
}

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        const admin = await isAdmin()
        if (!admin) {
          router.push('/dashboard')
          return
        }

        const [userRes, plansRes] = await Promise.all([
          fetch(`/api/admin/users/${userId}`),
          fetch('/api/admin/plans'),
        ])

        if (!userRes.ok) throw new Error('Error obteniendo usuario')
        if (!plansRes.ok) throw new Error('Error obteniendo planes')

        const userData = await userRes.json()
        const plansData = await plansRes.json()

        setUser(userData.user)
        setPlans(plansData.plans)

        const currentPlanId = userData.user.user_subscriptions?.[0]?.plan_id || ''
        setSelectedPlan(currentPlanId)
      } catch (error) {
        console.error(error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
  }, [router, userId])

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

  const toggleActive = async (active: boolean) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      setUser((prev: any) => ({ ...prev, active }))
    } catch (error) {
      console.error(error)
      alert('No se pudo actualizar el estado')
    } finally {
      setSaving(false)
    }
  }

  const changePlan = async () => {
    if (!selectedPlan) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: selectedPlan }),
      })
      if (!res.ok) throw new Error('No se pudo cambiar el plan')
      alert('Plan actualizado')
    } catch (error) {
      console.error(error)
      alert('No se pudo cambiar el plan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Cargando usuario...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-red-600">Usuario no encontrado</div>
      </div>
    )
  }

  const currentPlan = user.user_subscriptions?.[0]?.plans

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cliente</h1>
          <p className="text-gray-600 mt-1">Gestiona este cliente de la plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          {user.active ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" /> Activo
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <XCircle className="w-4 h-4 mr-1" /> Inactivo
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg shadow p-4">
        <div className="space-y-2">
          <p className="text-xs uppercase text-gray-500">Email</p>
          <div className="flex items-center gap-2 text-gray-900">
            <Mail className="w-4 h-4" /> {user.email}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase text-gray-500">Registro</p>
          <div className="text-gray-900">
            {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase text-gray-500">Rol</p>
          <div className="flex items-center gap-2 text-gray-900">
            <Shield className="w-4 h-4" /> {user.role}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">Plan actual</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentPlan?.name || 'Sin plan'}
              </p>
              {currentPlan && (
                <p className="text-sm text-gray-600">{formatCurrency(currentPlan.price_monthly)}/mes</p>
              )}
            </div>
            <div>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Selecciona plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({formatCurrency(plan.price_monthly)}/mes)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={changePlan}
            disabled={!selectedPlan || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Cambiar plan'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <p className="text-xs uppercase text-gray-500">Estado de la cuenta</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleActive(true)}
              disabled={saving || user.active}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Activar
            </button>
            <button
              onClick={() => toggleActive(false)}
              disabled={saving || !user.active}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Desactivar
            </button>
          </div>
          <p className="text-sm text-gray-600">Activar/desactivar acceso del cliente.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-xs uppercase text-gray-500 mb-2">Uso del mes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Minutos
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatMinutes(user.monthlyUsage?.total_minutes || 0)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <PhoneCall className="w-4 h-4" /> Llamadas
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {user.monthlyUsage?.total_calls || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Activity className="w-4 h-4" /> Estado
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {user.active ? 'Activo' : 'Inactivo'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}