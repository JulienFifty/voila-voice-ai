import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // noop
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .eq('active', true)
      .single()

    const isAdmin =
      profile?.role === 'admin' ||
      profile?.role === 'super_admin' ||
      user.user_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'super_admin'

    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Error obteniendo planes' }, { status: 500 })
    }

    return NextResponse.json({ plans })
  } catch (error: any) {
    console.error('Error GET /api/admin/plans:', error)
    return NextResponse.json({ error: 'Error interno', message: error.message }, { status: 500 })
  }
}