'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Call } from '@/types/call'
import { CallWithRealtyData } from '@/types/realty'
import { Database } from '@/types/database'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Eye, Search } from 'lucide-react'
import AudioPlayer from '@/components/AudioPlayer'
import CallDetailsModal from '@/components/CallDetailsModal'
import CallFiltersComponent, { CallFilters } from '@/components/llamadas/CallFilters'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { UrgencyIndicator } from '@/components/shared/UrgencyIndicator'
import { TipoInteresBadge } from '@/components/shared/TipoInteresBadge'
import { FormattedCurrency } from '@/components/shared/FormattedCurrency'

export default function CallsPage() {
  const [calls, setCalls] = useState<CallWithRealtyData[]>([])
  const [filteredCalls, setFilteredCalls] = useState<CallWithRealtyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [filters, setFilters] = useState<CallFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
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
          // Transformar datos a CallWithRealtyData
          const callsWithRealty = (data || []).map((call: any) => ({
            ...call,
            extracted_data: call.extracted_data as any,
            tipo_interes: call.tipo_interes as any,
            zona_interes: call.zona_interes || null,
            presupuesto_min: call.presupuesto_min || null,
            presupuesto_max: call.presupuesto_max || null,
            urgencia: call.urgencia as any,
            score: call.score as any,
            converted_to_lead: call.converted_to_lead || false,
          }))
          setCalls(callsWithRealty as CallWithRealtyData[])
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
      setCalls(mockCalls as CallWithRealtyData[])
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

  // Extraer nombre del prospecto desde extracted_data o transcripción
  const getProspectName = (call: CallWithRealtyData): string => {
    if (call.extracted_data?.nombre) {
      return call.extracted_data.nombre
    }
    // Intentar extraer de transcripción
    if (call.transcript) {
      const nameMatch = call.transcript.match(/(?:mi nombre es|me llamo|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i)
      if (nameMatch) return nameMatch[1]
    }
    return '-'
  }

  // Filtrar llamadas
  useEffect(() => {
    let filtered = [...calls]

    // Filtro por tipo de interés
    if (filters.tipoInteres) {
      filtered = filtered.filter((call) => call.tipo_interes === filters.tipoInteres)
    }

    // Filtro por score
    if (filters.score) {
      filtered = filtered.filter((call) => call.score === filters.score)
    }

    // Filtro por urgencia
    if (filters.urgencia) {
      filtered = filtered.filter((call) => call.urgencia === filters.urgencia)
    }

    // Filtro por zona
    if (filters.zona) {
      filtered = filtered.filter(
        (call) =>
          call.zona_interes?.some((zona) =>
            zona.toLowerCase().includes(filters.zona!.toLowerCase())
          ) || call.transcript?.toLowerCase().includes((filters.zona ?? '').toLowerCase())
      )
    }

    // Filtro por fecha desde
    if (filters.fechaDesde) {
      filtered = filtered.filter(
        (call) => new Date(call.created_at) >= new Date(filters.fechaDesde!)
      )
    }

    // Filtro por fecha hasta
    if (filters.fechaHasta) {
      filtered = filtered.filter(
        (call) => new Date(call.created_at) <= new Date(filters.fechaHasta!)
      )
    }

    // Búsqueda general
    if (searchQuery || filters.busqueda) {
      const query = (searchQuery || filters.busqueda || '').toLowerCase()
      filtered = filtered.filter(
        (call) =>
          call.phone_number.toLowerCase().includes(query) ||
          getProspectName(call).toLowerCase().includes(query) ||
          call.transcript?.toLowerCase().includes(query) ||
          call.zona_interes?.some((zona) => zona.toLowerCase().includes(query))
      )
    }

    setFilteredCalls(filtered)
  }, [calls, filters, searchQuery])

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
          <p className="text-gray-600 mt-1">Gestiona todas tus llamadas inmobiliarias</p>
        </div>
        <div className="text-sm text-gray-500">
          Mostrando: <span className="font-semibold text-gray-900">{filteredCalls.length}</span> de{' '}
          <span className="font-semibold text-gray-900">{calls.length}</span> llamadas
        </div>
      </div>

      {/* Búsqueda rápida */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, zona..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtros */}
      <CallFiltersComponent onFilterChange={setFilters} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prospecto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona / Presupuesto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {calls.length === 0
                      ? 'No hay llamadas registradas'
                      : 'No se encontraron llamadas con los filtros aplicados'}
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {formatRelativeTime(call.created_at)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(call.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">
                          {getProspectName(call)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {call.phone_number}
                        </span>
                        {call.phone_number && call.status === 'answered' && (
                          <WhatsAppButton
                            phoneNumber={call.phone_number}
                            size="sm"
                            variant="outline"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {call.tipo_interes && (
                          <TipoInteresBadge tipo={call.tipo_interes} showLabel={false} />
                        )}
                        {call.urgencia && (
                          <UrgencyIndicator urgencia={call.urgencia} showLabel={false} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        {call.zona_interes && call.zona_interes.length > 0 && (
                          <span className="text-gray-900">
                            📍 {call.zona_interes.join(', ')}
                          </span>
                        )}
                        {(call.presupuesto_min || call.presupuesto_max) && (
                          <span className="text-gray-600">
                            <FormattedCurrency
                              min={call.presupuesto_min || undefined}
                              max={call.presupuesto_max || undefined}
                            />
                          </span>
                        )}
                        {!call.zona_interes?.length &&
                          !call.presupuesto_min &&
                          !call.presupuesto_max && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {call.score ? (
                        <ScoreBadge score={call.score} showLabel={false} />
                      ) : (
                        <span className="text-gray-400 text-xs">Sin calificar</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.duration_seconds)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCall(call)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1 transition-colors font-medium text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
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

      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
          onConvertToLead={async (callId) => {
            // Recargar llamadas después de convertir a lead
            await loadCalls()
          }}
        />
      )}
    </div>
  )
}
