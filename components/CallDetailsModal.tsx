'use client'

import { X, MessageSquare } from 'lucide-react'
import { Call } from '@/types/call'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import AudioPlayer from './AudioPlayer'

interface ChatMessage {
  role: 'usuario' | 'agente' | 'user' | 'assistant' | 'agent'
  content: string
}

interface CallDetailsModalProps {
  call: Call
  onClose: () => void
}

export default function CallDetailsModal({
  call,
  onClose,
}: CallDetailsModalProps) {
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de la llamada</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora
              </label>
              <p className="text-gray-900">
                {format(new Date(call.created_at), 'PPpp', { locale: es })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número llamante
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
          </div>

          {call.recording_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grabación
              </label>
              <AudioPlayer src={call.recording_url} />
            </div>
          )}

          {call.transcript && chatMessages.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Transcripción de llamada</span>
              </label>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
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
            </div>
          ) : call.transcript ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Transcripción</span>
              </label>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-gray-900 whitespace-pre-wrap">{call.transcript}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay transcripción disponible
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
