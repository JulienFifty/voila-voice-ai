'use client'

import { MessageCircle } from 'lucide-react'
import Button from '../ui/Button'

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function WhatsAppButton({ 
  phoneNumber, 
  message = '', 
  className = '',
  variant = 'primary',
  size = 'md'
}: WhatsAppButtonProps) {
  // Limpiar número de teléfono (quitar espacios, guiones, paréntesis)
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
  
  // Si el número no tiene código de país, agregar +52 (México)
  const formattedPhone = cleanPhone.startsWith('+') 
    ? cleanPhone 
    : cleanPhone.startsWith('52') 
      ? `+${cleanPhone}`
      : `+52${cleanPhone}`

  // Crear URL de WhatsApp
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = message 
    ? `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodedMessage}`
    : `https://wa.me/${formattedPhone.replace('+', '')}`

  const handleClick = () => {
    window.open(whatsappUrl, '_blank')
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      WhatsApp
    </Button>
  )
}
