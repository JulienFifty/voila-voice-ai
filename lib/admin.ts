'use client'

import { createClient } from '@/lib/supabase'

/**
 * Verifica si el usuario actual es admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return false
  }
  
  // Intentar obtener perfil sin filtrar por active primero
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role, active')
    .eq('user_id', user.id)
    .single()
  
  // Log para debug
  console.log('Verificando admin - Profile:', profile, 'Error:', error)
  
  if (error || !profile) {
    // Si no tiene perfil, verificar metadata del usuario
    const { data: { user: fullUser } } = await supabase.auth.getUser()
    const role = fullUser?.user_metadata?.role
    console.log('No hay perfil, verificando metadata. Role:', role)
    
    return role === 'admin' || role === 'super_admin'
  }
  
  // Verificar role en perfil
  const profileData = profile as { role?: string }
  const isAdmin = profileData.role === 'admin' || profileData.role === 'super_admin'
  console.log('Perfil encontrado. Role:', profileData.role, 'Is Admin:', isAdmin)
  
  return isAdmin
}

/**
 * Obtiene el perfil completo del usuario actual
 */
export async function getUserProfile() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    console.error('Error obteniendo perfil:', error)
    return null
  }
  
  return profile
}

/**
 * Obtiene todos los usuarios (solo para admins)
 * Usa API route porque requiere acceso admin a auth.users
 */
export async function getAllUsers() {
  const supabase = createClient()
  
  // Verificar que sea admin
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('No tienes permisos de administrador')
  }
  
  // Obtener la sesión para enviar el token
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No hay sesión activa')
  }
  
  // Usar API route que tiene acceso admin, enviando el token en el header
  const response = await fetch('/api/admin/users', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
    console.error('[lib/admin] Error en getAllUsers:', errorData)
    throw new Error(errorData.error || errorData.message || 'Error obteniendo usuarios')
  }
  
  const data = await response.json()
  return data.users || []
}

/**
 * Obtiene estadísticas generales (solo para admins)
 */
export async function getAdminStats() {
  const supabase = createClient()
  
  // Verificar que sea admin
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('No tienes permisos de administrador')
  }
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  // Total de usuarios
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
  
  // Usuarios activos
  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
  
  // Total de llamadas del mes
  const { count: totalCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'answered')
    .gte('created_at', new Date(currentYear, currentMonth - 1, 1).toISOString())
  
  // Total de minutos del mes
  const { data: usageData } = await supabase
    .from('user_usage')
    .select('total_minutes')
    .eq('period_year', currentYear)
    .eq('period_month', currentMonth)
  
  const totalMinutes = (usageData as Array<{ total_minutes?: number }> | null)?.reduce((sum, u) => sum + (u.total_minutes || 0), 0) || 0
  
  // Ingresos estimados del mes (suma de precios de suscripciones activas)
  const { data: subscriptions } = await supabase
    .from('user_subscriptions')
    .select(`
      plans (
        price_monthly
      )
    `)
    .eq('status', 'active')
  
  const estimatedRevenue = subscriptions?.reduce((sum, sub: any) => {
    return sum + (sub.plans?.price_monthly || 0)
  }, 0) || 0
  
  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalCalls: totalCalls || 0,
    totalMinutes,
    estimatedRevenue,
  }
}
