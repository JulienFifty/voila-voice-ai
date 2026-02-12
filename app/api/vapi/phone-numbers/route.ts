import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { listVapiPhoneNumbers } from '@/lib/vapi'

/**
 * GET /api/vapi/phone-numbers - Listar números disponibles para outbound
 * Combina números de phone_numbers (con vapi_phone_number_id) y números de la API VAPI
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = await createClient()

    const dbNumbers = await supabase
      .from('phone_numbers')
      .select('id, numero, nombre, vapi_phone_number_id')
      .eq('user_id', user.id)
      .eq('activo', true)

    const vapiNumbers = await listVapiPhoneNumbers()

    const numbers: Array<{
      id: string
      numero: string
      nombre: string | null
      vapi_phone_number_id: string
      source: 'db' | 'vapi'
    }> = []

    for (const pn of (dbNumbers.data || []) as Array<{ id: string; numero: string; nombre: string | null; vapi_phone_number_id?: string | null }>) {
      if (pn.vapi_phone_number_id) {
        numbers.push({
          id: pn.id,
          numero: pn.numero,
          nombre: pn.nombre,
          vapi_phone_number_id: pn.vapi_phone_number_id,
          source: 'db',
        })
      }
    }

    for (const vn of vapiNumbers) {
      if (!numbers.some((n) => n.vapi_phone_number_id === vn.id)) {
        numbers.push({
          id: vn.id,
          numero: vn.number,
          nombre: vn.name || null,
          vapi_phone_number_id: vn.id,
          source: 'vapi',
        })
      }
    }

    return NextResponse.json(numbers)
  } catch (err) {
    console.error('[API VAPI Phone Numbers] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
