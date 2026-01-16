'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'
import Card from '@/components/ui/Card'
import { Check, Phone, FileText, BarChart, Download, Smartphone } from 'lucide-react'

export default function DashboardPreview() {
  const features = [
    'Ve todas tus llamadas en un solo lugar',
    'Escucha grabaciones completas',
    'Lee transcripciones automáticas',
    'Analiza rendimiento con gráficas',
    'Exporta reportes para tu contador',
    'Acceso desde web, iOS y Android',
  ]
  
  return (
    <Section background="white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Heading level={2} subheading="Control total sobre tus llamadas y métricas">
          Panel de Control Profesional Incluido
        </Heading>
      </motion.div>
      
      <div className="mt-12 grid lg:grid-cols-2 gap-8 items-center">
        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-0 overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Mockup Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 text-white text-sm font-medium">Dashboard - Voila Voice AI</div>
              </div>
            </div>
            
            {/* Mockup Content */}
            <div className="p-6 space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Llamadas Hoy</div>
                  <div className="text-lg font-bold text-white">24</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Promedio</div>
                  <div className="text-lg font-bold text-white">3:24</div>
                </div>
                <div className="bg-blue-600 rounded p-3">
                  <div className="text-xs text-blue-200 mb-1">Conversión</div>
                  <div className="text-lg font-bold text-white">68%</div>
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div className="bg-gray-700 rounded p-4 h-32 flex items-center justify-center">
                <BarChart className="h-12 w-12 text-gray-500" />
              </div>
              
              {/* Recent Calls */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-2">Llamadas Recientes</div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-700 rounded p-3 flex items-center gap-3">
                    <Phone className="h-4 w-4 text-green-400" />
                    <div className="flex-1">
                      <div className="text-xs text-white">+52 222 XXX XXXX</div>
                      <div className="text-xs text-gray-400">Hace 5 minutos • 2:34</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-gray-700 text-lg">{feature}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span className="text-sm">iOS</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span className="text-sm">Android</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <span className="text-sm">Exportar Reportes</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}
