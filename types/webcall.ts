export type CallStatus =
  | 'idle'
  | 'creating'
  | 'connecting'
  | 'in_call'
  | 'ended'
  | 'error'

export interface CreateWebCallRequest {
  agentId: string
}

export interface WebCallResponse {
  call: {
    call_id: string
    call_type: 'web_call'
    agent_id: string
    agent_name: string
    call_status: 'registered' | 'ringing' | 'in-progress' | 'ended'
    data_storage_setting: 'everything' | 'transcript' | 'none'
    access_token: string
    metadata: {
      source: string
      agent_name: string
    }
    call_cost: {
      total_duration_seconds: number
      combined_cost: number
    }
  }
  client_id: string
}

export interface WebCallParams {
  accessToken: string
  callId: string // ID de la llamada (para referencia)
  assistantId: string // ID del assistant/agent (necesario para el SDK)
  onStatus: (status: CallStatus) => void
}

export interface WebCallController {
  stop: () => Promise<void>
}
