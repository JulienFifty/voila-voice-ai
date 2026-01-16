import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  glassmorphism?: boolean
  hover?: boolean
}

export default function Card({
  children,
  className,
  glassmorphism = false,
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-6',
        glassmorphism && 'backdrop-blur-sm bg-white/80 border-white/20',
        hover && 'hover:shadow-lg transition-shadow duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}
