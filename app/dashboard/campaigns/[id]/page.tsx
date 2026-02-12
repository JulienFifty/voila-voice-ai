'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import {
  ArrowLeft,
  Loader2,
  Phone,
  PhoneOff,
  CheckCircle,
  XCircle,
  Clock,
  Megaphone,
} from 'lucide-react'
import { CampaignWithCalls, CampaignCall, CampaignStatus } from '@/types/campaign'

const statusLabels: Record<CampaignStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  running: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const statusColors: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  running: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

const callStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  calling: 'Llamando',
  answered: 'Contestada',
  missed: 'No contestó',
  failed: 'Fallida',
}

const callStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  calling: <Phone className="h-4 w-4 animate-pulse text-blue-500" />,
  answered: <CheckCircle className="h-4 w-4 text-green-500" />,
  missed: <PhoneOff className="h-4 w-4 text-amber-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [campaign, setCampaign] = useState<CampaignWithCalls | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const loadCampaign = useCallback(async () => {
    try {
      setError(null)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch(`/api/campaigns/${id}`, { credentials: 'include', headers })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Campaña no encontrada')
      }
      const data = await res.json()
      setCampaign(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar campaña')
      setCampaign(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCampaign()
  }, [loadCampaign])

  useEffect(() => {
    if (!campaign || campaign.status !== 'running') return
    const interval = setInterval(loadCampaign, 10000)
    return () => clearInterval(interval)
  }, [campaign, loadCampaign])

  const handleCancel = async () => {
    if (!confirm('¿Cancelar esta campaña?')) return
    setCancelling(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch(`/api/campaigns/${id}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers,
      })
      if (!res.ok) throw new Error('Error al cancelar')
      await loadCampaign()
    } catch {
      setError('Error al cancelar campaña')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a campañas
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Campaña no encontrada'}
        </div>
      </div>
    )
  }

  const calls = campaign.campaign_calls || []
  const progress =
    campaign.total_recipients > 0
      ? Math.round(
          ((campaign.completed_calls + campaign.failed_calls) / campaign.total_recipients) * 100
        )
      : 0

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a campañas
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          {campaign.description && (
            <p className="mt-1 text-sm text-gray-600">{campaign.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusColors[campaign.status]
              }`}
            >
              {statusLabels[campaign.status]}
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(campaign.created_at), "d MMM yyyy, HH:mm", { locale: es })}
            </span>
          </div>
        </div>
        {campaign.status === 'running' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Cancelar campaña
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total contactos</p>
              <p className="text-2xl font-bold text-gray-900">{campaign.total_recipients}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Contestadas</p>
              <p className="text-2xl font-bold text-gray-900">{campaign.completed_calls}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Fallidas / No contestó</p>
              <p className="text-2xl font-bold text-gray-900">{campaign.failed_calls}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Progreso</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-lg font-bold text-gray-900">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {campaign.assistant_overrides &&
        typeof campaign.assistant_overrides === 'object' &&
        Object.keys(campaign.assistant_overrides as Record<string, string>).length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Variables enviadas al asistente</h3>
            <pre className="overflow-x-auto rounded bg-white p-3 text-sm text-gray-800">
              {JSON.stringify(campaign.assistant_overrides, null, 2)}
            </pre>
          </div>
        )}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Llamadas</h2>
          <p className="text-sm text-gray-500">
            {calls.length} llamadas en esta campaña
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {calls.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No hay llamadas registradas aún.
            </div>
          ) : (
            calls.map((call: CampaignCall) => (
              <div
                key={call.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    {callStatusIcons[call.status] || callStatusIcons.pending}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {call.nombre || 'Sin nombre'} - {call.phone_number}
                    </div>
                    {call.transcript && (
                      <p className="mt-1 max-w-xl truncate text-sm text-gray-500">
                        {call.transcript}
                      </p>
                    )}
                    {call.duration_seconds != null && call.duration_seconds > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Duración: {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                      </p>
                    )}
                  </div>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {callStatusLabels[call.status] || call.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
