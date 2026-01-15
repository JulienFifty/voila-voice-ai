'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Call } from '@/types/call'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Phone, Clock, CheckCircle } from 'lucide-react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale/es'

export default function AnalyticsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCalls()
  }, [])

  const loadCalls = async () => {
    try {
      // Datos de prueba para Analytics
      const today = new Date()
      const mockCalls: Call[] = []
      
      // Generar llamadas para los últimos 7 días
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        // Variar el número de llamadas por día
        const callsCount = Math.floor(Math.random() * 8) + 2 // Entre 2 y 9 llamadas por día
        
        for (let j = 0; j < callsCount; j++) {
          const callTime = new Date(date)
          callTime.setHours(Math.floor(Math.random() * 12) + 9) // Entre 9 AM y 9 PM
          callTime.setMinutes(Math.floor(Math.random() * 60))
          
          mockCalls.push({
            id: `mock-${i}-${j}`,
            created_at: callTime.toISOString(),
            phone_number: `+34 ${Math.floor(Math.random() * 900) + 600} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
            duration_seconds: Math.floor(Math.random() * 300) + 60, // Entre 1 y 6 minutos
            status: Math.random() > 0.2 ? 'answered' : 'missed', // 80% contestadas
            recording_url: Math.random() > 0.3 ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : null,
            transcript: Math.random() > 0.3 ? 'Transcripción de ejemplo de la llamada.' : null,
            user_id: 'mock-user',
          })
        }
      }

      // Simular carga
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCalls(mockCalls)

      /* Código original para cuando tengas Supabase configurado:
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      setCalls(data || [])
      */
    } catch (error) {
      console.error('Error loading calls:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estadísticas
  const totalCallsThisMonth = calls.length

  const answeredCalls = calls.filter((c) => c.status === 'answered').length
  const responseRate =
    totalCallsThisMonth > 0
      ? ((answeredCalls / totalCallsThisMonth) * 100).toFixed(1)
      : '0'

  const totalDuration = calls.reduce((sum, call) => sum + call.duration_seconds, 0)
  const averageDuration =
    totalCallsThisMonth > 0
      ? Math.round(totalDuration / totalCallsThisMonth)
      : 0

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Preparar datos para la gráfica (últimos 7 días)
  const getLast7DaysData = () => {
    const today = new Date()
    const sevenDaysAgo = subDays(today, 6)
    const days = eachDayOfInterval({ start: sevenDaysAgo, end: today })

    return days.map((day) => {
      const dayStart = format(day, 'yyyy-MM-dd')
      const dayCalls = calls.filter((call) =>
        call.created_at.startsWith(dayStart)
      )
      return {
        date: format(day, 'dd/MM', { locale: es }),
        llamadas: dayCalls.length,
      }
    })
  }

  const chartData = getLast7DaysData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Estadísticas y métricas de tus llamadas
        </p>
      </div>

      {/* Resumen rápido */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Estos son datos de ejemplo para visualizar el dashboard. 
          Cuando conectes Supabase, los datos se cargarán automáticamente desde tu base de datos.
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total llamadas (último mes)
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalCallsThisMonth}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Phone className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Duración promedio
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatDuration(averageDuration)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tasa de respuesta
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {responseRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de llamadas por día */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Llamadas por día (últimos 7 días)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="llamadas"
              stroke="#3B82F6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
