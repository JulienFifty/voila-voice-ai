'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItem {
  question: string
  answer: string | ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => toggle(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-gray-500 flex-shrink-0 transition-transform',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              openIndex === index ? 'max-h-96' : 'max-h-0'
            )}
          >
            <div className="px-6 pb-4 text-gray-600">
              {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
