'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Bell, Shield, User, Lock, FileText, Database, AlertCircle, Briefcase, Bot } from 'lucide-react'
import { useDashboardIndustry } from '@/contexts/DashboardIndustryContext'
import type { Industry } from '@/types/restaurant'

const industryLabels: Record<Industry, string> = {
  inmobiliario: 'Inmobiliario',
  restaurante: 'Restaurante',
  clinica: 'Clínica',
}

export default function SettingsPage() {
  const { industry, setIndustry } = useDashboardIndustry()
  const [industryLocal, setIndustryLocal] = useState<Industry>('restaurante')
  const [industrySaving, setIndustrySaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    calls: true,
  })
  const [loading, setLoading] = useState(false)
  
  // Asistente VAPI
  const [assistantId, setAssistantId] = useState('')
  const [assistantName, setAssistantName] = useState('')
  const [currentAssistant, setCurrentAssistant] = useState<{ vapi_assistant_id: string; vapi_assistant_name: string } | null>(null)
  const [assistantSaving, setAssistantSaving] = useState(false)
  const [assistantLoading, setAssistantLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    setIndustryLocal(industry)
  }, [industry])
  
  // Cargar asistente actual
  useEffect(() => {
    const loadAssistant = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const { data, error } = await supabase
          .from('user_assistants')
          .select('vapi_assistant_id, vapi_assistant_name')
          .eq('user_id', user.id)
          .eq('active', true)
          .single()
        
        if (!error && data) {
          setCurrentAssistant(data as { vapi_assistant_id: string; vapi_assistant_name: string })
          setAssistantId(data.vapi_assistant_id)
          setAssistantName(data.vapi_assistant_name || '')
        }
      } catch (err) {
        console.error('Error cargando asistente:', err)
      } finally {
        setAssistantLoading(false)
      }
    }
    loadAssistant()
  }, [supabase])

  const handleSaveIndustry = useCallback(async () => {
    if (industryLocal === industry) return
    setIndustrySaving(true)
    try {
      // Obtener o refrescar sesión para token válido
      let { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (!session?.access_token) {
        const { data: { session: refreshed }, error: refreshError } = await supabase.auth.refreshSession()
        session = refreshed
        sessionError = refreshError
      }
      if (sessionError || !session?.access_token) {
        throw new Error('Sesión expirada o inválida. Cierra sesión y vuelve a iniciar sesión.')
      }
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      }
      const res = await fetch('/api/me', {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ industry: industryLocal }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al guardar')
      }
      const data = await res.json()
      const newIndustry = (data.profile?.industry ?? industryLocal) as Industry
      setIndustry(newIndustry)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar giro')
    } finally {
      setIndustrySaving(false)
    }
  }, [industry, industryLocal, setIndustry, supabase])

  const handleSaveAssistant = async () => {
    if (!assistantId.trim()) {
      alert('Por favor ingresa el ID del asistente')
      return
    }
    
    setAssistantSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')
      
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('user_assistants')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single()
      
      if (existing) {
        // Actualizar
        const { error } = await (supabase.from('user_assistants') as any)
          .update({
            vapi_assistant_id: assistantId.trim(),
            vapi_assistant_name: assistantName.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', (existing as any).id)
        
        if (error) throw error
      } else {
        // Crear nuevo
        const { error } = await (supabase.from('user_assistants') as any)
          .insert({
            user_id: user.id,
            vapi_assistant_id: assistantId.trim(),
            vapi_assistant_name: assistantName.trim() || null,
            active: true,
          })
        
        if (error) throw error
      }
      
      setCurrentAssistant({
        vapi_assistant_id: assistantId.trim(),
        vapi_assistant_name: assistantName.trim(),
      })
      alert('Asistente guardado exitosamente')
    } catch (err) {
      console.error('Error guardando asistente:', err)
      alert(err instanceof Error ? err.message : 'Error al guardar asistente')
    } finally {
      setAssistantSaving(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    // Aquí puedes guardar las configuraciones en Supabase
    setTimeout(() => {
      setLoading(false)
      alert('Configuración guardada exitosamente')
    }, 500)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona la configuración de tu cuenta
        </p>
      </div>

      <div className="space-y-6">
        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Notificaciones
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">
                  Notificaciones por email
                </p>
                <p className="text-sm text-gray-600">
                  Recibe alertas por correo electrónico
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) =>
                  setNotifications({ ...notifications, email: e.target.checked })
                }
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Notificaciones SMS</p>
                <p className="text-sm text-gray-600">
                  Recibe alertas por mensaje de texto
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) =>
                  setNotifications({ ...notifications, sms: e.target.checked })
                }
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">
                  Alertas de llamadas
                </p>
                <p className="text-sm text-gray-600">
                  Notificaciones para nuevas llamadas
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.calls}
                onChange={(e) =>
                  setNotifications({ ...notifications, calls: e.target.checked })
                }
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cambiar contraseña
              </label>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>

        {/* Perfil */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Perfil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Tu email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Giro / Industria
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={industryLocal}
                  onChange={(e) => setIndustryLocal(e.target.value as Industry)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {(Object.entries(industryLabels) as [Industry, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {industryLocal !== industry && (
                  <button
                    onClick={handleSaveIndustry}
                    disabled={industrySaving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {industrySaving ? 'Guardando...' : 'Guardar giro'}
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Define si tu negocio es inmobiliario, restaurante o clínica. El dashboard mostrará funciones acordes a tu giro.
              </p>
            </div>
          </div>
        </div>

        {/* Asistente de IA */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Asistente de IA
            </h2>
          </div>

          {assistantLoading ? (
            <div className="text-center py-4 text-gray-500">Cargando...</div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Configura tu asistente VAPI para que atienda llamadas automáticamente y extraiga información como pedidos y reservaciones.
              </p>
              
              {currentAssistant && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">
                        Asistente Activo
                      </h3>
                      <p className="text-sm text-green-800">
                        <strong>ID:</strong> {currentAssistant.vapi_assistant_id}
                      </p>
                      {currentAssistant.vapi_assistant_name && (
                        <p className="text-sm text-green-800">
                          <strong>Nombre:</strong> {currentAssistant.vapi_assistant_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID del Asistente VAPI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assistantId}
                    onChange={(e) => setAssistantId(e.target.value)}
                    placeholder="Ej: 4f4dc8fc-4950-42e4-b9d5-080885825348"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Copia el ID de tu asistente desde el{' '}
                    <a
                      href="https://dashboard.vapi.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      VAPI Dashboard
                    </a>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Asistente (opcional)
                  </label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="Ej: Asistente Restaurante"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <button
                  onClick={handleSaveAssistant}
                  disabled={assistantSaving || !assistantId.trim()}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assistantSaving ? 'Guardando...' : currentAssistant ? 'Actualizar Asistente' : 'Guardar Asistente'}
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                  ¿Cómo configurar tu asistente?
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>
                    Ve al{' '}
                    <a
                      href="https://dashboard.vapi.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      VAPI Dashboard
                    </a>
                  </li>
                  <li>Crea un nuevo asistente o edita uno existente</li>
                  <li>
                    Configura el <code className="bg-blue-100 px-1 py-0.5 rounded">analysisPlan</code> con{' '}
                    <code className="bg-blue-100 px-1 py-0.5 rounded">structuredDataSchema</code> para restaurante (
                    <a
                      href="https://vapi.sh/structured-data"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ver docs
                    </a>
                    )
                  </li>
                  <li>Configura el webhook: <code className="bg-blue-100 px-1 py-0.5 rounded">{typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'}/api/webhooks/vapi</code></li>
                  <li>Copia el ID del asistente y pégalo arriba</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Privacidad y Seguridad */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Privacidad y Seguridad
            </h2>
          </div>

          <div className="space-y-6">
            {/* Resumen de medidas de seguridad */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">
                    Medidas de Seguridad Implementadas
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>HTTPS/TLS en toda la plataforma</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Accesos protegidos por usuario/contraseña</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Acceso a datos solo personal autorizado (Row Level Security)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Bases de datos no públicas (Supabase)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Logs básicos de acceso</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Posibilidad de borrar datos a solicitud</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Uso de proveedores cloud serios (Supabase, Vercel, Vapi)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Datos recabados */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Database className="w-5 h-5 text-gray-600" />
                <span>Datos que Recabamos</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900 mb-1">Datos de Usuario</p>
                  <ul className="text-gray-600 space-y-1 list-disc list-inside">
                    <li>Email (para autenticación)</li>
                    <li>Password encriptado (nunca en texto plano)</li>
                    <li>User ID (identificador único)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900 mb-1">Datos de Llamadas</p>
                  <ul className="text-gray-600 space-y-1 list-disc list-inside">
                    <li>Fecha y hora de la llamada</li>
                    <li>Número telefónico o tipo de llamada (Web Call)</li>
                    <li>Duración en segundos</li>
                    <li>Estado (contestada/perdida)</li>
                    <li>URL de grabación (si está disponible y configurado)</li>
                    <li>Transcripción de texto (si está disponible)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900 mb-1">Cookies y Datos Técnicos</p>
                  <ul className="text-gray-600 space-y-1 list-disc list-inside">
                    <li>Cookies de autenticación de Supabase (sesión)</li>
                    <li>Dirección IP (registrada en logs del servidor)</li>
                    <li>Información del navegador (User-Agent)</li>
                    <li>No utilizamos cookies de seguimiento ni marketing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Grabaciones y transcripciones */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <span>Grabaciones y Transcripciones</span>
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>¿Grabamos las conversaciones?</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    Sí. Las conversaciones son grabadas a través de Vapi. Las grabaciones y transcripciones se almacenan de forma segura y solo tú puedes acceder a ellas a través de tu dashboard.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>¿Recabamos cookies o dirección IP?</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    Sí. Utilizamos cookies esenciales para autenticación y recabamos direcciones IP automáticamente en los logs del servidor para seguridad y funcionamiento del servicio.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>¿Hacemos minería de datos?</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    No. No procesamos tus datos para extraer información comercial ni los vendemos a terceros. Los datos se utilizan únicamente para proporcionar el servicio y que puedas acceder a tu historial de llamadas.
                  </p>
                </div>
              </div>
            </div>

            {/* Enlaces a documentación */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Documentación Completa</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Para más detalles sobre privacidad, seguridad, y políticas de datos, consulta nuestro documento completo:
                </p>
                <a
                  href="https://voilavoiceai.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Política Completa de Privacidad y Seguridad</span>
                </a>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Solicitudes de Privacidad</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  Para solicitar eliminación de datos, acceso a información, o consultas sobre privacidad:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Puedes eliminar tus llamadas desde el dashboard de llamadas</li>
                  <li>• Contacta al administrador del sistema para solicitudes adicionales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
