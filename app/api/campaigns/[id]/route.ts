import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'

/**
 * GET /api/campaigns/[id] - Obtener detalle de campaña con llamadas
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    const { data: campaignCalls, error: callsError } = await supabase
      .from('campaign_calls')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })

    if (callsError) {
      console.error('[API Campaigns] Error fetching campaign_calls:', callsError)
    }

    return NextResponse.json(
      Object.assign({}, campaign, { campaign_calls: campaignCalls || [] })
    )
  } catch (err) {
    console.error('[API Campaigns] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

