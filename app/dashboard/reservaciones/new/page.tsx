'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ReservacionEstado } from '@/types/restaurant'

const ESTADOS: ReservacionEstado[] = ['pendiente', 'confirmada', 'completada', 'no_show', 'cancelada']

export default function NewReservacionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callId = searchParams.get('call_id') || undefined
  const prefill = searchParams.get('prefill') === '1'

  const [cliente_nombre, setClienteNombre] = useState('')
  const [cliente_telefono, setClienteTelefono] = useState('')
  const [cliente_email, setClienteEmail] = useState('')
  const [fecha, setFecha] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [hora, setHora] = useState('19:00')
  const [numero_personas, setNumeroPersonas] = useState(2)
  const [estado, setEstado] = useState<ReservacionEstado>('pendiente')
  const [notas, setNotas] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!callId || !prefill || typeof window === 'undefined') return
    try {
      const raw = sessionStorage.getItem(`voila_prefill_reservacion_${callId}`)
      if (!raw) return
      const data = JSON.parse(raw) as {
        cliente_nombre?: string
        cliente_telefono?: string
        cliente_email?: string
        fecha?: string
        hora?: string
        numero_personas?: number
        notas?: string
      }
      if (data.cliente_nombre) setClienteNombre(data.cliente_nombre)
      if (data.cliente_telefono) setClienteTelefono(data.cliente_telefono)
      if (data.cliente_email) setClienteEmail(data.cliente_email)
      if (data.fecha) setFecha(data.fecha)
      if (data.hora) setHora(data.hora)
      if (data.numero_personas != null) setNumeroPersonas(data.numero_personas)
      if (data.notas) setNotas(data.notas)
      sessionStorage.removeItem(`voila_prefill_reservacion_${callId}`)
    } catch {}
  }, [callId, prefill])

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
        fecha,
        hora,
        numero_personas,
        estado,
        notas: notas || undefined,
        call_id: callId,
      }

      const res = await fetch('/api/reservaciones', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al crear reservación')
      }
      const reservacion = await res.json()
      router.push(`/dashboard/reservaciones/${reservacion.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reservación')
    } finally {
      setSubmitting(false)
    }
  }

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Nueva reservación</h1>
        <p className="mt-1 text-sm text-gray-600">
          {callId ? 'Crear reservación desde la llamada' : 'Registrar una reservación manualmente'}
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
          <h2 className="text-lg font-semibold text-gray-900">Fecha y hora</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de personas</label>
              <input
                type="number"
                min={1}
                value={numero_personas}
                onChange={(e) => setNumeroPersonas(Number(e.target.value) || 1)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Estado y notas</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as ReservacionEstado)}
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
            href="/dashboard/reservaciones"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Crear reservación
          </button>
        </div>
      </form>
    </div>
  )
}
