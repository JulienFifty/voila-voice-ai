'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'
import Card from '@/components/ui/Card'
import { Home, Stethoscope, UtensilsCrossed, Scissors, Scale, Wrench, TrendingUp, Check } from 'lucide-react'

const industries = [
  {
    id: 'inmobiliarias',
    icon: Home,
    name: 'Inmobiliarias',
    color: 'from-blue-500 to-blue-600',
    features: [
      'Califica leads automáticamente',
      'Agenda visitas 24/7',
      'Responde info propiedades',
    ],
    caseStudy: '+40% visitas agendadas',
  },
  {
    id: 'clinicas',
    icon: Stethoscope,
    name: 'Clínicas y Consultorios',
    color: 'from-red-500 to-red-600',
    features: [
      'Agenda citas médicas',
      'Recordatorios automáticos',
      'Reduce no-shows 60%',
    ],
    caseStudy: 'Consultorio dental recuperó 15 citas/semana',
  },
  {
    id: 'restaurantes',
    icon: UtensilsCrossed,
    name: 'Restaurantes',
    color: 'from-orange-500 to-orange-600',
    features: [
      'Reservaciones automáticas',
      'Toma pedidos a domicilio',
      'Responde menú y horarios',
    ],
    caseStudy: 'Restaurante +30% reservas online',
  },
  {
    id: 'salones',
    icon: Scissors,
    name: 'Salones y Barberías',
    color: 'from-pink-500 to-pink-600',
    features: [
      'Agenda cortes y servicios',
      'Confirma citas por WhatsApp',
      'Maneja cancelaciones',
    ],
    caseStudy: 'Barbería nunca pierde llamadas de emergencia',
  },
  {
    id: 'legal',
    icon: Scale,
    name: 'Despachos Legales',
    color: 'from-purple-500 to-purple-600',
    features: [
      'Agenda consultas iniciales',
      'Califica clientes potenciales',
      'Recopila info preliminar',
    ],
    caseStudy: 'Despacho 3x más consultas calificadas',
  },
  {
    id: 'servicios',
    icon: Wrench,
    name: 'Talleres y Servicios',
    color: 'from-gray-500 to-gray-600',
    features: [
      'Cotizaciones automáticas',
      'Agenda revisiones',
      'Follow-up de servicios',
    ],
    caseStudy: 'Taller mecánico +50% eficiencia',
  },
]

export default function UseCasesSection() {
  const [activeTab, setActiveTab] = useState(industries[0].id)
  
  const activeIndustry = industries.find((ind) => ind.id === activeTab) || industries[0]
  
  return (
    <Section background="white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Heading level={2} subheading="Solución adaptada a las necesidades de tu industria">
          Funciona Para Cualquier Negocio
        </Heading>
      </motion.div>
      
      {/* Desktop: Tabs */}
      <div className="hidden md:block mt-12">
        <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-gray-200">
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => setActiveTab(industry.id)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === industry.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <industry.icon className="inline h-5 w-5 mr-2" />
              {industry.name}
            </button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card hover className="p-8">
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${activeIndustry.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <activeIndustry.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeIndustry.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {activeIndustry.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Caso de éxito: {activeIndustry.caseStudy}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Mobile: Accordion */}
      <div className="md:hidden mt-8 space-y-4">
        {industries.map((industry) => (
          <Card key={industry.id} hover>
            <button
              onClick={() => setActiveTab(activeTab === industry.id ? '' : industry.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${industry.color} rounded-lg flex items-center justify-center`}>
                  <industry.icon className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-gray-900">{industry.name}</span>
              </div>
            </button>
            
            {activeTab === industry.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ul className="space-y-2 mb-4">
                  {industry.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">{industry.caseStudy}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Section>
  )
}
