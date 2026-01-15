'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return document.cookie.split('; ').filter(Boolean).map((cookie) => {
            const [name, ...rest] = cookie.split('=')
            return { 
              name: name.trim(), 
              value: decodeURIComponent(rest.join('=')) 
            }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const parts = [`${name}=${encodeURIComponent(value)}`]
            
            if (options?.maxAge !== undefined) {
              parts.push(`Max-Age=${options.maxAge}`)
            }
            if (options?.path) {
              parts.push(`Path=${options.path}`)
            } else {
              parts.push('Path=/')
            }
            if (options?.domain) {
              parts.push(`Domain=${options.domain}`)
            }
            if (options?.sameSite) {
              parts.push(`SameSite=${options.sameSite}`)
            }
            if (options?.secure) {
              parts.push('Secure')
            }
            
            document.cookie = parts.join('; ')
          })
        },
      },
    }
  )
}
