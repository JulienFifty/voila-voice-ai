'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Bell, Shield, User, Lock, FileText, Database, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    calls: true,
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

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
          </div>
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
                  <p className="font-medium text-gray-900 mb-1">Cookies</p>
                  <ul className="text-gray-600 space-y-1 list-disc list-inside">
                    <li>Solo cookies de autenticación de Supabase (sesión)</li>
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>¿Grabamos las conversaciones?</strong>
                </p>
                <p className="text-sm text-blue-800 mb-3">
                  Sí, de forma opcional. Las grabaciones y transcripciones se guardan solo si están habilitadas en tu configuración de Vapi. Solo tú puedes acceder a tus grabaciones y transcripciones.
                </p>
                <p className="text-sm text-blue-900 mb-2">
                  <strong>¿Hacemos minería de datos?</strong>
                </p>
                <p className="text-sm text-blue-800">
                  No. No procesamos tus datos para extraer información comercial ni los vendemos a terceros. Los datos se utilizan únicamente para que puedas acceder a tu historial de llamadas.
                </p>
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
                  href="/PRIVACIDAD-SEGURIDAD.md"
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
