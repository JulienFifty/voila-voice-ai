'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Reservacion, ReservacionEstado } from '@/types/restaurant'

const estadoLabels: Record<ReservacionEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  no_show: 'No se presentó',
  cancelada: 'Cancelada',
}

export default function ReservacionDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [reservacion, setReservacion] = useState<Reservacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingEstado, setEditingEstado] = useState<ReservacionEstado | null>(null)

  const loadReservacion = useCallback(async () => {
    if (!id) return
    try {
      setError(null)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch(`/api/reservaciones/${id}`, { credentials: 'include', headers })
      if (!res.ok) {
        if (res.status === 404) {
          setError('Reservación no encontrada')
          setReservacion(null)
          return
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al cargar reservación')
      }
      const data = await res.json()
      setReservacion(data)
      setEditingEstado(data.estado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reservación')
      setReservacion(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadReservacion()
  }, [loadReservacion])

  const handleUpdateEstado = async () => {
    if (!id || editingEstado === null || editingEstado === reservacion?.estado) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch(`/api/reservaciones/${id}`, {
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
      setReservacion(updated)
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

  if (error && !reservacion) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/reservaciones"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Reservaciones
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    )
  }

  if (!reservacion) return null

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/dashboard/reservaciones"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Reservaciones
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Reservación</h1>
        <p className="mt-1 text-sm text-gray-600">
          {format(new Date(reservacion.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })} — {reservacion.hora}
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
            <dd className="font-medium text-gray-900">{reservacion.cliente_nombre || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Teléfono</dt>
            <dd className="font-medium text-gray-900">{reservacion.cliente_telefono || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{reservacion.cliente_email || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Número de personas</dt>
            <dd className="font-medium text-gray-900">{reservacion.numero_personas}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Estado</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <select
            value={editingEstado ?? reservacion.estado}
            onChange={(e) => setEditingEstado(e.target.value as ReservacionEstado)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {(Object.entries(estadoLabels) as [ReservacionEstado, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {editingEstado !== reservacion.estado && (
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
        {reservacion.notas && (
          <p className="mt-2 text-sm text-gray-600">
            Notas: {reservacion.notas}
          </p>
        )}
      </div>
    </div>
  )
}
