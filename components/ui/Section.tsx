import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'gradient' | 'dark'
}

export default function Section({
  children,
  className,
  background = 'white',
}: SectionProps) {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600',
    dark: 'bg-gray-900',
  }
  
  const textColors = {
    white: '',
    gray: '',
    gradient: 'text-white',
    dark: 'text-white',
  }
  
  return (
    <section className={cn('py-20 px-4 sm:px-6 lg:px-8', backgrounds[background], className)}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  )
}
