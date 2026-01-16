'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import {
  Mic,
  MessageCircle,
  BarChart3,
  Languages,
  Settings,
  Target,
  Calendar,
  FileText,
  Clock,
} from 'lucide-react'

const features = [
  {
    icon: Mic,
    title: 'Voz 100% Humana',
    description: 'Acento mexicano indistinguible de persona real',
  },
  {
    icon: MessageCircle,
    title: 'Integración WhatsApp',
    description: 'Notificaciones y seguimiento automático',
  },
  {
    icon: BarChart3,
    title: 'Dashboard en Tiempo Real',
    description: 'Ve todas tus llamadas, transcripciones y analytics',
  },
  {
    icon: Languages,
    title: 'Multi-idioma',
    description: 'Español, inglés y más',
  },
  {
    icon: Settings,
    title: 'Personalizable',
    description: 'Script adaptado a TU negocio específico',
  },
  {
    icon: Target,
    title: 'Calificación de Leads',
    description: 'Sabe qué clientes valen la pena',
  },
  {
    icon: Calendar,
    title: 'Integraciones CRM',
    description: 'Conecta con Google Calendar, HubSpot, Zoho',
  },
  {
    icon: FileText,
    title: 'Reportes Automáticos',
    description: 'Estadísticas diarias por email',
  },
  {
    icon: Clock,
    title: 'Horarios Flexibles',
    description: 'Define cuándo contesta y cuándo transfiere',
  },
]

export default function FeaturesSection() {
  return (
    <Section background="white" className="py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Descubre las funciones clave
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Todo lo que necesitas para automatizar tu atención al cliente
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="text-center"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <feature.icon className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
