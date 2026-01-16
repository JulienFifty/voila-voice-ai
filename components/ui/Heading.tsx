import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3
  className?: string
  subheading?: string
}

export default function Heading({
  children,
  level = 2,
  className,
  subheading,
}: HeadingProps) {
  const baseStyles = 'font-bold text-gray-900 mb-4'
  
  const levels = {
    1: 'text-4xl md:text-5xl lg:text-6xl',
    2: 'text-3xl md:text-4xl lg:text-5xl',
    3: 'text-2xl md:text-3xl',
  }
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <div className={cn('text-center', className)}>
      <Tag className={cn(baseStyles, levels[level])}>
        {children}
      </Tag>
      {subheading && (
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-4">
          {subheading}
        </p>
      )}
    </div>
  )
}
