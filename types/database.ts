export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      calls: {
        Row: {
          id: string
          created_at: string
          phone_number: string
          duration_seconds: number
          status: 'answered' | 'missed'
          recording_url: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          phone_number: string
          duration_seconds: number
          status: 'answered' | 'missed'
          recording_url?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          phone_number?: string
          duration_seconds?: number
          status?: 'answered' | 'missed'
          recording_url?: string | null
          transcript?: string | null
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
