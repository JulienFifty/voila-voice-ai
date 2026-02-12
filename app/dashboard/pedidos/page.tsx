'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { createClient } from '@/lib/supabase'
import { UtensilsCrossed, Plus, Eye, Loader2 } from 'lucide-react'
import { Pedido, PedidoEstado } from '@/types/restaurant'
import { FormattedCurrency } from '@/components/shared/FormattedCurrency'

const estadoLabels: Record<PedidoEstado, string> = {
  recibido: 'Recibido',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const estadoColors: Record<PedidoEstado, string> = {
  recibido: 'bg-blue-100 text-blue-800',
  en_preparacion: 'bg-amber-100 text-amber-800',
  listo: 'bg-green-100 text-green-800',
  entregado: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-red-100 text-red-800',
}

function itemsSummary(items: { nombre: string; cantidad: number }[]): string {
  if (!items?.length) return '—'
  return items
    .slice(0, 3)
    .map((i) => `${i.nombre} x${i.cantidad}`)
    .join(', ') + (items.length > 3 ? '…' : '')
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadoFilter, setEstadoFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadPedidos = useCallback(async () => {
    try {
      setError(null)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      const params = new URLSearchParams()
      if (estadoFilter) params.set('estado', estadoFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const url = `/api/pedidos${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url, { credentials: 'include', headers })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al cargar pedidos')
      }
      const data = await res.json()
      setPedidos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }, [estadoFilter, dateFrom, dateTo])

  useEffect(() => {
    loadPedidos()
  }, [loadPedidos])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona los pedidos recibidos por teléfono o creados desde llamadas
          </p>
        </div>
        <Link
          href="/dashboard/pedidos/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo pedido
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Todos los estados</option>
          {(Object.entries(estadoLabels) as [PedidoEstado, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Sin pedidos</h3>
          <p className="mt-2 text-sm text-gray-600">
            Los pedidos creados desde llamadas o manualmente aparecerán aquí.
          </p>
          <Link
            href="/dashboard/pedidos/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Crear pedido
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha / Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {format(new Date(p.created_at), 'd MMM yyyy, HH:mm', { locale: es })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">{p.cliente_nombre || '—'}</div>
                    {p.cliente_telefono && (
                      <div className="text-sm text-gray-500">{p.cliente_telefono}</div>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-sm text-gray-600">
                    {itemsSummary(p.items || [])}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <FormattedCurrency amount={p.total} className="text-gray-900" />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        estadoColors[p.estado]
                      }`}
                    >
                      {estadoLabels[p.estado]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/pedidos/${p.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
