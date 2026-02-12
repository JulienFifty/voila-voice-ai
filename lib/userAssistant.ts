'use client'

import { createClient } from '@/lib/supabase'

/**
 * Obtiene el assistant ID de VAPI configurado para un usuario
 * 
 * @param userId - ID del usuario (opcional, si no se provee usa el usuario autenticado)
 * @returns Assistant ID de VAPI o null si no existe
 */
export async function getUserAssistantId(userId?: string): Promise<string | null> {
  const supabase = createClient()
  
  // Si no se provee userId, obtener del usuario autenticado
  let targetUserId = userId
  
  if (!targetUserId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Error obteniendo usuario:', authError)
      return null
    }
    
    targetUserId = user.id
  }
  
  const { data, error } = await supabase
    .from('user_assistants')
    .select('vapi_assistant_id')
    .eq('user_id', targetUserId)
    .eq('active', true)
    .single()
  
  if (error || !data) {
    console.error('Error obteniendo assistant ID:', error)
    return null
  }
  
  return (data as { vapi_assistant_id: string }).vapi_assistant_id
}

/**
 * Obtiene toda la información del assistant configurado para un usuario
 * 
 * @param userId - ID del usuario (opcional, si no se provee usa el usuario autenticado)
 * @returns Objeto con toda la información del assistant o null
 */
export async function getUserAssistant(userId?: string): Promise<{
  id: string
  vapi_assistant_id: string
  vapi_assistant_name: string | null
  vapi_public_key: string | null
  agent_config: any
  active: boolean
} | null> {
  const supabase = createClient()
  
  // Si no se provee userId, obtener del usuario autenticado
  let targetUserId = userId
  
  if (!targetUserId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Error obteniendo usuario:', authError)
      return null
    }
    
    targetUserId = user.id
  }
  
  const { data, error } = await supabase
    .from('user_assistants')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('active', true)
    .single()
  
  if (error || !data) {
    console.error('Error obteniendo assistant:', error)
    return null
  }
  
  return data
}

/**
 * Crea o actualiza la configuración de assistant para un usuario
 * Solo disponible para administradores o el mismo usuario
 * 
 * @param vapiAssistantId - Assistant ID de VAPI
 * @param vapiAssistantName - Nombre del assistant
 * @param userId - ID del usuario (opcional, si no se provee usa el usuario autenticado)
 */
export async function setUserAssistant(
  vapiAssistantId: string,
  vapiAssistantName?: string,
  userId?: string
): Promise<boolean> {
  const supabase = createClient()
  
  // Si no se provee userId, obtener del usuario autenticado
  let targetUserId = userId
  
  if (!targetUserId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Error obteniendo usuario:', authError)
      return false
    }
    
    targetUserId = user.id
  }
  
  // Verificar si ya existe un assistant para este usuario
  const existing = await supabase
    .from('user_assistants')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('active', true)
    .single()
  
  const existingData = existing.data as { id: string } | null
  if (existingData) {
    // Actualizar existente
    const { error } = await (supabase
      .from('user_assistants') as any)
      .update({
        vapi_assistant_id: vapiAssistantId,
        vapi_assistant_name: vapiAssistantName || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingData.id)
    
    if (error) {
      console.error('Error actualizando assistant:', error)
      return false
    }
  } else {
    // Crear nuevo
    const { error } = await (supabase
      .from('user_assistants') as any)
      .insert({
        user_id: targetUserId,
        vapi_assistant_id: vapiAssistantId,
        vapi_assistant_name: vapiAssistantName || null,
        active: true,
      })
    
    if (error) {
      console.error('Error creando assistant:', error)
      return false
    }
  }
  
  return true
}
