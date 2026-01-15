import { WebCallParams, WebCallController, CallStatus } from '@/types/webcall'
import Vapi from '@vapi-ai/web'

// La Public Key de Vapi debe estar disponible en el cliente
// Según la documentación: https://github.com/VapiAI/client-sdk-web
// El SDK se inicializa con una Public Key (no la Private API Key)
const getVapiPublicKey = (): string => {
  // La Public Key debe estar en las variables de entorno públicas
  // Esta es diferente de la VAPI_API_KEY (que es privada y solo para servidor)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
  }
  return ''
}

/**
 * Solicita permisos de micrófono al navegador
 * @throws Error si el usuario deniega los permisos
 */
export async function requestMicrophonePermission(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Cerrar el stream inmediatamente después de obtener permisos
    stream.getTracks().forEach((track) => track.stop())
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error(
        'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en la configuración de tu navegador y vuelve a intentar.'
      )
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('No se encontró ningún micrófono. Por favor, conecta un micrófono e intenta de nuevo.')
    } else {
      throw new Error('Error al acceder al micrófono: ' + error.message)
    }
  }
}

/**
 * Inicia una llamada web usando el SDK de Vapi
 * 
 * Según la documentación oficial: https://github.com/VapiAI/client-sdk-web
 * - El SDK se inicializa con una Public Key (no la Private API Key)
 * - El método start() puede recibir un assistantId directamente como string
 * - O un objeto assistant completo
 */
export async function startWebCall(params: WebCallParams): Promise<WebCallController> {
  const { accessToken, callId, assistantId, onStatus } = params

  try {
    // Solicitar permisos de micrófono primero
    await requestMicrophonePermission()
    
    onStatus('connecting')

    // Obtener la Public Key de Vapi
    // IMPORTANTE: La Public Key es diferente de la VAPI_API_KEY (Private Key)
    // La Public Key debe obtenerse del dashboard de Vapi y configurarse en .env.local
    const publicKey = getVapiPublicKey()
    
    if (!publicKey) {
      // Si no hay Public Key configurada, intentar usar el accessToken como fallback
      // Esto puede funcionar si el accessToken es válido para el cliente
      console.warn('NEXT_PUBLIC_VAPI_PUBLIC_KEY no está configurada. Usando accessToken como fallback.')
    }

    // Inicializar el SDK de Vapi con la Public Key
    // Según la documentación: const vapi = new Vapi('your-public-key')
    const vapi = new Vapi(publicKey || accessToken)

    // Configurar event listeners según la documentación oficial
    const onCallStart = () => {
      console.log('Call started')
      onStatus('in_call')
    }

    const onCallEnd = () => {
      console.log('Call ended')
      onStatus('ended')
    }

    const onError = (error: any) => {
      console.error('Error en llamada:', error)
      onStatus('error')
    }

    // Registrar event listeners
    vapi.on('call-start', onCallStart)
    vapi.on('call-end', onCallEnd)
    vapi.on('error', onError)

    // Iniciar la llamada usando el assistantId
    // Según la documentación: vapi.start('your-assistant-id')
    // Usamos el assistantId (agentId) que viene de la respuesta del servidor
    const callPromise = vapi.start(assistantId)

    // Esperar a que la llamada se inicie
    await callPromise

    return {
      stop: async () => {
        try {
          // Detener la llamada según la documentación: vapi.stop()
          vapi.stop()
          onStatus('ended')
        } catch (error) {
          console.error('Error deteniendo llamada:', error)
          onStatus('error')
        } finally {
          // Limpiar event listeners
          vapi.off('call-start', onCallStart)
          vapi.off('call-end', onCallEnd)
          vapi.off('error', onError)
        }
      },
    }
  } catch (error: any) {
    console.error('Error iniciando llamada:', error)
    onStatus('error')
    throw error
  }
}
