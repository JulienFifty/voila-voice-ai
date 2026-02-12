import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { ReservacionFormData, ReservacionEstado } from '@/types/restaurant'

export const dynamic = 'force-dynamic'

/**
 * GET /api/reservaciones/[id] - Obtener una reservación
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

    const { data: reservacion, error } = await supabase
      .from('reservaciones')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !reservacion) {
      return NextResponse.json({ error: 'Reservación no encontrada' }, { status: 404 })
    }

    return NextResponse.json(reservacion)
  } catch (err) {
    console.error('[API Reservaciones] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/reservaciones/[id] - Actualizar reservación
 */
export async function PATCH(
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

    const existing = await supabase
      .from('reservaciones')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existing.error || !existing.data) {
      return NextResponse.json({ error: 'Reservación no encontrada' }, { status: 404 })
    }

    const body: Partial<ReservacionFormData> & { estado?: ReservacionEstado } = await request.json()
    const allowed = [
      'cliente_nombre', 'cliente_telefono', 'cliente_email', 'fecha', 'hora',
      'numero_personas', 'notas', 'estado',
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body && (body as Record<string, unknown>)[key] !== undefined) {
        updates[key] = (body as Record<string, unknown>)[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
    }

    const { data: reservacion, error } = await (supabase
      .from('reservaciones') as any)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[API Reservaciones] Error updating:', error)
      return NextResponse.json({ error: 'Error actualizando reservación' }, { status: 500 })
    }

    return NextResponse.json(reservacion)
  } catch (err) {
    console.error('[API Reservaciones] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/reservaciones/[id]
 */
export async function DELETE(
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

    const { error } = await supabase
      .from('reservaciones')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[API Reservaciones] Error deleting:', error)
      return NextResponse.json({ error: 'Error eliminando reservación' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API Reservaciones] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
