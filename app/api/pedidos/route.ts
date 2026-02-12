import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { PedidoFormData } from '@/types/restaurant'

export const dynamic = 'force-dynamic'

/**
 * GET /api/pedidos - Listar pedidos del usuario (query: estado, from, to)
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
      .from('pedidos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (estado) query = query.eq('estado', estado)
    if (from) query = query.gte('created_at', `${from}T00:00:00`)
    if (to) query = query.lte('created_at', `${to}T23:59:59.999`)

    const { data: pedidos, error } = await query

    if (error) {
      console.error('[API Pedidos] Error fetching:', error)
      return NextResponse.json({ error: 'Error obteniendo pedidos' }, { status: 500 })
    }

    return NextResponse.json(pedidos || [])
  } catch (err) {
    console.error('[API Pedidos] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/pedidos - Crear pedido
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body: PedidoFormData = await request.json()
    const {
      cliente_nombre,
      cliente_telefono,
      cliente_email,
      items,
      total,
      moneda = 'MXN',
      estado = 'recibido',
      horario_entrega_estimado,
      notas,
      call_id,
    } = body

    if (!items?.length || total == null) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: items (array no vacío) y total' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: pedido, error } = await (supabase
      .from('pedidos') as any)
      .insert({
        user_id: user.id,
        call_id: call_id || null,
        cliente_nombre: cliente_nombre ?? null,
        cliente_telefono: cliente_telefono ?? null,
        cliente_email: cliente_email ?? null,
        items,
        total: Number(total),
        moneda,
        estado,
        horario_entrega_estimado: horario_entrega_estimado || null,
        notas: notas ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API Pedidos] Error creating:', error)
      return NextResponse.json({ error: 'Error creando pedido' }, { status: 500 })
    }

    return NextResponse.json(pedido)
  } catch (err) {
    console.error('[API Pedidos] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
