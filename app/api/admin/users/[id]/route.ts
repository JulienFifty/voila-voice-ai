import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

async function ensureAdmin(request: NextRequest) {
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
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, isAdmin: false }
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

  return { user, isAdmin }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isAdmin } = await ensureAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const userId = params.id

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // noop
          },
        },
      }
    )

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_subscriptions (*, plans (*)),
        user_usage (*)
      `
      )
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const monthlyUsage =
      profile.user_usage?.find(
        (u: any) => u.period_year === currentYear && u.period_month === currentMonth
      ) || { total_minutes: 0, total_calls: 0 }

    return NextResponse.json({
      user: {
        ...profile,
        monthlyUsage: {
          total_minutes: monthlyUsage.total_minutes || 0,
          total_calls: monthlyUsage.total_calls || 0,
        },
      },
    })
  } catch (error: any) {
    console.error('Error GET /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno', message: error.message }, { status: 500 })
  }
}

// PATCH /api/admin/users/[id]
// Body: { active?: boolean, plan_id?: string }
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, isAdmin } = await ensureAdmin(request)
    if (!isAdmin || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json().catch(() => ({}))
    const { active, plan_id } = body

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // noop
          },
        },
      }
    )

    if (typeof active === 'boolean') {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ active })
        .eq('user_id', userId)

      if (updateError) {
        return NextResponse.json({ error: 'No se pudo actualizar estado' }, { status: 400 })
      }
    }

    if (plan_id) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
        }
      )

      const { data: plan } = await supabase
        .from('plans')
        .select('id, price_monthly')
        .eq('id', plan_id)
        .single()

      if (!plan) {
        return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
      }

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      const periodStart = new Date()
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      if (subscription) {
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            plan_id,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            status: 'active',
          })
          .eq('id', subscription.id)
      } else {
        await supabaseAdmin.from('user_subscriptions').insert({
          user_id: userId,
          plan_id,
          status: 'active',
          billing_cycle: 'monthly',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error PATCH /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno', message: error.message }, { status: 500 })
  }
}