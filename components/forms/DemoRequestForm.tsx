'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import { Phone, Loader2 } from 'lucide-react'

const demoRequestSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  empresa: z.string().min(2, 'El nombre de la empresa es requerido'),
  telefono: z.string().min(10, 'Teléfono inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

type DemoRequestFormData = z.infer<typeof demoRequestSchema>

export default function DemoRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DemoRequestFormData>({
    resolver: zodResolver(demoRequestSchema),
  })
  
  const onSubmit = async (data: DemoRequestFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        reset()
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="demo-nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre *
        </label>
        <input
          id="demo-nombre"
          {...register('nombre')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Juan Pérez"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="demo-empresa" className="block text-sm font-medium text-gray-700 mb-2">
          Empresa *
        </label>
        <input
          id="demo-empresa"
          {...register('empresa')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Mi Empresa S.A."
        />
        {errors.empresa && (
          <p className="mt-1 text-sm text-red-600">{errors.empresa.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="demo-telefono" className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono *
        </label>
        <input
          id="demo-telefono"
          type="tel"
          {...register('telefono')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="222 123 4567"
        />
        {errors.telefono && (
          <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="demo-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email (opcional)
        </label>
        <input
          id="demo-email"
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="juan@empresa.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          ¡Solicitud enviada! Te contactaremos pronto para coordinar tu demo.
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          Hubo un error. Por favor intenta de nuevo.
        </div>
      )}
      
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Phone className="mr-2 h-5 w-5" />
            Solicitar demo
          </>
        )}
      </Button>
    </form>
  )
}
