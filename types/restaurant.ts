// Tipos para el módulo restaurante

export type Industry = 'inmobiliario' | 'restaurante' | 'clinica'

export type PedidoEstado = 'recibido' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'
export type ReservacionEstado = 'pendiente' | 'confirmada' | 'completada' | 'no_show' | 'cancelada'

export interface PedidoItem {
  nombre: string
  cantidad: number
  precio_unitario?: number
  notas?: string
}

export interface Pedido {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  call_id: string | null
  cliente_nombre: string | null
  cliente_telefono: string | null
  cliente_email: string | null
  items: PedidoItem[]
  total: number
  moneda: string
  estado: PedidoEstado
  horario_entrega_estimado: string | null
  notas: string | null
}

export interface Reservacion {
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
  estado: ReservacionEstado
}

export interface PedidoFormData {
  cliente_nombre?: string
  cliente_telefono?: string
  cliente_email?: string
  items: PedidoItem[]
  total: number
  moneda?: string
  estado?: PedidoEstado
  horario_entrega_estimado?: string
  notas?: string
  call_id?: string
}

export interface ReservacionFormData {
  cliente_nombre?: string
  cliente_telefono?: string
  cliente_email?: string
  fecha: string
  hora: string
  numero_personas?: number
  notas?: string
  estado?: ReservacionEstado
  call_id?: string
}
