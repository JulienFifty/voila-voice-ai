import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'

/**
 * POST /api/campaigns/[id]/cancel - Cancelar campaña
 */
export async function POST(
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

    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    const campaignData = campaign as { id: string; status: string }
    if (campaignData.status === 'completed' || campaignData.status === 'cancelled') {
      return NextResponse.json({ error: 'La campaña ya está finalizada o cancelada' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await (supabase
      .from('campaigns') as any)
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[API Campaigns] Error cancelling campaign:', updateError)
      return NextResponse.json({ error: 'Error al cancelar campaña' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[API Campaigns] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
