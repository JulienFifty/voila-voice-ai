import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { createClient } from '@/lib/supabase-server'

export type Industry = 'inmobiliario' | 'restaurante' | 'clinica'

export interface MeProfile {
  id: string
  user_id: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: string
  industry: Industry
  active: boolean
}

export interface MeResponse {
  user: { id: string; email?: string }
  profile: MeProfile | null
}

/**
 * GET /api/me - Usuario actual y perfil (incl. industry para dashboard por giro)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: profileRaw, error } = await supabase
      .from('user_profiles')
      .select('id, user_id, full_name, company_name, phone, role, industry, active')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[API /me] Error fetching profile:', error)
    }

    const profile = profileRaw as { id: string; user_id: string; full_name: string | null; company_name: string | null; phone: string | null; role: string; industry?: Industry; active: boolean } | null
    const industry: Industry = profile?.industry ?? 'restaurante'

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: profile
        ? {
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name,
            company_name: profile.company_name,
            phone: profile.phone,
            role: profile.role,
            industry,
            active: profile.active,
          }
        : { id: '', user_id: user.id, full_name: null, company_name: null, phone: null, role: 'user', industry, active: true },
    } as MeResponse)
  } catch (err) {
    console.error('[API /me] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/me - Actualizar perfil del usuario (industry, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const allowed = ['industry', 'full_name', 'company_name', 'phone']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body && body[key] !== undefined) {
        updates[key] = body[key]
      }
    }
    if (updates.industry) {
      const valid = ['inmobiliario', 'restaurante', 'clinica']
      if (!valid.includes(updates.industry as string)) {
        return NextResponse.json({ error: 'industry inválido' }, { status: 400 })
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
    }

    // Usar Service Role para crear/actualizar perfil (evita bloqueos por RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = serviceRoleKey
      ? createSupabaseJsClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
      : await createClient()

    const { data: existing, error: fetchError } = await (supabase as any)
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('[API /me PATCH] Error fetching profile:', fetchError)
      return NextResponse.json({ error: 'Error al verificar perfil', detail: fetchError.message }, { status: 500 })
    }

    let profile: Record<string, unknown>
    if (existing?.id) {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) {
        console.error('[API /me PATCH] Error update:', error)
        return NextResponse.json({ error: 'Error actualizando perfil', detail: error.message }, { status: 500 })
      }
      profile = data as Record<string, unknown>
    } else {
      const insertPayload = {
        user_id: user.id,
        role: 'user',
        active: true,
        ...updates,
      }
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .insert(insertPayload)
        .select()
        .single()
      if (error) {
        console.error('[API /me PATCH] Error insert:', error)
        return NextResponse.json({ error: 'Error creando perfil', detail: error.message }, { status: 500 })
      }
      profile = data as Record<string, unknown>
    }

    const industry = (profile?.industry as Industry) ?? 'restaurante'

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        company_name: profile.company_name,
        phone: profile.phone,
        role: profile.role,
        industry,
        active: profile.active,
      },
    } as MeResponse)
  } catch (err) {
    console.error('[API /me PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
