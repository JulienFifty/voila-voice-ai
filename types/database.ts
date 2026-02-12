export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      calls: {
        Row: {
          id: string
          created_at: string
          phone_number: string
          duration_seconds: number
          status: 'answered' | 'missed'
          recording_url: string | null
          transcript: string | null
          user_id: string
          extracted_data: Json | null
          lead_id: string | null
          tipo_interes: 'compra' | 'renta' | 'venta' | 'info' | null
          zona_interes: string[] | null
          presupuesto_min: number | null
          presupuesto_max: number | null
          urgencia: 'alta' | 'media' | 'baja' | null
          score: 'A' | 'B' | 'C' | null
          converted_to_lead: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          phone_number: string
          duration_seconds: number
          status: 'answered' | 'missed'
          recording_url?: string | null
          transcript?: string | null
          user_id: string
          extracted_data?: Json | null
          lead_id?: string | null
          tipo_interes?: 'compra' | 'renta' | 'venta' | 'info' | null
          zona_interes?: string[] | null
          presupuesto_min?: number | null
          presupuesto_max?: number | null
          urgencia?: 'alta' | 'media' | 'baja' | null
          score?: 'A' | 'B' | 'C' | null
          converted_to_lead?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          phone_number?: string
          duration_seconds?: number
          status?: 'answered' | 'missed'
          recording_url?: string | null
          transcript?: string | null
          user_id?: string
          extracted_data?: Json | null
          lead_id?: string | null
          tipo_interes?: 'compra' | 'renta' | 'venta' | 'info' | null
          zona_interes?: string[] | null
          presupuesto_min?: number | null
          presupuesto_max?: number | null
          urgencia?: 'alta' | 'media' | 'baja' | null
          score?: 'A' | 'B' | 'C' | null
          converted_to_lead?: boolean
        }
      }
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          nombre: string
          telefono: string
          email: string | null
          presupuesto_min: number | null
          presupuesto_max: number | null
          tiene_preaprobacion: boolean
          banco: string | null
          monto_aprobado: number | null
          tipo_pago: 'contado' | 'credito' | 'mix' | null
          tipo_busqueda: 'compra' | 'renta' | 'venta' | null
          tipo_propiedad: 'casa' | 'depa' | 'terreno' | 'otro' | null
          zonas_interes: string[] | null
          recamaras: number | null
          baños: number | null
          estacionamientos: number | null
          amenidades: string[] | null
          urgencia: 'alta' | 'media' | 'baja' | null
          timeline: 'inmediato' | '1-3meses' | '3-6meses' | '6+meses' | null
          proximo_followup: string | null
          score: 'A' | 'B' | 'C' | null
          estado: 'nuevo' | 'contactado' | 'visita_agendada' | 'negociacion' | 'cerrado' | 'perdido'
          probabilidad_cierre: number | null
          valor_estimado: number | null
          fuente: 'llamada_ia' | 'referido' | 'open_house' | 'redes_sociales' | 'sitio_web' | 'otro' | null
          ultima_interaccion: string | null
          numero_interacciones: number
          notas: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          nombre: string
          telefono: string
          email?: string | null
          presupuesto_min?: number | null
          presupuesto_max?: number | null
          tiene_preaprobacion?: boolean
          banco?: string | null
          monto_aprobado?: number | null
          tipo_pago?: 'contado' | 'credito' | 'mix' | null
          tipo_busqueda?: 'compra' | 'renta' | 'venta' | null
          tipo_propiedad?: 'casa' | 'depa' | 'terreno' | 'otro' | null
          zonas_interes?: string[] | null
          recamaras?: number | null
          baños?: number | null
          estacionamientos?: number | null
          amenidades?: string[] | null
          urgencia?: 'alta' | 'media' | 'baja' | null
          timeline?: 'inmediato' | '1-3meses' | '3-6meses' | '6+meses' | null
          proximo_followup?: string | null
          score?: 'A' | 'B' | 'C' | null
          estado?: 'nuevo' | 'contactado' | 'visita_agendada' | 'negociacion' | 'cerrado' | 'perdido'
          probabilidad_cierre?: number | null
          valor_estimado?: number | null
          fuente?: 'llamada_ia' | 'referido' | 'open_house' | 'redes_sociales' | 'sitio_web' | 'otro' | null
          ultima_interaccion?: string | null
          numero_interacciones?: number
          notas?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          nombre?: string
          telefono?: string
          email?: string | null
          presupuesto_min?: number | null
          presupuesto_max?: number | null
          tiene_preaprobacion?: boolean
          banco?: string | null
          monto_aprobado?: number | null
          tipo_pago?: 'contado' | 'credito' | 'mix' | null
          tipo_busqueda?: 'compra' | 'renta' | 'venta' | null
          tipo_propiedad?: 'casa' | 'depa' | 'terreno' | 'otro' | null
          zonas_interes?: string[] | null
          recamaras?: number | null
          baños?: number | null
          estacionamientos?: number | null
          amenidades?: string[] | null
          urgencia?: 'alta' | 'media' | 'baja' | null
          timeline?: 'inmediato' | '1-3meses' | '3-6meses' | '6+meses' | null
          proximo_followup?: string | null
          score?: 'A' | 'B' | 'C' | null
          estado?: 'nuevo' | 'contactado' | 'visita_agendada' | 'negociacion' | 'cerrado' | 'perdido'
          probabilidad_cierre?: number | null
          valor_estimado?: number | null
          fuente?: 'llamada_ia' | 'referido' | 'open_house' | 'redes_sociales' | 'sitio_web' | 'otro' | null
          ultima_interaccion?: string | null
          numero_interacciones?: number
          notas?: string | null
        }
      }
      actividades: {
        Row: {
          id: string
          created_at: string
          lead_id: string
          user_id: string
          tipo: 'llamada' | 'whatsapp' | 'email' | 'visita' | 'nota'
          descripcion: string | null
          call_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          lead_id: string
          user_id: string
          tipo: 'llamada' | 'whatsapp' | 'email' | 'visita' | 'nota'
          descripcion?: string | null
          call_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          lead_id?: string
          user_id?: string
          tipo?: 'llamada' | 'whatsapp' | 'email' | 'visita' | 'nota'
          descripcion?: string | null
          call_id?: string | null
          metadata?: Json | null
        }
      }
      propiedades: {
        Row: {
          id: string
          created_at: string
          user_id: string
          direccion: string
          zona: string | null
          tipo: 'casa' | 'depa' | 'terreno' | 'otro'
          precio: number
          m2_construccion: number | null
          m2_terreno: number | null
          recamaras: number | null
          baños: number | null
          estacionamientos: number | null
          estado: 'disponible' | 'apartada' | 'vendida'
          descripcion: string | null
          fotos: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          direccion: string
          zona?: string | null
          tipo: 'casa' | 'depa' | 'terreno' | 'otro'
          precio: number
          m2_construccion?: number | null
          m2_terreno?: number | null
          recamaras?: number | null
          baños?: number | null
          estacionamientos?: number | null
          estado?: 'disponible' | 'apartada' | 'vendida'
          descripcion?: string | null
          fotos?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          direccion?: string
          zona?: string | null
          tipo?: 'casa' | 'depa' | 'terreno' | 'otro'
          precio?: number
          m2_construccion?: number | null
          m2_terreno?: number | null
          recamaras?: number | null
          baños?: number | null
          estacionamientos?: number | null
          estado?: 'disponible' | 'apartada' | 'vendida'
          descripcion?: string | null
          fotos?: string[] | null
          metadata?: Json | null
        }
      }
      phone_numbers: {
        Row: {
          id: string
          created_at: string
          user_id: string
          numero: string
          nombre: string | null
          tipo: 'principal' | 'secundario' | 'especializado' | null
          uso_especifico: string | null
          script_custom: string | null
          total_llamadas: number
          activo: boolean
          vapi_phone_number_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          numero: string
          nombre?: string | null
          tipo?: 'principal' | 'secundario' | 'especializado' | null
          uso_especifico?: string | null
          script_custom?: string | null
          total_llamadas?: number
          activo?: boolean
          vapi_phone_number_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          numero?: string
          nombre?: string | null
          tipo?: 'principal' | 'secundario' | 'especializado' | null
          uso_especifico?: string | null
          script_custom?: string | null
          total_llamadas?: number
          activo?: boolean
          vapi_phone_number_id?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          description: string | null
          vapi_assistant_id: string
          vapi_phone_number_id: string
          status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled'
          total_recipients: number
          completed_calls: number
          failed_calls: number
          assistant_overrides: Json
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          description?: string | null
          vapi_assistant_id: string
          vapi_phone_number_id: string
          status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled'
          total_recipients?: number
          completed_calls?: number
          failed_calls?: number
          assistant_overrides?: Json
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          description?: string | null
          vapi_assistant_id?: string
          vapi_phone_number_id?: string
          status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled'
          total_recipients?: number
          completed_calls?: number
          failed_calls?: number
          assistant_overrides?: Json
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
      }
      campaign_calls: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          campaign_id: string
          lead_id: string | null
          phone_number: string
          nombre: string | null
          email: string | null
          status: 'pending' | 'calling' | 'answered' | 'missed' | 'failed'
          vapi_call_id: string | null
          duration_seconds: number | null
          recording_url: string | null
          transcript: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id: string
          lead_id?: string | null
          phone_number: string
          nombre?: string | null
          email?: string | null
          status?: 'pending' | 'calling' | 'answered' | 'missed' | 'failed'
          vapi_call_id?: string | null
          duration_seconds?: number | null
          recording_url?: string | null
          transcript?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id?: string
          lead_id?: string | null
          phone_number?: string
          nombre?: string | null
          email?: string | null
          status?: 'pending' | 'calling' | 'answered' | 'missed' | 'failed'
          vapi_call_id?: string | null
          duration_seconds?: number | null
          recording_url?: string | null
          transcript?: string | null
          metadata?: Json
        }
      }
      user_assistants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          vapi_assistant_id: string
          vapi_assistant_name: string | null
          vapi_public_key: string | null
          agent_config: Json | null
          active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          vapi_assistant_id: string
          vapi_assistant_name?: string | null
          vapi_public_key?: string | null
          agent_config?: Json | null
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          vapi_assistant_id?: string
          vapi_assistant_name?: string | null
          vapi_public_key?: string | null
          agent_config?: Json | null
          active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          role: 'user' | 'admin' | 'super_admin'
          industry: 'inmobiliario' | 'restaurante' | 'clinica'
          active: boolean
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          industry?: 'inmobiliario' | 'restaurante' | 'clinica'
          active?: boolean
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          industry?: 'inmobiliario' | 'restaurante' | 'clinica'
          active?: boolean
          metadata?: Json | null
        }
      }
      pedidos: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          call_id: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          cliente_email: string | null
          items: Json
          total: number
          moneda: string
          estado: 'recibido' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'
          horario_entrega_estimado: string | null
          notas: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          call_id?: string | null
          cliente_nombre?: string | null
          cliente_telefono?: string | null
          cliente_email?: string | null
          items?: Json
          total?: number
          moneda?: string
          estado?: 'recibido' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'
          horario_entrega_estimado?: string | null
          notas?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          call_id?: string | null
          cliente_nombre?: string | null
          cliente_telefono?: string | null
          cliente_email?: string | null
          items?: Json
          total?: number
          moneda?: string
          estado?: 'recibido' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'
          horario_entrega_estimado?: string | null
          notas?: string | null
        }
      }
      reservaciones: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          call_id: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          cliente_email: string | null
          fecha: string
          hora: string
          numero_personas: number
          notas: string | null
          estado: 'pendiente' | 'confirmada' | 'completada' | 'no_show' | 'cancelada'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          call_id?: string | null
          cliente_nombre?: string | null
          cliente_telefono?: string | null
          cliente_email?: string | null
          fecha: string
          hora: string
          numero_personas?: number
          notas?: string | null
          estado?: 'pendiente' | 'confirmada' | 'completada' | 'no_show' | 'cancelada'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          call_id?: string | null
          cliente_nombre?: string | null
          cliente_telefono?: string | null
          cliente_email?: string | null
          fecha?: string
          hora?: string
          numero_personas?: number
          notas?: string | null
          estado?: 'pendiente' | 'confirmada' | 'completada' | 'no_show' | 'cancelada'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
