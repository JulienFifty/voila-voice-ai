import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { placeOutboundCalls, normalizeToE164 } from '@/lib/vapi'
import { CreateCampaignRequest } from '@/types/campaign'
import { getUserAssistantId } from '@/lib/userAssistant'

export const dynamic = 'force-dynamic'

/**
 * GET /api/campaigns - Listar campañas del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API Campaigns] Error fetching campaigns:', error)
      return NextResponse.json({ error: 'Error obteniendo campañas' }, { status: 500 })
    }

    return NextResponse.json(campaigns || [])
  } catch (err) {
    console.error('[API Campaigns] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/campaigns - Crear campaña y lanzar llamadas
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = await createClient()

    const body: CreateCampaignRequest = await request.json()

    const {
      name,
      description,
      vapi_assistant_id,
      vapi_phone_number_id,
      promo_message,
      recipients,
    } = body

    if (!name || !vapi_assistant_id || !vapi_phone_number_id || !recipients?.length) {
      return NextResponse.json(
        {
          error: 'Faltan campos requeridos: name, vapi_assistant_id, vapi_phone_number_id, recipients',
        },
        { status: 400 }
      )
    }

    const assistantId = vapi_assistant_id || (await getUserAssistantId(user.id))
    if (!assistantId) {
      return NextResponse.json(
        { error: 'No tienes un asistente configurado. Configura uno en Configuración.' },
        { status: 400 }
      )
    }

    const customers = recipients.map((r) => ({
      number: r.phone_number.startsWith('+') ? r.phone_number : normalizeToE164(r.phone_number),
      name: r.nombre,
    }))

    const assistantOverrides: Record<string, string> = {}
    if (promo_message) assistantOverrides.promo = promo_message

    let vapiResponse: unknown
    try {
      vapiResponse = await placeOutboundCalls({
        assistantId,
        phoneNumberId: vapi_phone_number_id,
        customers,
        assistantOverrides: Object.keys(assistantOverrides).length > 0 ? assistantOverrides : undefined,
      })
    } catch (vapiErr: unknown) {
      const msg = vapiErr instanceof Error ? vapiErr.message : 'Error al iniciar llamadas en VAPI'
      console.error('[API Campaigns] VAPI error:', vapiErr)
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const { data: campaign, error: campaignError } = await (supabase
      .from('campaigns') as any)
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        vapi_assistant_id: assistantId,
        vapi_phone_number_id,
        status: 'running',
        total_recipients: recipients.length,
        completed_calls: 0,
        failed_calls: 0,
        assistant_overrides: assistantOverrides,
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (campaignError || !campaign) {
      console.error('[API Campaigns] Error creating campaign:', campaignError)
      return NextResponse.json({ error: 'Error guardando campaña' }, { status: 500 })
    }

    const vapiCalls = Array.isArray(vapiResponse)
      ? vapiResponse
      : (vapiResponse as { calls?: Array<{ id: string }> }).calls || []

    const campaignCallsToInsert = recipients.map((r, idx) => {
      const vapiCall = Array.isArray(vapiCalls) ? vapiCalls[idx] : vapiCalls[idx]
      const vapiCallId = vapiCall && typeof vapiCall === 'object' && 'id' in vapiCall ? (vapiCall as { id: string }).id : null
      return {
        campaign_id: campaign.id,
        lead_id: r.lead_id || null,
        phone_number: r.phone_number.startsWith('+') ? r.phone_number : normalizeToE164(r.phone_number),
        nombre: r.nombre || null,
        email: r.email || null,
        status: vapiCallId ? 'calling' : 'pending',
        vapi_call_id: vapiCallId,
      }
    })

    const { error: callsError } = await (supabase.from('campaign_calls') as any).insert(campaignCallsToInsert)

    if (callsError) {
      console.error('[API Campaigns] Error creating campaign_calls:', callsError)
    }

    const { data: createdCampaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign.id)
      .single()

    return NextResponse.json(createdCampaign || campaign)
  } catch (err) {
    console.error('[API Campaigns] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
