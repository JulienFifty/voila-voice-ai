'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import DemoRequestForm from '@/components/forms/DemoRequestForm'
import { Phone, Play, Check } from 'lucide-react'

export default function FinalCTASection() {
  return (
    <Section background="dark" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center text-white max-w-4xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Conecta Voila Voice AI con tus herramientas diarias
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12">
          Solicita una demo personalizada para ver cómo Voila Voice AI puede transformar tu negocio.
        </p>
        
        <div className="max-w-md mx-auto mb-8">
          <DemoRequestForm />
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-gray-300 mt-8">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-400" />
            <span>Sin tarjeta de crédito para demo</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-400" />
            <span>Setup en 24-48h</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-400" />
            <span>Garantía 30 días</span>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}
