export type CallStatus = 'answered' | 'missed'

export interface Call {
  id: string
  created_at: string
  phone_number: string
  duration_seconds: number
  status: CallStatus
  recording_url: string | null
  transcript: string | null
  user_id: string
}
