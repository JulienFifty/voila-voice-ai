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
                    <span>Grabamos conversaciones (audio y transcripciones)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Recabamos cookies esenciales e IP para funcionamiento del servicio</span>
                  </li>
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
                    <strong>Sí.</strong> Las conversaciones son grabadas a través de Vapi (nuestro proveedor de servicios de voz). Las grabaciones se almacenan de forma segura y solo tú puedes acceder a tus grabaciones a través de tu dashboard.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿Al entrar a nuestra plataforma o página web recabamos cookies o web beacons, algo relacionado con la dirección IP?
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Sí.</strong> Recabamos información técnica necesaria para el funcionamiento de la plataforma:
                  </p>
                  <ul className="text-gray-700 text-sm space-y-1 ml-4 list-disc">
                    <li><strong>Cookies:</strong> Utilizamos cookies esenciales de Supabase para autenticación y sesión de usuario. Estas cookies son necesarias para que puedas iniciar sesión y mantener tu sesión activa.</li>
                    <li><strong>Dirección IP:</strong> Recabamos direcciones IP de forma automática cuando accedes a nuestra plataforma. Las IPs se registran en los logs técnicos del servidor (Vercel/Supabase) para seguridad, prevención de fraudes y análisis técnico del servicio.</li>
                    <li><strong>Web Beacons:</strong> No utilizamos web beacons de seguimiento o marketing. Solo utilizamos tecnologías estándar de la web necesarias para el funcionamiento del servicio.</li>
                  </ul>
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
                    ¿Qué datos específicos vamos a recabar?
                  </h3>
                  <div className="text-gray-700 text-sm space-y-3">
                    <div>
                      <p className="font-semibold mb-1">Datos de Usuario (Cuenta):</p>
                      <ul className="ml-4 list-disc space-y-1">
                        <li>Email (para autenticación y comunicación)</li>
                        <li>Contraseña encriptada (nunca almacenamos contraseñas en texto plano)</li>
                        <li>User ID (identificador único de usuario)</li>
                        <li>Fecha de creación de cuenta</li>
                        <li>Última fecha de acceso</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Datos de Llamadas:</p>
                      <ul className="ml-4 list-disc space-y-1">
                        <li>Fecha y hora de la llamada</li>
                        <li>Número telefónico o tipo de llamada (Web Call, teléfono, etc.)</li>
                        <li>Duración de la llamada (en segundos)</li>
                        <li>Estado de la llamada (contestada, perdida, en curso)</li>
                        <li>URL de grabación de audio (si está disponible)</li>
                        <li>Transcripción completa de la conversación (texto)</li>
                        <li>Metadatos de la llamada (agente utilizado, configuración)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Datos Técnicos y de Conexión:</p>
                      <ul className="ml-4 list-disc space-y-1">
                        <li>Dirección IP del dispositivo</li>
                        <li>Información del navegador (User-Agent)</li>
                        <li>Cookies de sesión y autenticación</li>
                        <li>Logs de acceso y actividad en la plataforma</li>
                        <li>Información de dispositivo (tipo, sistema operativo) - recopilada automáticamente por el navegador</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Datos de Uso de la Plataforma:</p>
                      <ul className="ml-4 list-disc space-y-1">
                        <li>Páginas visitadas dentro del dashboard</li>
                        <li>Acciones realizadas (inicio de llamadas, configuración, etc.)</li>
                        <li>Preferencias de usuario (configuración de notificaciones, etc.)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Datos de Facturación (si aplica):</p>
                      <ul className="ml-4 list-disc space-y-1">
                        <li>Datos de la empresa o persona (nombre, razón social)</li>
                        <li>Dirección fiscal completa</li>
                        <li>RFC/NIF/CIF o identificación fiscal</li>
                        <li>Email de facturación</li>
                        <li>Teléfono de contacto</li>
                        <li>Plan de suscripción contratado</li>
                        <li>Historial de pagos y facturas</li>
                        <li>Nota: Los datos de tarjetas de crédito NO se almacenan en nuestros servidores (se procesan a través de proveedores PCI-DSS compliant)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ¿Vamos a facturar?
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Sí.</strong> La plataforma incluye un sistema de facturación para los planes de suscripción.
                  </p>
                  <div className="text-gray-700 text-sm space-y-2">
                    <p><strong>Datos de facturación que recabamos:</strong></p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>Datos de la empresa o persona (nombre, razón social)</li>
                      <li>Dirección fiscal completa</li>
                      <li>RFC/NIF/CIF o identificación fiscal</li>
                      <li>Email de facturación</li>
                      <li>Teléfono de contacto</li>
                      <li>Plan de suscripción contratado</li>
                      <li>Historial de pagos y facturas</li>
                    </ul>
                    <p className="mt-2"><strong>Seguridad de pagos:</strong></p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>Los pagos se procesan a través de proveedores PCI-DSS compliant (como Stripe)</li>
                      <li>No almacenamos datos de tarjetas de crédito en nuestros servidores</li>
                      <li>Todos los datos de pago se manejan de forma segura y encriptada</li>
                      <li>Cumplimos con estándares de seguridad para procesamiento de pagos</li>
                    </ul>
                  </div>
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
                <p className="text-sm text-gray-700">
                  Este documento contiene toda la información sobre privacidad y seguridad de Voila Voice AI.
                </p>
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