'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Industry } from '@/types/restaurant'

interface MeProfile {
  id: string
  user_id: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: string
  industry: Industry
  active: boolean
}

interface DashboardIndustryContextValue {
  industry: Industry
  setIndustry: (industry: Industry) => void
  profile: MeProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const DashboardIndustryContext = createContext<DashboardIndustryContextValue | null>(null)

export function DashboardIndustryProvider({ children }: { children: React.ReactNode }) {
  const [industry, setIndustryState] = useState<Industry>('restaurante')
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch('/api/me', { credentials: 'include', headers })
      if (!res.ok) {
        setIndustryState('restaurante')
        setProfile(null)
        return
      }
      const data = await res.json()
      const ind = data.profile?.industry ?? 'restaurante'
      setIndustryState(ind)
      setProfile(data.profile ?? null)
    } catch {
      setIndustryState('restaurante')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const setIndustry = useCallback((ind: Industry) => {
    setIndustryState(ind)
  }, [])

  const value: DashboardIndustryContextValue = {
    industry,
    setIndustry,
    profile,
    loading,
    refreshProfile,
  }

  return (
    <DashboardIndustryContext.Provider value={value}>
      {children}
    </DashboardIndustryContext.Provider>
  )
}

export function useDashboardIndustry() {
  const ctx = useContext(DashboardIndustryContext)
  if (!ctx) {
    throw new Error('useDashboardIndustry must be used within DashboardIndustryProvider')
  }
  return ctx
}

export function useDashboardIndustryOptional(): DashboardIndustryContextValue | null {
  return useContext(DashboardIndustryContext)
}
