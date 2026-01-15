'use client'

import { useState, useRef, useEffect } from 'react'
import { Phone, X, AlertCircle, Headphones, Mic, Mail, FileText } from 'lucide-react'
import { CallStatus, WebCallResponse } from '@/types/webcall'
import { startWebCall, requestMicrophonePermission } from '@/lib/webcallAdapter'

interface WebCallCardProps {
  agentId: string
  agentName?: string
}

export default function WebCallCard({ agentId, agentName = 'Tu agente' }: WebCallCardProps) {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [callData, setCallData] = useState<WebCallResponse | null>(null)
  
  const callControllerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [])

  // Timer de duración cuando está en llamada
  useEffect(() => {
    if (status === 'in_call') {
      setDuration(0)
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
      if (status === 'ended' || status === 'error') {
        // Mantener la duración pero dejar de incrementar
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [status])

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartCall = async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setError(null)
    setStatus('creating')
    setCallData(null)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      // Intentar obtener la sesión para incluir el token en el header (opcional)
      // Si no hay sesión, la petición continuará de todas formas
      let authHeader: string | undefined = undefined
      
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          authHeader = `Bearer ${session.access_token}`
        }
      } catch (authErr) {
        // Si falla obtener la sesión, continuar sin el header
        console.warn('No se pudo obtener la sesión, continuando sin token:', authErr)
      }

      // Crear la llamada web
      // El servidor solo necesita la VAPI_API_KEY, así que esto funcionará incluso sin autenticación
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Agregar el token solo si está disponible
      if (authHeader) {
        headers['Authorization'] = authHeader
      }

      const response = await fetch('/api/web-call/create', {
        method: 'POST',
        headers,
        credentials: 'include', // Asegurar que las cookies se envíen (si están disponibles)
        body: JSON.stringify({ agentId }),
        signal: abortController.signal,
      })

      if (abortController.signal.aborted) {
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la llamada')
      }

      const data: WebCallResponse = await response.json()
      setCallData(data)

      // Iniciar la llamada web con el SDK
      setStatus('connecting')

      const controller = await startWebCall({
        accessToken: data.call.access_token,
        callId: data.call.call_id,
        assistantId: data.call.agent_id, // Usar el agent_id como assistantId para el SDK
        onStatus: (newStatus) => {
          setStatus(newStatus)
          if (newStatus === 'error') {
            setError('Error durante la llamada')
          }
        },
      })

      callControllerRef.current = controller
    } catch (error: any) {
      if (abortController.signal.aborted) {
        return
      }

      console.error('Error iniciando llamada:', error)
      
      // Manejar errores específicos
      if (error.name === 'AbortError') {
        setStatus('idle')
        return
      }

      if (error.message.includes('micrófono') || error.message.includes('microphone')) {
        setError(error.message)
      } else {
        setError(error.message || 'Error al iniciar la llamada. Por favor, intenta de nuevo.')
      }
      
      setStatus('error')
    }
  }

  const handleEndCall = async () => {
    if (callControllerRef.current) {
      try {
        await callControllerRef.current.stop()
        callControllerRef.current = null
      } catch (error) {
        console.error('Error terminando llamada:', error)
        setError('Error al terminar la llamada')
        setStatus('error')
      }
    } else {
      setStatus('ended')
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setError(null)
    setDuration(0)
    setCallData(null)
  }

  const getStatusText = (): string => {
    switch (status) {
      case 'idle':
        return 'Inactivo'
      case 'creating':
        return 'Creando llamada...'
      case 'connecting':
        return 'Conectando...'
      case 'in_call':
        return 'En llamada'
      case 'ended':
        return 'Llamada terminada'
      case 'error':
        return 'Error'
      default:
        return 'Desconocido'
    }
  }

  const getButtonText = (): string => {
    switch (status) {
      case 'idle':
        return 'Llamar a tu agente'
      case 'creating':
      case 'connecting':
        return 'Conectando...'
      case 'in_call':
        return 'Terminar llamada'
      case 'ended':
        return 'Llamar de nuevo'
      case 'error':
        return 'Reintentar'
      default:
        return 'Llamar'
    }
  }

  const isButtonDisabled = (): boolean => {
    return status === 'creating' || status === 'connecting'
  }

  const isButtonDanger = (): boolean => {
    return status === 'in_call'
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Card principal */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Prueba tu Agente Virtual
          </h2>
          <p className="text-gray-600">
            Realiza una llamada web para probar cómo funciona tu agente de voz
          </p>
        </div>

        {/* Estado de la llamada */}
        {(status !== 'idle' || duration > 0) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === 'in_call'
                      ? 'bg-green-500 animate-pulse'
                      : status === 'connecting'
                      ? 'bg-yellow-500 animate-pulse'
                      : status === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </span>
              </div>
              {status === 'in_call' && (
                <span className="text-lg font-mono font-semibold text-gray-900">
                  {formatDuration(duration)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Botón principal */}
        <div className="mb-8">
          <button
            onClick={status === 'in_call' ? handleEndCall : status === 'ended' || status === 'error' ? handleRetry : handleStartCall}
            disabled={isButtonDisabled()}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
              isButtonDanger()
                ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400'
                : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400'
            } disabled:cursor-not-allowed disabled:opacity-75 flex items-center justify-center space-x-2`}
          >
            {status === 'in_call' ? (
              <>
                <X className="w-5 h-5" />
                <span>{getButtonText()}</span>
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                <span>{getButtonText()}</span>
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Consejos para una mejor experiencia:</h3>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2 text-sm text-gray-600">
              <Mic className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>Permite el acceso al micrófono cuando tu navegador lo solicite</span>
            </li>
            <li className="flex items-start space-x-2 text-sm text-gray-600">
              <Headphones className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>Usa audífonos para evitar eco y mejorar la calidad del audio</span>
            </li>
            <li className="flex items-start space-x-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>Busca un lugar tranquilo para minimizar el ruido de fondo</span>
            </li>
          </ul>
        </div>

        {/* Links de ayuda */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">¿Necesitas ayuda?</h3>
          <div className="space-y-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Implementar ayuda de micrófono
                alert('Guía de configuración de micrófono')
              }}
              className="flex items-center space-x-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>Problemas con el micrófono</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Implementar envío de email resumen
                alert('Recibirás un resumen por email al finalizar la llamada')
              }}
              className="flex items-center space-x-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Recibir resumen por email</span>
            </a>
            <a
              href="/dashboard/calls"
              className="flex items-center space-x-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Ver transcripciones en Llamadas</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
