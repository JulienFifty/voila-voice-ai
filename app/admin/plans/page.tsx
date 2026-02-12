'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { DollarSign } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price_monthly: number
  max_minutes_per_month: number | null
  max_calls_per_month: number | null
  max_leads: number | null
}

export default function AdminPlansPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    async function load() {
      try {
        const admin = await isAdmin()
        if (!admin) {
          router.push('/dashboard')
          return
        }
        const res = await fetch('/api/admin/plans')
        if (!res.ok) throw new Error('Error cargando planes')
        const data = await res.json()
        setPlans(data.plans || [])
      } catch (e) {
        console.error(e)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Cargando planes...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Planes</h1>
        <p className="text-gray-600 mt-1">Planes disponibles para clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${plan.price_monthly}/mes</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Minutos: {plan.max_minutes_per_month ?? 'Ilimitado'}</p>
              <p>Llamadas: {plan.max_calls_per_month ?? 'Ilimitado'}</p>
              <p>Leads: {plan.max_leads ?? 'Ilimitado'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}