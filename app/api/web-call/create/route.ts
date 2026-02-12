import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

/**
 * Route Handler para crear una llamada web
 * 
 * POST /api/web-call/create
 * 
 * Body: { agentId: string }
 * 
 * Requiere autenticación (usuario debe estar logueado)
 */

interface CreateWebCallRequest {
  agentId: string
}

/**
 * Función server-side para crear una llamada web
 * 
 * TODO: Integrar con API real de Vapi
 * 
 * Variables de entorno esperadas:
 * - VAPI_API_KEY: API key de Vapi
 * - VAPI_API_URL: URL base de la API de Vapi (opcional, tiene default)
 * 
 * Implementación esperada:
 * 
 * import { Vapi } from '@vapi-ai/server-sdk' // o el SDK que uses
 * 
 * async function createWebCall(agentId: string, accountId: string, userId: string) {
 *   const vapi = new Vapi(process.env.VAPI_API_KEY!)
 *   
 *   const call = await vapi.createCall({
 *     agentId,
 *     metadata: {
 *       source: 'dashboard_web_call',
 *       agent_name: agentName, // deberías obtenerlo de DB
 *       account_id: accountId,
 *       user_id: userId,
 *     },
 *     dataStorageSetting: 'everything', // o según configuración
 *   })
 *   
 *   return {
 *     call_id: call.id,
 *     call_type: 'web_call',
 *     agent_id: agentId,
 *     agent_name: agentName,
 *     call_status: 'registered',
 *     data_storage_setting: 'everything',
 *     access_token: call.accessToken, // o como lo proporcione el SDK
 *     metadata: {
 *       source: 'dashboard_web_call',
 *       agent_name: agentName,
 *     },
 *     call_cost: {
 *       total_duration_seconds: 0,
 *       combined_cost: 0,
 *     },
 *   }
 * }
 */
/**
 * Las llamadas web se inician en el cliente con el SDK (vapi.start(assistantId) + public key).
 * No usamos la API REST de VAPI para crearlas (esa API es para outboundPhoneCall/inboundPhoneCall).
 * Solo generamos un call_id local y devolvemos lo que el cliente necesita para el SDK.
 */
async function createWebCall(
  agentId: string,
  _accountId: string,
  _userId: string
): Promise<{
  call_id: string
  call_type: 'web_call'
  agent_id: string
  agent_name: string
  call_status: 'registered'
  data_storage_setting: 'everything'
  access_token: string
  metadata: { source: string; agent_name: string }
  call_cost: { total_duration_seconds: number; combined_cost: number }
}> {
  const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const accessToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`

  return {
    call_id: callId,
    call_type: 'web_call',
    agent_id: agentId,
    agent_name: 'Tu agente',
    call_status: 'registered',
    data_storage_setting: 'everything',
    access_token: accessToken,
    metadata: {
      source: 'dashboard_web_call',
      agent_name: 'Tu agente',
    },
    call_cost: {
      total_duration_seconds: 0,
      combined_cost: 0,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificación de autenticación para guardar en DB
    // Necesitamos el userId real para guardar la llamada
    let userId: string | null = null
    let dbUser: { id: string } | null = null
    
    try {
      // Intentar obtener el token del header primero (más confiable)
      const authHeader = request.headers.get('authorization')
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        // Verificar el token con Supabase
        const tempSupabase = createServerClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll: () => [],
              setAll: () => {},
            },
          }
        )
        
        const { data: { user: tokenUser } } = await tempSupabase.auth.getUser(token)
        if (tokenUser) {
          userId = tokenUser.id
          dbUser = tokenUser
        }
      }
    } catch (authErr) {
      // Si falla la autenticación, continuar pero no guardaremos en DB
      console.warn('No se pudo verificar autenticación:', authErr)
    }

    // Si no hay userId, usar un valor por defecto para la llamada a Vapi
    const vapiUserId = userId || 'anonymous-user'
    // Obtener accountId (por ahora usamos userId, en multi-tenant real vendría de user metadata)
    const accountId = vapiUserId

    // Parsear body
    let body: CreateWebCallRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Body inválido. Se espera { agentId: string }' },
        { status: 400 }
      )
    }

    if (!body.agentId || typeof body.agentId !== 'string') {
      return NextResponse.json(
        { error: 'agentId es requerido y debe ser un string' },
        { status: 400 }
      )
    }

    // Crear la llamada web
    const call = await createWebCall(body.agentId, accountId, vapiUserId)

    // Guardar registro en la base de datos si tenemos un usuario autenticado
    if (dbUser && userId) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (supabaseUrl && serviceRoleKey) {
          const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey)
          const callData = {
            phone_number: 'Web Call',
            duration_seconds: 0,
            status: 'answered' as const,
            recording_url: null,
            transcript: null,
            user_id: dbUser.id,
          }
          const { error: dbError } = await (supabaseAdmin.from('calls') as any).insert(callData)
          if (dbError) {
            console.error('Error guardando llamada en DB:', dbError)
          } else {
            console.log('Llamada guardada exitosamente en la base de datos')
          }
        }
      } catch (dbErr) {
        console.error('Error al intentar guardar en DB:', dbErr)
      }
    } else {
      console.log('Usuario no autenticado, no se guardará en la base de datos')
    }

    // Generar client_id (puede ser necesario para el SDK)
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Response según formato esperado
    return NextResponse.json({
      call,
      client_id: clientId,
    })
  } catch (error: any) {
    console.error('Error en POST /api/web-call/create:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error.message || 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
