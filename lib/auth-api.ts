import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase-server'
import { Database } from '@/types/database'
import type { User } from '@supabase/supabase-js'

/**
 * Obtiene el usuario autenticado en API routes.
 * Prueba primero el Bearer token (Authorization header) y luego las cookies.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    const tempSupabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: { user }, error } = await tempSupabase.auth.getUser(token)
    if (user && !error) return user
  }
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (user && !error) return user
  return null
}
