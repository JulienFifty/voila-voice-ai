'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import WebCallCard from '@/components/WebCallCard'
import { getUserAssistant } from '@/lib/userAssistant'
import { Settings, AlertCircle } from 'lucide-react'

export default function TestAgentPage() {
  const router = useRouter()
  const [agentId, setAgentId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState<string>('Tu agente')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssistant = async () => {
      try {
        const assistant = await getUserAssistant()
        
        if (assistant) {
          setAgentId(assistant.vapi_assistant_id)
          setAgentName(assistant.vapi_assistant_name || 'Tu agente')
        } else {
          // No hay asistente configurado
          setError('no_assistant')
        }
      } catch (err) {
        console.error('Error cargando asistente:', err)
        setError('error')
      } finally {
        setLoading(false)
      }
    }

    loadAssistant()
  }, [])

  if (loading) {
    return (
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Probar Agente</h1>
          <p className="text-gray-600 mt-1">
            Realiza una llamada web para probar tu agente de voz en tiempo real
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu asistente...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'no_assistant') {
    return (
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Probar Agente</h1>
          <p className="text-gray-600 mt-1">
            Realiza una llamada web para probar tu agente de voz en tiempo real
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  No tienes un asistente configurado
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Para probar tu agente virtual, primero necesitas configurar tu asistente de VAPI en la sección de Configuración.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Ir a Configuración</span>
                  </Link>
                  
                  <div className="mt-4 text-sm text-yellow-800">
                    <p className="font-semibold mb-2">Pasos rápidos:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Ve a <Link href="/dashboard/settings" className="underline hover:text-yellow-900">Configuración</Link></li>
                      <li>Busca la sección &quot;Asistente de IA&quot;</li>
                      <li>Ingresa tu ID de asistente VAPI</li>
                      <li>Guarda y regresa aquí para probar</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'error' || !agentId) {
    return (
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Probar Agente</h1>
          <p className="text-gray-600 mt-1">
            Realiza una llamada web para probar tu agente de voz en tiempo real
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error al cargar el asistente
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  Hubo un problema al cargar tu asistente. Por favor, intenta de nuevo o verifica tu configuración.
                </p>
                <div className="space-x-3">
                  <button
                    onClick={() => router.refresh()}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Reintentar
                  </button>
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-700 rounded-lg font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Ir a Configuración</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Probar Agente</h1>
        <p className="text-gray-600 mt-1">
          Realiza una llamada web para probar tu agente de voz en tiempo real
        </p>
      </div>

      <WebCallCard agentId={agentId} agentName={agentName} />
      
      {/* Info del asistente actual */}
      <div className="max-w-2xl mx-auto mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <Settings className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Usando: {agentName}</p>
                <p className="text-xs text-blue-600">ID: {agentId}</p>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Cambiar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
