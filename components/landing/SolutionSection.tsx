'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import { Phone, Bot, Calendar, ArrowRight } from 'lucide-react'

export default function SolutionSection() {
  const steps = [
    {
      number: '1',
      icon: Phone,
      title: 'CLIENTE LLAMA',
      description: 'Un cliente llama a tu negocio a cualquier hora',
    },
    {
      number: '2',
      icon: Bot,
      title: 'IA CONTESTA INMEDIATAMENTE',
      description: 'Tu asistente IA responde en 2 segundos, habla español mexicano perfecto y entiende el contexto',
    },
    {
      number: '3',
      icon: Calendar,
      title: 'AGENDA AUTOMÁTICAMENTE',
      description: 'Califica el lead, agenda cita en tu calendario y te notifica por WhatsApp',
    },
  ]
  
  return (
    <Section background="gray" className="py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Un software simple, eficaz, inteligente
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tu nuevo empleado perfecto que nunca falla. Solución simple en 3 pasos.
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:flex items-start justify-between relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex-1 relative"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  {step.number}
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-full w-full flex items-center justify-center px-4">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <step.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
