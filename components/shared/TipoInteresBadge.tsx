'use client'

import { TipoInteres } from '@/types/realty'

interface TipoInteresBadgeProps {
  tipo: TipoInteres | null | undefined
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TipoInteresBadge({ tipo, showLabel = false, size = 'md' }: TipoInteresBadgeProps) {
  if (!tipo) {
    return null
  }

  const tipoConfig = {
    compra: {
      label: 'Compra',
      emoji: '🏠',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300'
    },
    renta: {
      label: 'Renta',
      emoji: '🔑',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300'
    },
    venta: {
      label: 'Venta',
      emoji: '💰',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300'
    },
    info: {
      label: 'Información',
      emoji: 'ℹ️',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300'
    }
  }

  const config = tipoConfig[tipo]
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border ${sizeClasses[size]}`}>
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
