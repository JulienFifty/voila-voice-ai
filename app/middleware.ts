import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Detectar si estamos en el subdominio app o en producción
  const isAppSubdomain = hostname.startsWith('app.') || 
                         hostname === 'app.voilavoiceai.com' ||
                         process.env.NODE_ENV === 'production' && hostname.includes('app.')

  // Si estamos en app.voilavoiceai.com y el path no es /dashboard, redirigir
  if (isAppSubdomain) {
    // Redirigir la raíz a /dashboard
    if (pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Si intenta acceder a rutas que no son del dashboard, redirigir a dashboard
    // Permitir /privacy para que los usuarios puedan ver la política de privacidad
    if (!pathname.startsWith('/dashboard') && 
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/login') && 
        !pathname.startsWith('/register') &&
        !pathname.startsWith('/privacy') &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/_next')) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Si estamos en el dominio principal y intentan acceder a /dashboard, redirigir a app
  if (!isAppSubdomain && pathname.startsWith('/dashboard')) {
    // En producción, redirigir a app.voilavoiceai.com
    if (process.env.NODE_ENV === 'production') {
      const appUrl = new URL(`https://app.voilavoiceai.com${pathname}`)
      return NextResponse.redirect(appUrl)
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas de admin (verificar antes que dashboard)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar si es admin
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      // Verificar role en profile o en metadata
      const roleFromProfile = profile?.role
      const roleFromMetadata = user.user_metadata?.role
      
      const userIsAdmin = 
        roleFromProfile === 'admin' || 
        roleFromProfile === 'super_admin' || 
        roleFromMetadata === 'admin' || 
        roleFromMetadata === 'super_admin'

      if (!userIsAdmin) {
        // No es admin, redirigir al dashboard
        console.log('Usuario no es admin. Profile:', profile, 'Metadata:', user.user_metadata)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // Si hay error al verificar (por ejemplo, no tiene perfil), verificar metadata
      console.log('Error verificando admin en perfil, verificando metadata:', error)
      
      const roleFromMetadata = user.user_metadata?.role
      const userIsAdmin = roleFromMetadata === 'admin' || roleFromMetadata === 'super_admin'
      
      if (!userIsAdmin) {
        console.log('Usuario no es admin según metadata:', user.user_metadata)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Proteger rutas del dashboard (usuarios normales)
  if (!user && (pathname.startsWith('/dashboard') || isAppSubdomain)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si es admin y está en dashboard, redirigir a admin
  if (user && (pathname.startsWith('/dashboard') || (isAppSubdomain && pathname === '/'))) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .eq('active', true)
        .single()

      const userIsAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'super_admin'

      if (userIsAdmin) {
        // Es admin, redirigir a panel admin en lugar de dashboard
        if (pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      }
    } catch (error) {
      // Si hay error, continuar normalmente
    }
  }

  if (user && (pathname === '/login' || pathname === '/register')) {
    // Si es admin, redirigir a admin, si no a dashboard
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .eq('active', true)
        .single()

      const userIsAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'super_admin'

      const redirectPath = userIsAdmin ? '/admin/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    } catch {
      const redirectPath = isAppSubdomain ? '/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
