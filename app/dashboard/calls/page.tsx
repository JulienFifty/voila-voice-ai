'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Call } from '@/types/call'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Eye } from 'lucide-react'
import AudioPlayer from '@/components/AudioPlayer'
import CallDetailsModal from '@/components/CallDetailsModal'

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const supabase = createClient()

  const loadCalls = useCallback(async () => {
    try {
      // Intentar cargar desde Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Usuario autenticado: cargar datos reales de Supabase
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading calls from Supabase:', error)
          // Si hay error, cargar datos de prueba
          loadMockCalls()
        } else {
          setCalls(data || [])
        }
      } else {
        // Sin usuario: cargar datos de prueba para visualizar
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
    // Datos de prueba para visualizar el dashboard
    const mockCalls: Call[] = [
      {
        id: '1',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        phone_number: '+34 612 345 678',
        duration_seconds: 125, // 2:05 minutos
        status: 'answered',
        recording_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        transcript: 'Buenos días, llamo para consultar sobre el estado de mi pedido. Necesito saber cuándo llegará a mi domicilio. Mi número de pedido es el 12345. Gracias.',
        user_id: 'mock-user',
      },
      {
        id: '2',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        phone_number: '+34 698 765 432',
        duration_seconds: 180, // 3:00 minutos
        status: 'answered',
        recording_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        transcript: 'Hola, me gustaría solicitar información sobre los planes disponibles. Tengo algunas preguntas sobre las características y el precio. ¿Podrían enviarme más detalles?',
        user_id: 'mock-user',
      },
      {
        id: '3',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        phone_number: '+34 611 222 333',
        duration_seconds: 0,
        status: 'missed',
        recording_url: null,
        transcript: null,
        user_id: 'mock-user',
      },
      {
        id: '4',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        phone_number: '+34 644 555 666',
        duration_seconds: 320, // 5:20 minutos
        status: 'answered',
        recording_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        transcript: 'Buenas tardes, llamo porque tengo un problema con mi cuenta. No puedo acceder y me dice que mi contraseña es incorrecta. He intentado recuperarla varias veces pero no recibo el email. ¿Podrían ayudarme?',
        user_id: 'mock-user',
      },
      {
        id: '5',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        phone_number: '+34 677 888 999',
        duration_seconds: 95, // 1:35 minutos
        status: 'answered',
        recording_url: null,
        transcript: 'Hola, quería confirmar una cita para mañana a las 10 de la mañana. ¿Sigue disponible? Gracias.',
        user_id: 'mock-user',
      },
      {
        id: '6',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        phone_number: '+34 655 111 222',
        duration_seconds: 0,
        status: 'missed',
        recording_url: null,
        transcript: null,
        user_id: 'mock-user',
      },
    ]

    // Simular carga
    setTimeout(() => {
      setCalls(mockCalls)
      setLoading(false)
    }, 500)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium'
    if (status === 'answered') {
      return `${baseClasses} bg-green-100 text-green-800`
    }
    return `${baseClasses} bg-red-100 text-red-800`
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} min`
  }

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando llamadas...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Llamadas</h1>
          <p className="text-gray-600 mt-1">Gestiona todas tus llamadas</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-gray-900">{calls.length}</span> llamadas
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[25%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grabación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calls.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No hay llamadas registradas
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatRelativeTime(call.created_at)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(call.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.duration_seconds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(call.status)}>
                        {call.status === 'answered' ? 'Contestada' : 'Perdida'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {call.recording_url ? (
                        <AudioPlayer src={call.recording_url} />
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          No disponible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="text-primary hover:text-primary-dark inline-flex items-center space-x-1 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  )
}
