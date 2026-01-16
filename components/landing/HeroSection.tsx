'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight, Check, Phone } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-900">
              Tu negocio nunca vuelve a perder una llamada.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Agentes de voz con IA que confirman citas, llaman tus leads y atienden clientes 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start">
              <Button
                href="#contacto"
                variant="primary"
                size="xl"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Solicitar demostración
              </Button>
              <Button
                href="/register"
                variant="outline"
                size="xl"
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400"
              >
                Probar gratis
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto lg:mx-0">
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Funciona con WhatsApp, teléfono y redes sociales</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Instalación en 24 horas</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Sin contratos largos</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Primera semana gratis</span>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column - Product Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Mockup Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-gray-600 text-sm font-medium">Dashboard - Voila Voice AI</div>
                </div>
              </div>
              
              {/* Mockup Content - Dashboard Preview */}
              <div className="p-6 space-y-4 bg-white">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-xs text-blue-600 mb-1">Llamadas Hoy</div>
                    <div className="text-2xl font-bold text-blue-900">24</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Promedio</div>
                    <div className="text-2xl font-bold text-gray-900">3:24</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="text-xs text-green-600 mb-1">Conversión</div>
                    <div className="text-2xl font-bold text-green-900">68%</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <Phone className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Llamadas en tiempo real</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">+52 222 XXX XXXX</div>
                      <div className="text-xs text-gray-500">Hace 5 minutos • 2:34</div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">+52 222 XXX XXXX</div>
                      <div className="text-xs text-gray-500">Hace 12 minutos • 4:15</div>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Trust badges - Company logos */}
      <div className="mt-20 pt-12 border-t border-gray-200">
        <p className="text-center text-sm text-gray-500 mb-6">Empresas en México ya confían en nosotros</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div className="text-2xl font-bold text-gray-400">Clínica Dental</div>
          <div className="text-2xl font-bold text-gray-400">Restaurante</div>
          <div className="text-2xl font-bold text-gray-400">Barbería</div>
        </div>
      </div>
    </section>
  )
}
