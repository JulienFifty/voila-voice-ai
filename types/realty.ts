// Tipos específicos para el módulo inmobiliario

export type TipoInteres = 'compra' | 'renta' | 'venta' | 'info'
export type TipoPropiedad = 'casa' | 'depa' | 'terreno' | 'otro'
export type TipoBusqueda = 'compra' | 'renta' | 'venta'
export type Urgencia = 'alta' | 'media' | 'baja'
export type Score = 'A' | 'B' | 'C'
export type EstadoLead = 'nuevo' | 'contactado' | 'visita_agendada' | 'negociacion' | 'cerrado' | 'perdido'
export type Timeline = 'inmediato' | '1-3meses' | '3-6meses' | '6+meses'
export type TipoPago = 'contado' | 'credito' | 'mix'
export type TipoActividad = 'llamada' | 'whatsapp' | 'email' | 'visita' | 'nota'
export type FuenteLead = 'llamada_ia' | 'referido' | 'open_house' | 'redes_sociales' | 'sitio_web' | 'otro'
export type EstadoPropiedad = 'disponible' | 'apartada' | 'vendida'
export type TipoNumero = 'principal' | 'secundario' | 'especializado'

// Datos extraídos por IA de una transcripción
export interface ExtractedData {
  // Info personal
  nombre?: string
  telefono: string
  email?: string
  
  // Info financiera
  tienePreaprobacion: boolean
  banco?: string
  montoAprobado?: number
  presupuestoMin?: number
  presupuestoMax?: number
  
  // Búsqueda
  tipoBusqueda: TipoBusqueda | 'info'
  tipoPropiedad?: TipoPropiedad
  zonasInteres?: string[]
  recamaras?: number
  baños?: number
  estacionamientos?: number
  
  // Timeline y urgencia
  timeline?: Timeline
  urgencia?: Urgencia
  
  // Calificación
  score?: Score
  motivoScore?: string
  probabilidadCierre?: number // 0-100
  
  // Contexto
  objeciones?: string[]
  preguntasClave?: string[]
  siguientePaso?: string
}

// Lead completo (basado en la tabla de DB)
export interface Lead {
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
  tipo_pago: TipoPago | null
  tipo_busqueda: TipoBusqueda | null
  tipo_propiedad: TipoPropiedad | null
  zonas_interes: string[] | null
  recamaras: number | null
  baños: number | null
  estacionamientos: number | null
  amenidades: string[] | null
  urgencia: Urgencia | null
  timeline: Timeline | null
  proximo_followup: string | null
  score: Score | null
  estado: EstadoLead
  probabilidad_cierre: number | null
  valor_estimado: number | null
  fuente: FuenteLead | null
  ultima_interaccion: string | null
  numero_interacciones: number
  notas: string | null
}

// Actividad de un lead
export interface Actividad {
  id: string
  created_at: string
  lead_id: string
  user_id: string
  tipo: TipoActividad
  descripcion: string | null
  call_id: string | null
  metadata: Record<string, any> | null
}

// Propiedad
export interface Propiedad {
  id: string
  created_at: string
  user_id: string
  direccion: string
  zona: string | null
  tipo: TipoPropiedad
  precio: number
  m2_construccion: number | null
  m2_terreno: number | null
  recamaras: number | null
  baños: number | null
  estacionamientos: number | null
  estado: EstadoPropiedad
  descripcion: string | null
  fotos: string[] | null
  metadata: Record<string, any> | null
}

// Número telefónico
export interface PhoneNumber {
  id: string
  created_at: string
  user_id: string
  numero: string
  nombre: string | null
  tipo: TipoNumero | null
  uso_especifico: string | null
  script_custom: string | null
  total_llamadas: number
  activo: boolean
}

// Call con datos inmobiliarios extendidos
export interface CallWithRealtyData {
  id: string
  created_at: string
  phone_number: string
  duration_seconds: number
  status: 'answered' | 'missed'
  recording_url: string | null
  transcript: string | null
  user_id: string
  // Campos inmobiliarios
  extracted_data: ExtractedData | null
  lead_id: string | null
  tipo_interes: TipoInteres | null
  zona_interes: string[] | null
  presupuesto_min: number | null
  presupuesto_max: number | null
  urgencia: Urgencia | null
  score: Score | null
  converted_to_lead: boolean
}

// Formulario de Lead
export interface LeadFormData {
  nombre: string
  telefono: string
  email?: string
  presupuesto_min?: number
  presupuesto_max?: number
  tiene_preaprobacion: boolean
  banco?: string
  monto_aprobado?: number
  tipo_pago?: TipoPago
  tipo_busqueda?: TipoBusqueda
  tipo_propiedad?: TipoPropiedad
  zonas_interes?: string[]
  recamaras?: number
  baños?: number
  estacionamientos?: number
  amenidades?: string[]
  urgencia?: Urgencia
  timeline?: Timeline
  proximo_followup?: string
  score?: Score
  estado: EstadoLead
  probabilidad_cierre?: number
  valor_estimado?: number
  fuente?: FuenteLead
  notas?: string
}
