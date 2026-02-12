import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { ReservacionFormData } from '@/types/restaurant'

/**
 * GET /api/reservaciones - Listar reservaciones del usuario (query: estado, from, to)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
      .from('reservaciones')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })

    if (estado) query = query.eq('estado', estado)
    if (from) query = query.gte('fecha', from)
    if (to) query = query.lte('fecha', to)

    const { data: reservaciones, error } = await query

    if (error) {
      console.error('[API Reservaciones] Error fetching:', error)
      return NextResponse.json({ error: 'Error obteniendo reservaciones' }, { status: 500 })
    }

    return NextResponse.json(reservaciones || [])
  } catch (err) {
    console.error('[API Reservaciones] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/reservaciones - Crear reservación
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body: ReservacionFormData = await request.json()
    const {
      cliente_nombre,
      cliente_telefono,
      cliente_email,
      fecha,
      hora,
      numero_personas = 1,
      notas,
      estado = 'pendiente',
      call_id,
    } = body

    if (!fecha || !hora) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: fecha y hora' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: reservacion, error } = await (supabase
      .from('reservaciones') as any)
      .insert({
        user_id: user.id,
        call_id: call_id || null,
        cliente_nombre: cliente_nombre ?? null,
        cliente_telefono: cliente_telefono ?? null,
        cliente_email: cliente_email ?? null,
        fecha,
        hora,
        numero_personas: Number(numero_personas) || 1,
        notas: notas ?? null,
        estado,
      })
      .select()
      .single()

    if (error) {
      console.error('[API Reservaciones] Error creating:', error)
      return NextResponse.json({ error: 'Error creando reservación' }, { status: 500 })
    }

    return NextResponse.json(reservacion)
  } catch (err) {
    console.error('[API Reservaciones] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
