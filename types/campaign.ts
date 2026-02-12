export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled'
export type CampaignCallStatus = 'pending' | 'calling' | 'answered' | 'missed' | 'failed'

export interface Campaign {
  id: string
  created_at: string
  user_id: string
  name: string
  description: string | null
  vapi_assistant_id: string
  vapi_phone_number_id: string
  status: CampaignStatus
  total_recipients: number
  completed_calls: number
  failed_calls: number
  assistant_overrides: Record<string, string>
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
}

export interface CampaignCall {
  id: string
  created_at: string
  updated_at: string
  campaign_id: string
  lead_id: string | null
  phone_number: string
  nombre: string | null
  email: string | null
  status: CampaignCallStatus
  vapi_call_id: string | null
  duration_seconds: number | null
  recording_url: string | null
  transcript: string | null
  metadata: Record<string, unknown>
}

export interface CampaignWithCalls extends Campaign {
  campaign_calls?: CampaignCall[]
}

export interface CampaignRecipient {
  phone_number: string
  nombre?: string
  email?: string
  lead_id?: string
}

export interface CreateCampaignRequest {
  name: string
  description?: string
  vapi_assistant_id: string
  vapi_phone_number_id: string
  promo_message?: string
  recipients: CampaignRecipient[]
}
