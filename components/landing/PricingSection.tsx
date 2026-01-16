'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Check, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    price: 4999,
    popular: false,
    features: [
      'Hasta 500 llamadas/mes',
      '1 número telefónico',
      'Integración WhatsApp básica',
      'Dashboard completo',
      'Transcripciones ilimitadas',
      'Soporte por email/WhatsApp',
      'Setup incluido',
    ],
    ideal: 'Negocios locales, consultorios individuales',
    cta: 'Empezar Ahora',
  },
  {
    name: 'Pro',
    price: 8999,
    popular: true,
    features: [
      'TODO en Starter',
      'Hasta 1,000 llamadas/mes',
      '2-3 números telefónicos',
      'Integraciones CRM (Calendly, Google)',
      'Calificación de leads IA',
      'Analytics avanzados',
      'Soporte prioritario',
      'Setup GRATIS',
    ],
    ideal: 'Inmobiliarias, clínicas, franquicias',
    cta: 'Empezar Ahora',
  },
  {
    name: 'Enterprise',
    price: 15999,
    popular: false,
    features: [
      'TODO en Pro',
      'Llamadas ilimitadas',
      'Múltiples agentes especializados',
      'Integraciones custom',
      'Account Manager dedicado',
      'SLA garantizado 99.9%',
      'Onboarding personalizado',
      'Facturación mensual/anual',
    ],
    ideal: 'Corporativos, cadenas, grupos',
    cta: 'Contactar Ventas',
  },
]

export default function PricingSection() {
  return (
    <Section background="white" className="py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Planes transparentes, sin sorpresas
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Licencia base de Voila Voice AI con herramientas opcionales
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={plan.popular ? 'md:-mt-4' : ''}
          >
            <Card
              hover
              className={`h-full relative ${
                plan.popular
                  ? 'border-2 border-blue-500 shadow-xl scale-105'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4 fill-white" />
                    MÁS POPULAR
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-gray-600">/mes</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-4 text-center">{plan.ideal}</p>
                <Button
                  href={plan.name === 'Enterprise' ? '#contacto' : '/register'}
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <Card className="bg-green-50 border-green-200 inline-block">
          <p className="text-green-900 font-semibold">
            💰 Garantía 30 días: Si no recuperas la inversión, te devolvemos tu dinero
          </p>
        </Card>
      </motion.div>
    </Section>
  )
}
