'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('No se recibió información del usuario')
      }

      // Esperar a que las cookies se establezcan
      // Hacer múltiples intentos para verificar la sesión
      let session = null
      let attempts = 0
      const maxAttempts = 5

      while (!session && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        session = currentSession
        attempts++
      }

      if (!session) {
        throw new Error('No se pudo establecer la sesión. Por favor, intenta de nuevo.')
      }

      // Verificar que las cookies estén establecidas
      console.log('Login successful, user:', data.user?.email)
      console.log('Session:', session)
      
      // Esperar un momento adicional para que las cookies se sincronicen
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Verificar cookies antes de redirigir
      const cookies = document.cookie
      console.log('Cookies after login:', cookies)
      
      // Usar window.location.replace para redirigir sin guardar en historial
      // Esto fuerza una recarga completa y permite que el middleware lea las cookies
      window.location.replace('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Voila Voice AI
          </h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
