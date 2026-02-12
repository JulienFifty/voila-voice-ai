'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, MessageSquare, User, Home, DollarSign, AlertCircle, Calendar, Phone, Mail, Building2, MapPin, Bed, Bath, Car, ArrowRight, CheckCircle, UtensilsCrossed, CalendarClock } from 'lucide-react'
import { Call } from '@/types/call'
import { CallWithRealtyData, ExtractedData } from '@/types/realty'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import AudioPlayer from './AudioPlayer'
import { WhatsAppButton } from './shared/WhatsAppButton'
import { ScoreBadge } from './shared/ScoreBadge'
import { UrgencyIndicator } from './shared/UrgencyIndicator'
import { TipoInteresBadge } from './shared/TipoInteresBadge'
import { FormattedCurrency } from './shared/FormattedCurrency'
import Button from './ui/Button'
import { createClient } from '@/lib/supabase'
import { useDashboardIndustryOptional } from '@/contexts/DashboardIndustryContext'

interface ChatMessage {
  role: 'usuario' | 'agente' | 'user' | 'assistant' | 'agent'
  content: string
}

interface CallDetailsModalProps {
  call: Call | CallWithRealtyData
  onClose: () => void
  onConvertToLead?: (callId: string) => void
}

// Datos extraídos para restaurante (pedido o reserva)
interface RestaurantExtractedData {
  tipo?: 'pedido' | 'reserva'
  cliente_nombre?: string
  cliente_telefono?: string
  cliente_email?: string
  items?: { nombre: string; cantidad: number; precio_unitario?: number; notas?: string }[]
  total?: number
  fecha?: string
  hora?: string
  numero_personas?: number
  notas?: string
  [key: string]: unknown
}

export default function CallDetailsModal({
  call,
  onClose,
  onConvertToLead,
}: CallDetailsModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'transcript' | 'audio'>('info')
  const supabase = createClient()
  const industryContext = useDashboardIndustryOptional()
  const industry = industryContext?.industry ?? 'restaurante'

  const callWithRealty = call as CallWithRealtyData
  const extractedData = callWithRealty.extracted_data as ExtractedData | null
  const restaurantData: RestaurantExtractedData | null =
    industry === 'restaurante' ? (callWithRealty.extracted_data as RestaurantExtractedData | null) : null

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

  // Extraer nombre del prospecto
  const getProspectName = (): string => {
    if (extractedData?.nombre) return extractedData.nombre
    if (call.transcript) {
      const nameMatch = call.transcript.match(/(?:mi nombre es|me llamo|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i)
      if (nameMatch) return nameMatch[1]
    }
    return '-'
  }

  // Función para convertir a lead
  const handleConvertToLead = async () => {
    if (!extractedData || !onConvertToLead) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Debes iniciar sesión para crear un lead')
        return
      }

      // Crear lead en la base de datos
      const leadData = {
        user_id: user.id,
        nombre: extractedData.nombre || 'Prospecto sin nombre',
        telefono: call.phone_number,
        email: extractedData.email || null,
        presupuesto_min: extractedData.presupuestoMin || null,
        presupuesto_max: extractedData.presupuestoMax || null,
        tiene_preaprobacion: extractedData.tienePreaprobacion || false,
        banco: extractedData.banco || null,
        monto_aprobado: extractedData.montoAprobado || null,
        tipo_busqueda: extractedData.tipoBusqueda === 'info' ? null : extractedData.tipoBusqueda,
        tipo_propiedad: extractedData.tipoPropiedad || null,
        zonas_interes: extractedData.zonasInteres || null,
        recamaras: extractedData.recamaras || null,
        baños: extractedData.baños || null,
        estacionamientos: extractedData.estacionamientos || null,
        urgencia: extractedData.urgencia || null,
        timeline: extractedData.timeline || null,
        score: extractedData.score || null,
        estado: 'nuevo' as const,
        probabilidad_cierre: extractedData.probabilidadCierre || null,
        fuente: 'llamada_ia' as const,
        notas: `Lead creado desde llamada del ${format(new Date(call.created_at), 'PP', { locale: es })}. ${extractedData.motivoScore || ''}`,
      }

      const { data: lead, error } = await (supabase
        .from('leads') as any)
        .insert(leadData)
        .select()
        .single()

      if (error) {
        console.error('Error creando lead:', error)
        alert('Error al crear el lead. Intenta de nuevo.')
        return
      }

      // Actualizar la llamada para marcarla como convertida
      await (supabase
        .from('calls') as any)
        .update({ 
          converted_to_lead: true,
          lead_id: lead.id 
        })
        .eq('id', call.id)

      // Llamar callback si existe
      onConvertToLead(call.id)

      alert('Lead creado exitosamente')
      onClose()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el lead')
    } finally {
      setLoading(false)
    }
  }

  // Función para parsear la transcripción y convertirla en mensajes de chat
  const parseTranscript = (transcript: string | null): ChatMessage[] => {
    if (!transcript) return []

    // Intentar diferentes formatos de transcripción
    // Formato 1: JSON array con mensajes estructurados
    try {
      const parsed = JSON.parse(transcript)
      if (Array.isArray(parsed)) {
        return parsed.map((msg: any) => ({
          role: msg.role === 'user' ? 'usuario' : msg.role === 'assistant' || msg.role === 'agent' ? 'agente' : msg.role,
          content: msg.content || msg.text || msg.message || '',
        }))
      }
    } catch {
      // No es JSON, continuar con otros formatos
    }

    // Formato 2: Texto con etiquetas como "Usuario:" y "Agente:"
    const messages: ChatMessage[] = []
    const lines = transcript.split('\n').filter(line => line.trim())

    let currentRole: 'usuario' | 'agente' | null = null
    let currentContent: string[] = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Detectar si es una línea de inicio de mensaje
      if (trimmedLine.match(/^(Usuario|User|Usuario:)/i)) {
        if (currentRole && currentContent.length > 0) {
          messages.push({ role: currentRole, content: currentContent.join(' ').trim() })
        }
        currentRole = 'usuario'
        currentContent = [trimmedLine.replace(/^(Usuario|User|Usuario:):?\s*/i, '')]
      } else if (trimmedLine.match(/^(Agente|Agent|Asistente|Assistant|Agente:)/i)) {
        if (currentRole && currentContent.length > 0) {
          messages.push({ role: currentRole, content: currentContent.join(' ').trim() })
        }
        currentRole = 'agente'
        currentContent = [trimmedLine.replace(/^(Agente|Agent|Asistente|Assistant|Agente:):?\s*/i, '')]
      } else if (currentRole) {
        // Continuación del mensaje actual
        currentContent.push(trimmedLine)
      }
    }

    // Agregar el último mensaje
    if (currentRole && currentContent.length > 0) {
      messages.push({ role: currentRole, content: currentContent.join(' ').trim() })
    }

    // Si no se encontraron mensajes estructurados, tratar todo como un solo mensaje del agente
    if (messages.length === 0) {
      return [{
        role: 'agente',
        content: transcript.trim(),
      }]
    }

    return messages
  }

  const chatMessages = parseTranscript(call.transcript)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detalles de la llamada</h2>
            <p className="text-sm text-gray-500 mt-1">
              {format(new Date(call.created_at), 'PPpp', { locale: es })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Información
          </button>
          {call.transcript && (
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'transcript'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Transcripción
            </button>
          )}
          {call.recording_url && (
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'audio'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎧 Audio
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <p className="text-gray-900">{call.phone_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración
                    </label>
                    <p className="text-gray-900">{formatDuration(call.duration_seconds)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <span className={getStatusBadge(call.status)}>
                      {call.status === 'answered' ? 'Contestada' : 'Perdida'}
                    </span>
                  </div>
                  {callWithRealty.converted_to_lead && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead
                      </label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✅ Convertido a Lead
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del Prospecto */}
              {(extractedData || getProspectName() !== '-') && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Información del Prospecto</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <p className="text-gray-900">{getProspectName()}</p>
                    </div>
                    {extractedData?.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{extractedData.email}</p>
                      </div>
                    )}
                    {extractedData?.tienePreaprobacion && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pre-aprobación
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">Sí</span>
                          {extractedData.banco && (
                            <span className="text-gray-600">• {extractedData.banco}</span>
                          )}
                          {extractedData.montoAprobado && (
                            <span className="text-gray-600">
                              • <FormattedCurrency amount={extractedData.montoAprobado} />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Búsqueda Inmobiliaria */}
              {(extractedData?.tipoBusqueda || callWithRealty.tipo_interes || extractedData?.zonasInteres?.length || extractedData?.presupuestoMin || extractedData?.presupuestoMax) && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Búsqueda Inmobiliaria</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(extractedData?.tipoBusqueda || callWithRealty.tipo_interes) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Interés
                        </label>
                        <TipoInteresBadge 
                          tipo={callWithRealty.tipo_interes || extractedData?.tipoBusqueda} 
                          showLabel={true}
                        />
                      </div>
                    )}
                    {extractedData?.tipoPropiedad && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Propiedad
                        </label>
                        <p className="text-gray-900 capitalize">{extractedData.tipoPropiedad}</p>
                      </div>
                    )}
                    {extractedData?.zonasInteres && extractedData.zonasInteres.length > 0 && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zonas de Interés
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {extractedData.zonasInteres.map((zona, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300"
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              {zona}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(extractedData?.presupuestoMin || extractedData?.presupuestoMax || callWithRealty.presupuesto_min || callWithRealty.presupuesto_max) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Presupuesto
                        </label>
                        <p className="text-gray-900 font-semibold">
                          <FormattedCurrency
                            min={extractedData?.presupuestoMin || callWithRealty.presupuesto_min || undefined}
                            max={extractedData?.presupuestoMax || callWithRealty.presupuesto_max || undefined}
                          />
                        </p>
                      </div>
                    )}
                    {(extractedData?.recamaras || extractedData?.baños || extractedData?.estacionamientos) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Características
                        </label>
                        <div className="flex gap-4 text-gray-900">
                          {extractedData.recamaras && (
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {extractedData.recamaras}
                            </span>
                          )}
                          {extractedData.baños && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {extractedData.baños}
                            </span>
                          )}
                          {extractedData.estacionamientos && (
                            <span className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {extractedData.estacionamientos}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {extractedData?.timeline && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timeline
                        </label>
                        <p className="text-gray-900 capitalize">
                          {extractedData.timeline.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Calificación IA */}
              {(extractedData?.score || callWithRealty.score || extractedData?.probabilidadCierre) && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Calificación IA</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(extractedData?.score || callWithRealty.score) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Score
                        </label>
                        <ScoreBadge 
                          score={callWithRealty.score || extractedData?.score} 
                          showLabel={true}
                          size="md"
                        />
                      </div>
                    )}
                    {extractedData?.probabilidadCierre !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Probabilidad de Cierre
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${extractedData.probabilidadCierre}%` }}
                            />
                          </div>
                          <span className="text-gray-900 font-semibold">
                            {extractedData.probabilidadCierre}%
                          </span>
                        </div>
                      </div>
                    )}
                    {(callWithRealty.urgencia || extractedData?.urgencia) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Urgencia
                        </label>
                        <UrgencyIndicator 
                          urgencia={callWithRealty.urgencia || extractedData?.urgencia} 
                          showLabel={true}
                          size="md"
                        />
                      </div>
                    )}
                    {extractedData?.motivoScore && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Razón del Score
                        </label>
                        <p className="text-gray-900 text-sm">{extractedData.motivoScore}</p>
                      </div>
                    )}
                    {extractedData?.siguientePaso && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Siguiente Paso Sugerido
                        </label>
                        <p className="text-gray-900 text-sm">{extractedData.siguientePaso}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Datos extraídos restaurante (pedido o reserva) */}
              {industry === 'restaurante' && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Datos extraídos (pedido/reserva)</h3>
                  </div>
                  {restaurantData && typeof restaurantData === 'object' ? (
                    <div className="grid grid-cols-2 gap-4">
                      {(restaurantData.cliente_nombre || restaurantData.cliente_telefono) && (
                        <>
                          {restaurantData.cliente_nombre && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                              <p className="text-gray-900">{restaurantData.cliente_nombre}</p>
                            </div>
                          )}
                          {restaurantData.cliente_telefono && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                              <p className="text-gray-900">{restaurantData.cliente_telefono}</p>
                            </div>
                          )}
                          {restaurantData.cliente_email && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <p className="text-gray-900">{restaurantData.cliente_email}</p>
                            </div>
                          )}
                        </>
                      )}
                      {restaurantData.items && restaurantData.items.length > 0 && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Items (pedido)</label>
                          <ul className="text-sm text-gray-900">
                            {restaurantData.items.map((item, i) => (
                              <li key={i}>
                                {item.nombre} x{item.cantidad}
                                {item.precio_unitario != null ? ` — $${item.cantidad * item.precio_unitario}` : ''}
                              </li>
                            ))}
                          </ul>
                          {restaurantData.total != null && (
                            <p className="mt-1 font-semibold">Total: ${restaurantData.total}</p>
                          )}
                        </div>
                      )}
                      {(restaurantData.fecha || restaurantData.hora || restaurantData.numero_personas) && (
                        <div className="col-span-2 flex flex-wrap gap-4">
                          {restaurantData.fecha && (
                            <span className="flex items-center gap-1 text-sm">
                              <CalendarClock className="w-4 h-4" />
                              {restaurantData.fecha} {restaurantData.hora && restaurantData.hora}
                            </span>
                          )}
                          {restaurantData.numero_personas != null && (
                            <span className="text-sm">{restaurantData.numero_personas} personas</span>
                          )}
                        </div>
                      )}
                      {restaurantData.notas && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                          <p className="text-gray-900 text-sm">{restaurantData.notas}</p>
                        </div>
                      )}
                      {!restaurantData.cliente_nombre && !restaurantData.cliente_telefono && !restaurantData.items?.length && !restaurantData.fecha && !restaurantData.hora && (
                        <div className="col-span-2 text-sm text-gray-500">No hay datos estructurados de pedido o reserva.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No hay datos extraídos de pedido o reserva en esta llamada.
                    </div>
                  )}
                </div>
              )}

              {/* Sin información extraída (solo inmobiliario) */}
              {industry !== 'restaurante' && !extractedData && !callWithRealty.tipo_interes && (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  <p>No hay información inmobiliaria extraída de esta llamada.</p>
                  <p className="text-sm mt-2">La información aparecerá aquí cuando se analice la transcripción.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transcript' && (
            <div>
              {chatMessages.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 max-h-[60vh] overflow-y-auto space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'usuario' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'usuario'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="text-xs font-semibold mb-1 opacity-70 uppercase">
                          {message.role === 'usuario' ? 'Usuario' : 'Agente'}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : call.transcript ? (
                <div className="bg-gray-50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap">{call.transcript}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay transcripción disponible
                </div>
              )}
            </div>
          )}

          {activeTab === 'audio' && call.recording_url && (
            <div className="flex items-center justify-center min-h-[200px]">
              <AudioPlayer src={call.recording_url} />
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 flex-wrap">
            {call.status === 'answered' && call.phone_number && (
              <WhatsAppButton
                phoneNumber={call.phone_number}
                message={`Hola ${getProspectName() !== '-' ? getProspectName() : ''}, seguimiento de tu llamada del ${format(new Date(call.created_at), 'dd/MM/yyyy', { locale: es })}`}
                variant="outline"
                size="md"
              />
            )}
            {industry === 'restaurante' && (
              <>
                <Link
                  href={`/dashboard/pedidos/new?call_id=${call.id}&prefill=1`}
                  onClick={() => {
                    try {
                      sessionStorage.setItem(
                        `voila_prefill_pedido_${call.id}`,
                        JSON.stringify(restaurantData || {})
                      )
                    } catch {}
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Crear pedido
                </Link>
                <Link
                  href={`/dashboard/reservaciones/new?call_id=${call.id}&prefill=1`}
                  onClick={() => {
                    try {
                      sessionStorage.setItem(
                        `voila_prefill_reservacion_${call.id}`,
                        JSON.stringify(restaurantData || {})
                      )
                    } catch {}
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                >
                  <CalendarClock className="h-4 w-4" />
                  Crear reservación
                </Link>
              </>
            )}
            {industry !== 'restaurante' && extractedData && !callWithRealty.converted_to_lead && onConvertToLead && (
              <Button
                onClick={handleConvertToLead}
                disabled={loading}
                variant="primary"
                size="md"
              >
                {loading ? 'Creando...' : '✅ Convertir a Lead'}
              </Button>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
