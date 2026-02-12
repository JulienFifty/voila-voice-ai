import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

/**
 * Webhook para eventos de VAPI (end-of-call-report, status-update)
 * Configura en VAPI Dashboard: Server URL = https://tu-dominio.com/api/webhooks/vapi
 *
 * Maneja DOS tipos de llamadas:
 * - OUTBOUND (campaign_calls): Llamadas que TÚ haces a clientes (campañas)
 * - INBOUND (calls): Llamadas que el CLIENTE hace al restaurante
 *
 * Eventos soportados:
 * - end-of-call-report: guarda transcript, recording, extracted_data
 * - status-update (ended): actualiza status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body.message || body
    const type = message.type
    const call = message.call || body.call

    if (!call?.id) {
      return NextResponse.json({ ok: false, error: 'Missing call id' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Webhook VAPI] Supabase config missing')
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    if (type === 'end-of-call-report') {
      const artifact = message.artifact || {}
      const transcript = artifact.transcript || null
      const recording = artifact.recording
      const recordingUrl = recording?.url ?? recording?.recordingUrl ?? null
      
      // Leer datos estructurados extraídos por VAPI
      const analysis = artifact.analysis || message.analysis || {}
      const structuredData = analysis.structuredData || null
      
      const callObj = typeof call === 'object' ? call : {}
      const durationSeconds =
        callObj.duration ?? callObj.durationSeconds ?? message.duration ?? null
      
      const phoneNumber =
        call.customer?.number ??
        (call as { phoneNumber?: { number?: string } }).phoneNumber?.number ??
        null
      const startedAt = message.startedAt || null
      const endedAt = message.endedAt || null

      let newStatus: 'answered' | 'missed' | 'failed' = 'answered'
      const endedReason = message.endedReason || ''
      if (
        endedReason.includes('no-answer') ||
        endedReason.includes('busy') ||
        endedReason.includes('failed')
      ) {
        newStatus = endedReason.includes('failed') ? 'failed' : 'missed'
      }

      // PASO 1: Determinar si es llamada OUTBOUND (campaña) o INBOUND (cliente)
      const { data: campaignCallData, error: fetchError } = await supabase
        .from('campaign_calls')
        .select('id, campaign_id, user_id')
        .eq('vapi_call_id', call.id)
        .single()

      const campaignCall = campaignCallData as { id: string; campaign_id: string; user_id: string } | null
      
      // CASO A: LLAMADA OUTBOUND (de campaña)
      if (!fetchError && campaignCall) {
        // 1. Actualizar la llamada con transcript, recording y datos extraídos
        await (supabase
          .from('campaign_calls') as any)
          .update({
            status: newStatus,
            transcript: transcript,
            recording_url: recordingUrl,
            duration_seconds: durationSeconds,
            extracted_data: structuredData, // Guardar datos extraídos por VAPI
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaignCall.id)

        // 2. Si hay datos estructurados y el usuario tiene industry, procesar
        if (structuredData && campaignCall.user_id) {
          const { data: profileData } = await (supabase as any)
            .from('user_profiles')
            .select('industry')
            .eq('user_id', campaignCall.user_id)
            .single()
          
          const userIndustry = (profileData as any)?.industry || 'inmobiliario'
          
          // 3. Si es restaurante, auto-crear pedido o reservación
          if (userIndustry === 'restaurante') {
            const tipo = structuredData.tipo
            
            // Auto-crear PEDIDO si tiene items
            if (tipo === 'pedido' && structuredData.items?.length > 0) {
              const total = structuredData.total || 
                (structuredData.items || []).reduce((sum: number, item: any) => {
                  return sum + ((item.precio_unitario || 0) * (item.cantidad || 1))
                }, 0)
              
              try {
                await (supabase.from('pedidos') as any).insert({
                  user_id: campaignCall.user_id,
                  call_id: campaignCall.id,
                  cliente_nombre: structuredData.cliente_nombre || 'Cliente',
                  cliente_telefono: structuredData.cliente_telefono || '',
                  cliente_email: structuredData.cliente_email,
                  items: structuredData.items,
                  total: total,
                  tipo_entrega: structuredData.tipo_entrega || 'recoger',
                  direccion_entrega: structuredData.direccion_entrega,
                  hora_recogida: structuredData.hora_recogida,
                  estado: 'recibido',
                  notas: structuredData.notas,
                })
                console.log('[Webhook VAPI] Pedido creado automáticamente para call:', campaignCall.id)
              } catch (insertError) {
                console.error('[Webhook VAPI] Error creando pedido:', insertError)
              }
            }
            
            // Auto-crear RESERVACIÓN si tiene fecha y hora
            else if (tipo === 'reserva' && structuredData.fecha && structuredData.hora) {
              try {
                await (supabase.from('reservaciones') as any).insert({
                  user_id: campaignCall.user_id,
                  call_id: campaignCall.id,
                  cliente_nombre: structuredData.cliente_nombre || 'Cliente',
                  cliente_telefono: structuredData.cliente_telefono || '',
                  cliente_email: structuredData.cliente_email,
                  fecha: structuredData.fecha,
                  hora: structuredData.hora,
                  numero_personas: structuredData.numero_personas || 2,
                  estado: 'pendiente',
                  notas: structuredData.notas,
                })
                console.log('[Webhook VAPI] Reservación creada automáticamente para call:', campaignCall.id)
              } catch (insertError) {
                console.error('[Webhook VAPI] Error creando reservación:', insertError)
              }
            }
          }
        }

        // 4. Actualizar estadísticas de la campaña
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select('id, total_recipients, completed_calls, failed_calls')
          .eq('id', campaignCall.campaign_id)
          .single()

        const campaign = campaignData as { id: string; total_recipients: number; completed_calls: number; failed_calls: number } | null
        if (campaign) {
          const prevCompleted = campaign.completed_calls ?? 0
          const prevFailed = campaign.failed_calls ?? 0
          const completed = prevCompleted + (newStatus === 'answered' ? 1 : 0)
          const failed = prevFailed + (newStatus !== 'answered' ? 1 : 0)
          const totalDone = completed + failed
          const allDone = totalDone >= (campaign.total_recipients ?? 0)

          await (supabase
            .from('campaigns') as any)
            .update({
              completed_calls: completed,
              failed_calls: failed,
              ...(allDone && {
                status: 'completed',
                completed_at: new Date().toISOString(),
              }),
            })
            .eq('id', campaignCall.campaign_id)
        }
      }
      // CASO B: LLAMADA INBOUND (cliente llama al restaurante)
      else {
        console.log('[Webhook VAPI] Llamada INBOUND detectada:', call.id)

        const callObj = typeof call === 'object' ? call : {}
        const payloadMessage = body.message || body

        // Assistant ID: intentar múltiples rutas (inbound a veces viene en distintos sitios)
        const assistantId =
          (callObj as { assistantId?: string }).assistantId ??
          (callObj as { assistant_id?: string }).assistant_id ??
          (callObj as { assistant?: { id?: string } }).assistant?.id ??
          (payloadMessage as { assistant?: { id?: string } }).assistant?.id ??
          null

        let userId: string | null = null

        if (assistantId) {
          const { data: userAssistant, error: userError } = await supabase
            .from('user_assistants')
            .select('user_id')
            .eq('vapi_assistant_id', assistantId)
            .eq('active', true)
            .single()

          if (!userError && userAssistant) {
            userId = (userAssistant as { user_id: string }).user_id
            console.log('[Webhook VAPI] Usuario resuelto por assistant_id:', assistantId)
          }
        }

        // Fallback: si no hay assistantId o no se encontró usuario, buscar por número de teléfono (phone_numbers.numero)
        if (!userId && phoneNumber) {
          const normalized = phoneNumber.replace(/\D/g, '')
          const withPlus = normalized ? `+${normalized}` : ''
          const candidates = [phoneNumber, normalized, withPlus].filter(Boolean)
          for (const num of candidates) {
            const { data: phoneRow } = await (supabase as any)
              .from('phone_numbers')
              .select('user_id')
              .eq('activo', true)
              .eq('numero', num)
              .maybeSingle()
            if (phoneRow?.user_id) {
              userId = phoneRow.user_id
              console.log('[Webhook VAPI] Usuario resuelto por número de teléfono:', num)
              break
            }
          }
        }

        if (!userId) {
          console.error(
            '[Webhook VAPI] No se pudo resolver usuario: assistantId=',
            assistantId ?? 'null',
            ', phoneNumber=',
            phoneNumber ?? 'null'
          )
          return NextResponse.json(
            { ok: false, error: 'Could not resolve user (missing assistant_id and phone not linked)' },
            { status: 400 }
          )
        }
        
        // 1. Crear registro en tabla 'calls' (inbound)
        const { data: inboundCall, error: insertError } = await (supabase
          .from('calls') as any)
          .insert({
            user_id: userId,
            vapi_call_id: call.id,
            phone_number: phoneNumber,
            duration_seconds: durationSeconds,
            status: newStatus,
            recording_url: recordingUrl,
            transcript: transcript,
            extracted_data: structuredData,
            started_at: startedAt,
            ended_at: endedAt,
          })
          .select()
          .single()
        
        if (insertError || !inboundCall) {
          console.error('[Webhook VAPI] Error creando call inbound:', insertError)
          return NextResponse.json({ ok: false, error: 'Failed to create call' }, { status: 500 })
        }
        
        console.log('[Webhook VAPI] Call inbound creada:', inboundCall.id)
        
        // 2. Si hay datos estructurados, obtener industry y procesar
        if (structuredData) {
          const { data: profileData } = await (supabase as any)
            .from('user_profiles')
            .select('industry')
            .eq('user_id', userId)
            .single()
          
          const userIndustry = (profileData as any)?.industry || 'restaurante'
          
          // 3. Si es restaurante, auto-crear pedido o reservación
          if (userIndustry === 'restaurante') {
            const tipo = structuredData.tipo
            
            // Auto-crear PEDIDO
            if (tipo === 'pedido' && structuredData.items?.length > 0) {
              const total = structuredData.total || 
                (structuredData.items || []).reduce((sum: number, item: any) => {
                  return sum + ((item.precio_unitario || 0) * (item.cantidad || 1))
                }, 0)
              
              try {
                await (supabase.from('pedidos') as any).insert({
                  user_id: userId,
                  call_id: inboundCall.id,
                  cliente_nombre: structuredData.cliente_nombre || 'Cliente',
                  cliente_telefono: structuredData.cliente_telefono || phoneNumber || '',
                  cliente_email: structuredData.cliente_email,
                  items: structuredData.items,
                  total: total,
                  tipo_entrega: structuredData.tipo_entrega || 'recoger',
                  direccion_entrega: structuredData.direccion_entrega,
                  hora_recogida: structuredData.hora_recogida,
                  estado: 'recibido',
                  notas: structuredData.notas,
                })
                console.log('[Webhook VAPI] Pedido INBOUND creado para call:', inboundCall.id)
              } catch (insertError) {
                console.error('[Webhook VAPI] Error creando pedido inbound:', insertError)
              }
            }
            
            // Auto-crear RESERVACIÓN
            if (tipo === 'reserva' && structuredData.fecha && structuredData.hora) {
              try {
                await (supabase.from('reservaciones') as any).insert({
                  user_id: userId,
                  call_id: inboundCall.id,
                  cliente_nombre: structuredData.cliente_nombre || 'Cliente',
                  cliente_telefono: structuredData.cliente_telefono || phoneNumber || '',
                  cliente_email: structuredData.cliente_email,
                  fecha: structuredData.fecha,
                  hora: structuredData.hora,
                  numero_personas: structuredData.numero_personas || 2,
                  ocasion_especial: structuredData.ocasion_especial,
                  estado: 'pendiente',
                  notas: structuredData.notas,
                })
                console.log('[Webhook VAPI] Reservación INBOUND creada para call:', inboundCall.id)
              } catch (insertError) {
                console.error('[Webhook VAPI] Error creando reservación inbound:', insertError)
              }
            }
          }
        }
      }
    } else if (type === 'status-update' && message.status === 'ended') {
      const { data: endedCampaignCall } = await supabase
        .from('campaign_calls')
        .select('id')
        .eq('vapi_call_id', call.id)
        .single()

      const endedCall = endedCampaignCall as { id: string } | null
      if (endedCall) {
        await (supabase
          .from('campaign_calls') as any)
          .update({
            status: 'missed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', endedCall.id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Webhook VAPI] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
