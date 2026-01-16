'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import { Mail, Loader2, Check } from 'lucide-react'

const newsletterSchema = z.object({
  email: z.string().email('Email inválido'),
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

export default function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  })
  
  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/newsletter', {
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
  
  if (submitStatus === 'success') {
    return (
      <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
        <Check className="h-5 w-5 text-green-600 mr-2" />
        <span className="text-green-800">¡Gracias por suscribirte!</span>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 max-w-md mx-auto">
      <div className="flex-1">
        <input
          type="email"
          {...register('email')}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="flex-shrink-0"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Mail className="h-5 w-5" />
        )}
      </Button>
    </form>
  )
}
