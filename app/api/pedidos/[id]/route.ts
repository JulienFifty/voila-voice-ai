import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { PedidoFormData, PedidoEstado } from '@/types/restaurant'
import { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient<Database>(url, key)
  return null
}

/**
 * GET /api/pedidos/[id] - Obtener un pedido
 * Usa service role para no depender de cookies (RLS).
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

    const supabase = getSupabase() ?? (await createServerClient())

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(pedido)
  } catch (err) {
    console.error('[API Pedidos] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/pedidos/[id] - Actualizar pedido (estado y/o campos)
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

    const supabase = getSupabase() ?? (await createServerClient())

    const existing = await supabase
      .from('pedidos')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existing.error || !existing.data) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const body: Partial<PedidoFormData> & { estado?: PedidoEstado } = await request.json()
    const allowed = [
      'cliente_nombre', 'cliente_telefono', 'cliente_email', 'items', 'total', 'moneda',
      'estado', 'horario_entrega_estimado', 'notas',
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

    const { data: pedido, error } = await (supabase
      .from('pedidos') as any)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[API Pedidos] Error updating:', error)
      return NextResponse.json({ error: 'Error actualizando pedido' }, { status: 500 })
    }

    return NextResponse.json(pedido)
  } catch (err) {
    console.error('[API Pedidos] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/pedidos/[id] - Eliminar pedido (o cancelar lógicamente según tu criterio)
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

    const supabase = getSupabase() ?? (await createServerClient())

    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[API Pedidos] Error deleting:', error)
      return NextResponse.json({ error: 'Error eliminando pedido' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API Pedidos] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
