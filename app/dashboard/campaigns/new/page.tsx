'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Upload, Users, FileText, Loader2, Check } from 'lucide-react'
import { CampaignRecipient } from '@/types/campaign'

type ContactSource = 'leads' | 'csv'

interface Lead {
  id: string
  nombre: string
  telefono: string
  email: string | null
}

interface PhoneNumberOption {
  id: string
  numero: string
  nombre: string | null
  vapi_phone_number_id: string
  source: string
}

export default function NewCampaignPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [assistantId, setAssistantId] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [contactSource, setContactSource] = useState<ContactSource>('leads')

  const [assistants, setAssistants] = useState<Array<{ vapi_assistant_id: string; vapi_assistant_name: string | null }>>([])
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberOption[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [csvRecipients, setCsvRecipients] = useState<CampaignRecipient[]>([])
  const [consentConfirmed, setConsentConfirmed] = useState(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAssistants = useCallback(async () => {
    const { data } = await supabase
      .from('user_assistants')
      .select('vapi_assistant_id, vapi_assistant_name')
      .eq('active', true)
    const assistantsData = (data || []) as Array<{ vapi_assistant_id: string; vapi_assistant_name: string | null }>
    setAssistants(assistantsData)
    if (assistantsData.length && !assistantId) {
      setAssistantId(assistantsData[0].vapi_assistant_id)
    }
  }, [supabase, assistantId])

  const loadPhoneNumbers = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const headers: HeadersInit = {}
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    const res = await fetch('/api/vapi/phone-numbers', { credentials: 'include', headers })
    const data = await res.json()
    setPhoneNumbers(Array.isArray(data) ? data : [])
    if (Array.isArray(data) && data.length > 0 && !phoneNumberId) {
      setPhoneNumberId(data[0].vapi_phone_number_id)
    }
  }, [phoneNumberId])

  const loadLeads = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('leads')
      .select('id, nombre, telefono, email')
      .eq('user_id', user.id)
    setLeads(data || [])
  }, [supabase])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadAssistants(), loadPhoneNumbers(), loadLeads()])
      setLoading(false)
    }
    init()
  }, [loadAssistants, loadPhoneNumbers, loadLeads])

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split(/\r?\n/).filter(Boolean)
      const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''))
      const numIdx = headers.findIndex((h) => h === 'number' || h === 'numero' || h === 'telefono' || h === 'phone')
      const nameIdx = headers.findIndex((h) => h === 'name' || h === 'nombre' || h === 'nombre_contacto')
      const emailIdx = headers.findIndex((h) => h === 'email' || h === 'correo')
      const recipients: CampaignRecipient[] = []
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''))
        const num = numIdx >= 0 ? vals[numIdx] : vals[0]
        if (num && num.replace(/\D/g, '').length >= 10) {
          recipients.push({
            phone_number: num,
            nombre: nameIdx >= 0 ? vals[nameIdx] : undefined,
            email: emailIdx >= 0 ? vals[emailIdx] : undefined,
          })
        }
      }
      setCsvRecipients(recipients)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const toggleLead = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const recipients: CampaignRecipient[] =
    contactSource === 'leads'
      ? leads
          .filter((l) => selectedLeadIds.has(l.id))
          .map((l) => ({
            phone_number: l.telefono,
            nombre: l.nombre,
            email: l.email || undefined,
            lead_id: l.id,
          }))
      : csvRecipients

  const canSubmit =
    name.trim() &&
    assistantId &&
    phoneNumberId &&
    recipients.length > 0 &&
    consentConfirmed &&
    !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          vapi_assistant_id: assistantId,
          vapi_phone_number_id: phoneNumberId,
          promo_message: promoMessage.trim() || undefined,
          recipients,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear campaña')
      router.push(`/dashboard/campaigns/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear campaña')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a campañas
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Nueva campaña</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Configuración</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Promo navidad 2025"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Descripción (opcional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción de la campaña"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mensaje / Promo (variable para el asistente)</label>
              <input
                type="text"
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                placeholder="Ej: 20% de descuento en propiedades seleccionadas"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-gray-500">
                Se pasa como variable &quot;promo&quot; al asistente de VAPI (usa {'{{promo}}'})
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Asistente y número saliente</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Asistente</label>
              <select
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Selecciona un asistente</option>
                {assistants.map((a) => (
                  <option key={a.vapi_assistant_id} value={a.vapi_assistant_id}>
                    {a.vapi_assistant_name || a.vapi_assistant_id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Número saliente</label>
              {phoneNumbers.length > 0 ? (
                <select
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Selecciona un número</option>
                  {phoneNumbers.map((pn) => (
                    <option key={pn.id} value={pn.vapi_phone_number_id}>
                      {pn.nombre ? `${pn.nombre} - ${pn.numero}` : pn.numero}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <p className="mb-2 text-xs text-amber-600">
                    Necesitas un número Twilio/importado en VAPI para outbound. Configúralo en tu cuenta de VAPI.
                  </p>
                  <input
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="ID del número en VAPI (ej: ph-xxx-xxx)"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Contactos</h2>
          <div className="mb-4 flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="source"
                checked={contactSource === 'leads'}
                onChange={() => setContactSource('leads')}
                className="text-primary"
              />
              <Users className="h-4 w-4" />
              Seleccionar de Leads
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="source"
                checked={contactSource === 'csv'}
                onChange={() => setContactSource('csv')}
                className="text-primary"
              />
              <Upload className="h-4 w-4" />
              Subir CSV
            </label>
          </div>

          {contactSource === 'leads' && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
              {leads.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No tienes leads. Sube un CSV o crea leads primero.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <li key={lead.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.has(lead.id)}
                        onChange={() => toggleLead(lead.id)}
                        className="rounded text-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{lead.nombre}</div>
                        <div className="text-sm text-gray-500">{lead.telefono} {lead.email && `• ${lead.email}`}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {contactSource === 'csv' && (
            <div>
              <label className="mb-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-gray-500 hover:border-primary hover:bg-gray-50">
                <Upload className="mb-2 h-10 w-10" />
                <span className="text-sm font-medium">Haz clic o arrastra el CSV aquí</span>
                <span className="mt-1 text-xs">Columnas: number (obligatorio), nombre, email</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>
              {csvRecipients.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {csvRecipients.length} contactos cargados
                </p>
              )}
            </div>
          )}

          {recipients.length > 0 && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">
                {recipients.length} contactos seleccionados
              </p>
              <ul className="mt-2 max-h-32 overflow-y-auto text-sm text-gray-600">
                {recipients.slice(0, 10).map((r, i) => (
                  <li key={i}>
                    {r.nombre || r.phone_number} - {r.phone_number}
                  </li>
                ))}
                {recipients.length > 10 && (
                  <li>... y {recipients.length - 10} más</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consentConfirmed}
              onChange={(e) => setConsentConfirmed(e.target.checked)}
              className="mt-1 rounded text-primary"
            />
            <div>
              <p className="font-medium text-gray-900">Confirmo que tengo consentimiento</p>
              <p className="text-sm text-gray-600">
                Tengo el consentimiento explícito de los contactos para recibir llamadas promocionales o de seguimiento.
              </p>
            </div>
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/campaigns"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Lanzar campaña
          </button>
        </div>
      </form>
    </div>
  )
}
