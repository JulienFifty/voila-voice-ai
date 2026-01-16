'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Call } from '@/types/call'
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale/es'
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function DashboardPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')
  const supabase = createClient()

  const loadCalls = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading calls:', error)
          loadMockCalls()
        } else {
          setCalls(data || [])
        }
      } else {
        loadMockCalls()
      }
    } catch (error) {
      console.error('Error loading calls:', error)
      loadMockCalls()
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadCalls()
  }, [loadCalls])

  const loadMockCalls = () => {
    // Generar datos de prueba para el dashboard
    const today = new Date()
    const mockCalls: Call[] = []
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const callCount = Math.floor(Math.random() * 5) + 1
      for (let j = 0; j < callCount; j++) {
        const callDate = new Date(date)
        callDate.setHours(Math.floor(Math.random() * 24))
        callDate.setMinutes(Math.floor(Math.random() * 60))
        
        mockCalls.push({
          id: `${i}-${j}`,
          created_at: callDate.toISOString(),
          phone_number: i % 5 === 0 ? 'Web Call' : `+34 6${Math.floor(Math.random() * 90000000) + 10000000}`,
          duration_seconds: Math.floor(Math.random() * 600) + 30,
          status: Math.random() > 0.2 ? 'answered' : 'missed',
          recording_url: Math.random() > 0.3 ? `https://example.com/recording-${i}-${j}.mp3` : null,
          transcript: Math.random() > 0.4 ? `Transcripción de la llamada ${i}-${j}...` : null,
          user_id: 'user-1',
        })
      }
    }
    
    setCalls(mockCalls.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
  }

  // Calcular métricas
  const getTimeRangeDates = () => {
    const now = new Date()
    switch (timeRange) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now, { locale: es }), end: endOfWeek(now, { locale: es }) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const filteredCalls = calls.filter((call) => {
    const { start, end } = getTimeRangeDates()
    const callDate = new Date(call.created_at)
    return callDate >= start && callDate <= end
  })

  const totalCalls = filteredCalls.length
  const answeredCalls = filteredCalls.filter((c) => c.status === 'answered').length
  const missedCalls = filteredCalls.filter((c) => c.status === 'missed').length
  const totalDuration = filteredCalls.reduce((sum, c) => sum + c.duration_seconds, 0)
  const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0
  const answerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0

  // Llamadas de hoy
  const todayCalls = calls.filter((call) => {
    const callDate = new Date(call.created_at)
    const today = startOfDay(new Date())
    return callDate >= today
  })

  // Actividades recientes (últimas 10)
  const recentActivities = calls.slice(0, 10)

  // Datos para gráficos de tendencias
  const getTrendsData = () => {
    const { start, end } = getTimeRangeDates()
    const days = []
    const now = new Date(start)
    
    while (now <= end) {
      days.push(format(now, 'yyyy-MM-dd'))
      now.setDate(now.getDate() + 1)
    }

    return days.map((day) => {
      const dayCalls = filteredCalls.filter((call) => {
        return format(new Date(call.created_at), 'yyyy-MM-dd') === day
      })

      return {
        fecha: format(new Date(day), 'dd/MM', { locale: es }),
        Contestadas: dayCalls.filter((c) => c.status === 'answered').length,
        Perdidas: dayCalls.filter((c) => c.status === 'missed').length,
        Total: dayCalls.length,
      }
    })
  }

  // Datos para gráfico de estado
  const statusData = [
    { name: 'Contestadas', value: answeredCalls, color: '#10b981' },
    { name: 'Perdidas', value: missedCalls, color: '#ef4444' },
  ]

  // Datos para gráfico de llamadas por hora (hoy)
  const getHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map((hour) => {
      const hourCalls = todayCalls.filter((call) => {
        const callHour = new Date(call.created_at).getHours()
        return callHour === hour
      })

      return {
        hora: `${hour}:00`,
        Llamadas: hourCalls.length,
      }
    })
  }

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard General</h1>
          <p className="text-gray-600 mt-1">Resumen completo de tus llamadas y actividad</p>
        </div>

        {/* Selector de período */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === 'day' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas generales (KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Llamadas"
          value={totalCalls}
          icon={Phone}
          trend={totalCalls > 0 ? '+12%' : '0%'}
          color="blue"
        />
        <MetricCard
          title="Llamadas Contestadas"
          value={answeredCalls}
          icon={PhoneCall}
          trend={`${answerRate}%`}
          color="green"
        />
        <MetricCard
          title="Llamadas Perdidas"
          value={missedCalls}
          icon={PhoneOff}
          trend={`${totalCalls > 0 ? Math.round((missedCalls / totalCalls) * 100) : 0}%`}
          color="red"
        />
        <MetricCard
          title="Duración Promedio"
          value={`${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, '0')}`}
          icon={Clock}
          trend=""
          color="purple"
        />
      </div>

      {/* Resumen del día */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Resumen del Día</span>
          </h2>
          <span className="text-sm text-gray-500">{format(new Date(), 'dd MMMM yyyy', { locale: es })}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Llamadas Hoy</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{todayCalls.length}</div>
            <div className="text-xs text-blue-600 mt-1">
              {todayCalls.filter((c) => c.status === 'answered').length} contestadas
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Duración Total</div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {Math.floor(todayCalls.reduce((sum, c) => sum + c.duration_seconds, 0) / 60)}
            </div>
            <div className="text-xs text-green-600 mt-1">minutos</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Tasa de Respuesta</div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {todayCalls.length > 0
                ? Math.round((todayCalls.filter((c) => c.status === 'answered').length / todayCalls.length) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-purple-600 mt-1">del total</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias de llamadas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Tendencias de Llamadas</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTrendsData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Contestadas" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Perdidas" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de llamadas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Distribución de Llamadas</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Llamadas por hora (hoy) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Llamadas por Hora (Hoy)</span>
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getHourlyData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Llamadas" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Actividades recientes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Actividades Recientes</span>
        </h2>
        <div className="space-y-3">
          {recentActivities.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    call.status === 'answered' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {call.phone_number === 'Web Call' ? '📞 Llamada Web' : call.phone_number}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(call.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {Math.floor(call.duration_seconds / 60)}:{(call.duration_seconds % 60).toString().padStart(2, '0')}
                </div>
                <div
                  className={`text-xs ${
                    call.status === 'answered' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {call.status === 'answered' ? 'Contestada' : 'Perdida'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente de tarjeta de métrica
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string
  value: string | number
  icon: any
  trend: string
  color: 'blue' | 'green' | 'red' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm font-medium mt-1 ${colorClasses[color].replace('bg-', 'text-').replace('-50', '-600')}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
