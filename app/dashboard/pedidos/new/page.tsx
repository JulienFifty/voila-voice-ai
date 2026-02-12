'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { PedidoItem, PedidoEstado } from '@/types/restaurant'

const ESTADOS: PedidoEstado[] = ['recibido', 'en_preparacion', 'listo', 'entregado', 'cancelado']

export default function NewPedidoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callId = searchParams.get('call_id') || undefined
  const prefill = searchParams.get('prefill') === '1'

  const [cliente_nombre, setClienteNombre] = useState('')
  const [cliente_telefono, setClienteTelefono] = useState('')
  const [cliente_email, setClienteEmail] = useState('')
  const [items, setItems] = useState<PedidoItem[]>([{ nombre: '', cantidad: 1, precio_unitario: 0 }])
  const [estado, setEstado] = useState<PedidoEstado>('recibido')
  const [horario_entrega_estimado, setHorarioEntregaEstimado] = useState('')
  const [notas, setNotas] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!callId || !prefill || typeof window === 'undefined') return
    try {
      const raw = sessionStorage.getItem(`voila_prefill_pedido_${callId}`)
      if (!raw) return
      const data = JSON.parse(raw) as {
        cliente_nombre?: string
        cliente_telefono?: string
        cliente_email?: string
        items?: { nombre: string; cantidad: number; precio_unitario?: number; notas?: string }[]
        total?: number
        notas?: string
      }
      if (data.cliente_nombre) setClienteNombre(data.cliente_nombre)
      if (data.cliente_telefono) setClienteTelefono(data.cliente_telefono)
      if (data.cliente_email) setClienteEmail(data.cliente_email)
      if (data.notas) setNotas(data.notas)
      if (data.items?.length) {
        setItems(
          data.items.map((i) => ({
            nombre: i.nombre,
            cantidad: i.cantidad || 1,
            precio_unitario: i.precio_unitario ?? 0,
            notas: i.notas,
          }))
        )
      }
      sessionStorage.removeItem(`voila_prefill_pedido_${callId}`)
    } catch {}
  }, [callId, prefill])

  const total = items.reduce(
    (sum, i) => sum + (i.cantidad || 0) * (i.precio_unitario ?? 0),
    0
  )

  const addItem = () => {
    setItems((prev) => [...prev, { nombre: '', cantidad: 1, precio_unitario: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PedidoItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const body = {
        cliente_nombre: cliente_nombre || undefined,
        cliente_telefono: cliente_telefono || undefined,
        cliente_email: cliente_email || undefined,
        items: items.map((i) => ({
          nombre: i.nombre,
          cantidad: Number(i.cantidad) || 1,
          precio_unitario: Number(i.precio_unitario) || 0,
          notas: i.notas || undefined,
        })),
        total,
        moneda: 'MXN',
        estado,
        horario_entrega_estimado: horario_entrega_estimado || undefined,
        notas: notas || undefined,
        call_id: callId,
      }

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al crear pedido')
      }
      const pedido = await res.json()
      router.push(`/dashboard/pedidos/${pedido.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear pedido')
    } finally {
      setSubmitting(false)
    }
  }

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Nuevo pedido</h1>
        <p className="mt-1 text-sm text-gray-600">
          {callId ? 'Crear pedido desde la llamada' : 'Registrar un pedido manualmente'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Cliente</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={cliente_nombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                value={cliente_telefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={cliente_email}
                onChange={(e) => setClienteEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Añadir
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap items-end gap-4 rounded border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="min-w-[120px] flex-1">
                  <label className="block text-xs font-medium text-gray-500">Nombre</label>
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={(e) => updateItem(index, 'nombre', e.target.value)}
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-500">Cant.</label>
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500">P. unit.</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.precio_unitario ?? ''}
                    onChange={(e) => updateItem(index, 'precio_unitario', e.target.value)}
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                  className="rounded p-2 text-gray-400 hover:bg-gray-200 hover:text-red-600 disabled:opacity-50"
                  aria-label="Quitar item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">
            Total: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total)}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Estado y notas</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as PedidoEstado)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Horario entrega estimado</label>
              <input
                type="datetime-local"
                value={horario_entrega_estimado}
                onChange={(e) => setHorarioEntregaEstimado(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/pedidos"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting || items.every((i) => !i.nombre.trim())}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Crear pedido
          </button>
        </div>
      </form>
    </div>
  )
}
