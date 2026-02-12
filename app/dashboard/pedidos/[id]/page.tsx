'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Pedido, PedidoEstado } from '@/types/restaurant'
import { FormattedCurrency } from '@/components/shared/FormattedCurrency'

const estadoLabels: Record<PedidoEstado, string> = {
  recibido: 'Recibido',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export default function PedidoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingEstado, setEditingEstado] = useState<PedidoEstado | null>(null)

  const loadPedido = useCallback(async () => {
    if (!id) return
    try {
      setError(null)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch(`/api/pedidos/${id}`, { credentials: 'include', headers })
      if (!res.ok) {
        if (res.status === 404) {
          setError('Pedido no encontrado')
          setPedido(null)
          return
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al cargar pedido')
      }
      const data = await res.json()
      setPedido(data)
      setEditingEstado(data.estado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedido')
      setPedido(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPedido()
  }, [loadPedido])

  const handleUpdateEstado = async () => {
    if (!id || editingEstado === null || editingEstado === pedido?.estado) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ estado: editingEstado }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar')
      }
      const updated = await res.json()
      setPedido(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !pedido) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/pedidos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Pedidos
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    )
  }

  if (!pedido) return null

  const items = (pedido.items || []) as { nombre: string; cantidad: number; precio_unitario?: number; notas?: string }[]

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/dashboard/pedidos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Pedidos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Pedido</h1>
        <p className="mt-1 text-sm text-gray-600">
          {format(new Date(pedido.created_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Cliente</h2>
        <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Nombre</dt>
            <dd className="font-medium text-gray-900">{pedido.cliente_nombre || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Teléfono</dt>
            <dd className="font-medium text-gray-900">{pedido.cliente_telefono || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{pedido.cliente_email || '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        <ul className="mt-4 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
              <span className="text-gray-700">
                {item.nombre} x{item.cantidad}
                {item.notas ? ` (${item.notas})` : ''}
              </span>
              <span className="text-gray-900">
                {item.precio_unitario != null
                  ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                      item.cantidad * item.precio_unitario
                    )
                  : '—'}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-end text-lg font-semibold text-gray-900">
          Total: <FormattedCurrency amount={pedido.total} className="ml-2" />
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Estado</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <select
            value={editingEstado ?? pedido.estado}
            onChange={(e) => setEditingEstado(e.target.value as PedidoEstado)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {(Object.entries(estadoLabels) as [PedidoEstado, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {editingEstado !== pedido.estado && (
            <button
              type="button"
              onClick={handleUpdateEstado}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar estado
            </button>
          )}
        </div>
        {pedido.horario_entrega_estimado && (
          <p className="mt-2 text-sm text-gray-600">
            Entrega estimada: {format(new Date(pedido.horario_entrega_estimado), "d MMM yyyy, HH:mm", { locale: es })}
          </p>
        )}
        {pedido.notas && (
          <p className="mt-2 text-sm text-gray-600">
            Notas: {pedido.notas}
          </p>
        )}
      </div>
    </div>
  )
}
