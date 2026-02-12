import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * API Route para obtener todos los usuarios (solo admins)
 * GET /api/admin/users
 */
export async function GET(request: NextRequest) {
  try {
    let user: any = null
    
    // Intentar obtener el token del header primero (más confiable)
    const authHeader = request.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      // Verificar el token con Supabase
      const tempSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => [],
            setAll: () => {},
          },
        }
      )
      
      const { data: { user: tokenUser }, error: tokenError } = await tempSupabase.auth.getUser(token)
      if (tokenUser && !tokenError) {
        user = tokenUser
      }
    }
    
    // Si no se obtuvo del header, intentar con cookies
    if (!user) {
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
              // No hacer nada
            },
          },
        }
      )

      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()
      if (cookieUser && !authError) {
        user = cookieUser
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }
    
    // Log para debug en servidor (visible en terminal donde corre npm run dev)
    console.log('\n========== [API Admin Users] ==========')
    console.log('User ID:', user.id)
    console.log('User Email:', user.email)
    console.log('User metadata:', JSON.stringify(user.user_metadata, null, 2))

    // Verificar que exista la Service Role Key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[API Admin Users] ERROR: SUPABASE_SERVICE_ROLE_KEY no está configurada')
      return NextResponse.json(
        { error: 'Error de configuración del servidor: Service Role Key no encontrada' },
        { status: 500 }
      )
    }

    // Verificar si es admin - usar Service Role para evitar problemas de RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obtener perfil con Service Role (bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, active')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('Perfil obtenido:', JSON.stringify(profile, null, 2))
    console.log('Error perfil:', profileError?.message || 'null')
    console.log('========================================\n')

    // Verificar role en perfil o metadata
    const roleFromProfile = profile?.role
    const roleFromMetadata = user.user_metadata?.role
    
    const userIsAdmin = 
      roleFromProfile === 'admin' || 
      roleFromProfile === 'super_admin' || 
      roleFromMetadata === 'admin' || 
      roleFromMetadata === 'super_admin'

    console.log('[API Admin Users] Verificación admin - Profile role:', roleFromProfile, 'Metadata role:', roleFromMetadata, 'Is Admin:', userIsAdmin)

    if (!userIsAdmin) {
      console.log('[API Admin Users] Usuario NO es admin')
      return NextResponse.json(
        { 
          error: 'No tienes permisos de administrador',
          debug: {
            hasProfile: !!profile,
            profileRole: roleFromProfile,
            metadataRole: roleFromMetadata,
            profileActive: profile?.active,
            userId: user.id,
            profileError: profileError?.message
          }
        },
        { status: 403 }
      )
    }
    
    console.log('[API Admin Users] Usuario ES admin. Role:', roleFromProfile || roleFromMetadata)

    // Usar Service Role para obtener todos los usuarios (ya lo tenemos de arriba)

    // Obtener todos los usuarios de auth
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError)
      return NextResponse.json(
        { error: 'Error obteniendo usuarios' },
        { status: 500 }
      )
    }

    // Obtener perfiles (primero sin relaciones para debug)
    let { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('[API Admin Users] Error obteniendo perfiles:', profilesError)
      console.error('[API Admin Users] Detalles del error:', JSON.stringify(profilesError, null, 2))
      return NextResponse.json(
        { 
          error: 'Error obteniendo perfiles',
          details: profilesError.message,
          hint: profilesError.hint || 'Verifica que la tabla user_profiles exista y que la Service Role Key tenga permisos'
        },
        { status: 500 }
      )
    }

    // Si no hay perfiles, devolver lista vacía
    if (!profiles || profiles.length === 0) {
      console.log('[API Admin Users] No se encontraron perfiles')
      return NextResponse.json({ users: [] })
    }

    // Ahora obtener relaciones por separado para evitar errores
    const profileIds = profiles.map(p => p.id)
    const userIds = profiles.map(p => p.user_id)

    // Obtener suscripciones
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*, plans(*)')
      .in('user_id', userIds)

    if (subsError) {
      console.warn('[API Admin Users] Error obteniendo suscripciones (continuando sin ellas):', subsError)
    }

    // Obtener uso mensual
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const { data: usage, error: usageError } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .in('user_id', userIds)
      .eq('period_year', currentYear)
      .eq('period_month', currentMonth)

    if (usageError) {
      console.warn('[API Admin Users] Error obteniendo uso (continuando sin él):', usageError)
    }

    // Combinar datos manualmente
    profiles = profiles.map(profile => ({
      ...profile,
      user_subscriptions: subscriptions?.filter((s: any) => s.user_id === profile.user_id) || [],
      user_usage: usage?.filter((u: any) => u.user_id === profile.user_id) || []
    }))

    // Combinar datos de auth.users con perfiles
    const users = profiles.map(profile => {
      const authUser = authUsers?.users.find(u => u.id === profile.user_id)
      const monthlyUsage = profile.user_usage?.[0] || { total_minutes: 0, total_calls: 0 }

      return {
        ...profile,
        email: authUser?.email || 'N/A',
        email_confirmed_at: authUser?.email_confirmed_at,
        created_at: authUser?.created_at || profile.created_at,
        monthlyUsage: {
          total_minutes: monthlyUsage.total_minutes || 0,
          total_calls: monthlyUsage.total_calls || 0,
        },
      }
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('[API Admin Users] Error inesperado:', error)
    console.error('[API Admin Users] Stack trace:', error.stack)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
