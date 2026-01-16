'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import { Phone, DollarSign, Clock, UserX } from 'lucide-react'

export default function ProblemSection() {
  const stats = [
    {
      icon: Phone,
      number: '67%',
      label: 'Llamadas Perdidas',
      description: '2 de cada 3 llamadas comerciales no se contestan en México',
    },
    {
      icon: DollarSign,
      number: '$50K-200K',
      label: 'MXN Perdidos/Mes',
      description: 'Promedio que pierde una PyME por llamadas sin responder',
    },
    {
      icon: Clock,
      number: '89%',
      label: 'Llaman Fuera de Horario',
      description: 'La mayoría de clientes llama cuando estás cerrado',
    },
    {
      icon: UserX,
      number: '72%',
      label: 'No Vuelven a Llamar',
      description: 'Si no contestas, buscan tu competencia inmediatamente',
    },
  ]
  
  return (
    <Section background="white" className="py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          El Problema Que Te Está Costando Dinero
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Estadísticas impactantes sobre el problema real que enfrentan las PyMEs mexicanas
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <stat.icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{stat.number}</div>
            <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
            <p className="text-gray-600 text-sm leading-relaxed">{stat.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
