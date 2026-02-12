/**
 * Helper para colocar llamadas outbound via VAPI API
 * https://docs.vapi.ai/calls/outbound-calling
 */

const VAPI_API_URL = process.env.VAPI_API_URL || 'https://api.vapi.ai'

export interface PlaceOutboundCallParams {
  assistantId: string
  phoneNumberId: string
  customers: Array<{ number: string; name?: string }>
  assistantOverrides?: Record<string, string>
  schedulePlan?: { earliestAt?: string; latestAt?: string }
}

export interface VapiCallResponse {
  id: string
  status?: string
  [key: string]: unknown
}

export interface VapiBatchCallResponse {
  calls: Array<{ id: string; [key: string]: unknown }>
}

/**
 * Normaliza un número telefónico a formato E.164 para México
 * Ej: 5512345678 -> +525512345678, 52 55 1234 5678 -> +525512345678
 */
export function normalizeToE164(phone: string, defaultCountryCode = '52'): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('52') && cleaned.length >= 12) {
    return `+${cleaned}`
  }
  if (cleaned.length === 10) {
    return `+${defaultCountryCode}${cleaned}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  return `+${cleaned}`
}

/**
 * Coloca llamadas outbound via VAPI API
 * Usa el endpoint POST /call con customers array para batch
 */
export async function placeOutboundCalls(
  params: PlaceOutboundCallParams
): Promise<VapiCallResponse[] | VapiBatchCallResponse> {
  const apiKey = process.env.VAPI_API_KEY
  if (!apiKey) {
    throw new Error('VAPI_API_KEY no está configurada')
  }

  const body: Record<string, unknown> = {
    assistantId: params.assistantId,
    phoneNumberId: params.phoneNumberId,
    customers: params.customers.map((c) => ({
      number: c.number.startsWith('+') ? c.number : normalizeToE164(c.number),
      ...(c.name && { name: c.name }),
    })),
  }

  if (params.assistantOverrides && Object.keys(params.assistantOverrides).length > 0) {
    body.assistantOverrides = params.assistantOverrides
  }

  if (params.schedulePlan) {
    body.schedulePlan = params.schedulePlan
  }

  const response = await fetch(`${VAPI_API_URL}/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `VAPI API error: ${response.status} - ${errorData.message || errorData.error || response.statusText}`
    )
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data
  }
  if (data.calls && Array.isArray(data.calls)) {
    return data as VapiBatchCallResponse
  }
  return [data as VapiCallResponse]
}

/**
 * Lista números telefónicos del usuario en VAPI (si la API lo soporta)
 */
export async function listVapiPhoneNumbers(): Promise<Array<{ id: string; number: string; name?: string }>> {
  const apiKey = process.env.VAPI_API_KEY
  if (!apiKey) {
    return []
  }

  try {
    const response = await fetch(`${VAPI_API_URL}/phone-number`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      return data.map((p: { id: string; number?: string; name?: string }) => ({
        id: p.id,
        number: p.number || '',
        name: p.name,
      }))
    }
    if (data.phoneNumbers && Array.isArray(data.phoneNumbers)) {
      return data.phoneNumbers.map((p: { id: string; number?: string; name?: string }) => ({
        id: p.id,
        number: p.number || '',
        name: p.name,
      }))
    }
    return []
  } catch {
    return []
  }
}
