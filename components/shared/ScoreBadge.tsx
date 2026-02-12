'use client'

import { Score } from '@/types/realty'

interface ScoreBadgeProps {
  score: Score | null | undefined
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ score, showLabel = false, size = 'md' }: ScoreBadgeProps) {
  if (!score) {
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600`}>
        Sin calificar
      </span>
    )
  }

  const scoreConfig = {
    A: {
      label: 'Hot Lead',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      emoji: '🔥'
    },
    B: {
      label: 'Warm Lead',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      emoji: '🟡'
    },
    C: {
      label: 'Cold Lead',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      emoji: '🔵'
    }
  }

  const config = scoreConfig[score]
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${config.bgColor} ${config.textColor} ${config.borderColor} border ${sizeClasses[size]}`}>
      <span>{score}</span>
      {showLabel && <span>{config.label}</span>}
      {!showLabel && <span>{config.emoji}</span>}
    </span>
  )
}
