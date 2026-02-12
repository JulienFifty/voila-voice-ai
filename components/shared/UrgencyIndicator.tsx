'use client'

import { Urgencia } from '@/types/realty'

interface UrgencyIndicatorProps {
  urgencia: Urgencia | null | undefined
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function UrgencyIndicator({ urgencia, showLabel = false, size = 'md' }: UrgencyIndicatorProps) {
  if (!urgencia) {
    return null
  }

  const urgenciaConfig = {
    alta: {
      label: 'Alta',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      dotColor: 'bg-red-500',
      emoji: '🔴'
    },
    media: {
      label: 'Media',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      dotColor: 'bg-yellow-500',
      emoji: '🟡'
    },
    baja: {
      label: 'Baja',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      dotColor: 'bg-green-500',
      emoji: '🟢'
    }
  }

  const config = urgenciaConfig[urgencia]
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border ${sizeClasses[size]}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
      {showLabel && <span>{config.label}</span>}
      {!showLabel && <span>{config.emoji}</span>}
    </span>
  )
}
