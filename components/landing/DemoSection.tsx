'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import { Phone, MessageSquare, User, Bot } from 'lucide-react'

export default function DemoSection() {
  const conversation = [
    { speaker: 'Cliente', message: 'Hola, quisiera agendar una cita', icon: User },
    { speaker: 'Asistente IA', message: '¡Claro! Con gusto. ¿Para qué servicio?', icon: Bot },
    { speaker: 'Cliente', message: 'Para revisión dental', icon: User },
    { speaker: 'Asistente IA', message: 'Perfecto. ¿Qué día te viene mejor?', icon: Bot },
    { speaker: 'Cliente', message: 'Este viernes por la tarde', icon: User },
    { speaker: 'Asistente IA', message: 'Excelente. Tengo disponible a las 3:00 PM o 4:30 PM. ¿Cuál prefieres?', icon: Bot },
    { speaker: 'Cliente', message: 'Las 3:00 PM está bien', icon: User },
    { speaker: 'Asistente IA', message: 'Perfecto. Cita confirmada para el viernes a las 3:00 PM. Te enviaré un recordatorio por WhatsApp. ¿Algo más en lo que pueda ayudarte?', icon: Bot },
  ]
  
  return (
    <Section background="white" className="py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Descubre Voila Voice AI en acción
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Pruébalo GRATIS. Llama a cualquier hora y habla con nuestro asistente IA
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-8 py-6 text-center">
            <div className="text-4xl font-bold text-white mb-3">+52 222 XXX XXXX</div>
            <Button
              href="tel:+52222XXXXXXX"
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Phone className="mr-2 h-5 w-5" />
              Llamar Ahora
            </Button>
          </div>
          
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Ejemplo de Conversación</h3>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((item, index) => {
                const isClient = item.speaker === 'Cliente'
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: isClient ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`flex gap-3 ${isClient ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isClient ? 'bg-gray-200' : 'bg-blue-100'
                    }`}>
                      <item.icon className={`h-5 w-5 ${
                        isClient ? 'text-gray-700' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className={`flex-1 ${isClient ? 'text-left' : 'text-right'}`}>
                      <div className={`inline-block px-4 py-3 rounded-lg ${
                        isClient
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <div className="text-xs font-semibold mb-1 opacity-75">{item.speaker}</div>
                        <div>{item.message}</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
