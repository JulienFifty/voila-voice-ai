import Link from 'next/link'
import { Shield, Lock, Database, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Política de Privacidad y Seguridad
            </h1>
            <p className="text-gray-600">Voila Voice AI - Plataforma SaaS Profesional</p>
            <p className="text-sm text-gray-500 mt-2">Última actualización: Diciembre 2024</p>
          </div>

          {/* Resumen Ejecutivo */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Resumen Ejecutivo</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">✓ Lo que SÍ hacemos</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>HTTPS/TLS en toda la plataforma</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Accesos protegidos por usuario/contraseña</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Acceso a datos solo personal autorizado</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Bases de datos no públicas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Posibilidad de borrar datos a solicitud</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">✗ Lo que NO hacemos</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Bases de datos abiertas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Cookies de seguimiento o marketing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Venta de datos a terceros</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Minería de datos comercial</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Compartir datos sin autorización</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preguntas Frecuentes */}
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-gray-600" />
                <span>Preguntas Frecuentes</span>
              </h2>

              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿La plataforma graba las conversaciones?
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Sí, de forma opcional.</strong> Las conversaciones pueden ser grabadas a través de Vapi (nuestro proveedor de servicios de voz) si está habilitado en tu configuración. Solo tú puedes acceder a tus grabaciones.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿Recabamos cookies o dirección IP?
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Cookies:</strong> Solo cookies esenciales de Supabase para autenticación. No utilizamos cookies de seguimiento, marketing, ni web beacons.
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>IP:</strong> No recabamos explícitamente direcciones IP. Pueden aparecer en logs técnicos del servidor según políticas estándar de los proveedores (Vercel/Supabase).
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿Hacemos minería de datos?
                  </h3>
                  <p className="text-gray-700 text-sm">
                    <strong>No.</strong> No procesamos los datos para extraer información comercial, no los vendemos a terceros, ni los utilizamos para entrenar modelos de IA propios. Los datos se utilizan únicamente para proporcionar el servicio.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿Qué datos específicos recabamos?
                  </h3>
                  <div className="text-gray-700 text-sm space-y-2">
                    <p><strong>Datos de usuario:</strong> Email (para autenticación), password encriptado, User ID.</p>
                    <p><strong>Datos de llamadas:</strong> Fecha/hora, número o tipo de llamada, duración, estado, URL de grabación (si disponible), transcripción (si disponible).</p>
                  </div>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿Vamos a facturar?
                  </h3>
                  <p className="text-gray-700 text-sm">
                    <strong>No está implementado actualmente.</strong> Si se implementa en el futuro, se manejaría a través de proveedores PCI-DSS compliant (como Stripe). No se guardarían datos de tarjetas de crédito en nuestros servidores.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿Qué tipo de seguridad manejamos?
                  </h3>
                  <div className="text-gray-700 text-sm space-y-2">
                    <p><strong>Nivel SaaS Profesional:</strong> Implementamos medidas de seguridad serias y profesionales, no nivel bancario, pero sí con estándares de la industria para plataformas SaaS.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>HTTPS/TLS en toda la plataforma</li>
                      <li>Autenticación segura con Supabase Auth</li>
                      <li>Row Level Security (RLS) - cada usuario solo ve sus datos</li>
                      <li>Bases de datos no públicas (Supabase)</li>
                      <li>Proveedores cloud serios (Supabase, Vercel, Vapi)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Seguridad Detallada */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Lock className="w-6 h-6 text-gray-600" />
                <span>Medidas de Seguridad Implementadas</span>
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Encriptación y Comunicación</h3>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>HTTPS/TLS en toda la plataforma</li>
                    <li>Conexiones seguras para todas las API calls</li>
                    <li>WebRTC seguro para llamadas de voz</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Autenticación y Autorización</h3>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Autenticación por email/contraseña mediante Supabase Auth</li>
                    <li>Passwords encriptados (nunca en texto plano)</li>
                    <li>Row Level Security (RLS) - aislamiento de datos por usuario</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Infraestructura Cloud</h3>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Vercel (hosting de Next.js) - infraestructura profesional</li>
                    <li>Supabase (base de datos y auth) - PostgreSQL seguro</li>
                    <li>Vapi (servicios de voz) - proveedor especializado</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Derechos del Usuario */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tus Derechos</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Acceso a tus datos:</strong> Puedes acceder a todos tus datos a través del dashboard</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Derecho al olvido:</strong> Puedes eliminar tus llamadas desde la interfaz</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Eliminación de cuenta:</strong> Puedes solicitar la eliminación de tu cuenta y todos tus datos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Control de datos:</strong> Tienes control total sobre tus datos y grabaciones</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Contacto */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contacto</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-700 mb-2">
                  Para consultas sobre privacidad, eliminación de datos, o acceso a información:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Puedes eliminar tus llamadas desde el dashboard de llamadas</li>
                  <li>Contacta al administrador del sistema para solicitudes adicionales</li>
                </ul>
              </div>
            </section>

            {/* Enlace a documentación completa */}
            <section className="mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Documentación Completa</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Para más detalles técnicos sobre privacidad y seguridad, consulta nuestro documento completo:
                </p>
                <a
                  href="/PRIVACIDAD-SEGURIDAD.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Política Completa</span>
                </a>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-primary hover:text-primary-dark text-sm transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}