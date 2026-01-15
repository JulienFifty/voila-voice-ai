import WebCallCard from '@/components/WebCallCard'

export default function TestAgentPage() {
  // TODO: Obtener agentId y agentName de params o props
  // Por ahora usamos una variable de entorno o un valor por defecto
  // IMPORTANTE: El agentId debe ser un UUID válido de un assistant creado en Vapi
  // Puedes obtenerlo desde tu dashboard de Vapi
  const agentId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || 'default-agent'
  const agentName = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_NAME || 'Tu agente'

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Probar Agente</h1>
        <p className="text-gray-600 mt-1">
          Realiza una llamada web para probar tu agente de voz en tiempo real
        </p>
      </div>

      <WebCallCard agentId={agentId} agentName={agentName} />
    </div>
  )
}
