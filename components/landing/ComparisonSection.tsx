'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'
import Card from '@/components/ui/Card'
import { Check, X, AlertCircle } from 'lucide-react'

const comparisonData = [
  {
    feature: 'Costo/mes',
    nosotros: '$4,999',
    recepcionista: '$15,000+',
    callCenter: '$10,000+',
  },
  {
    feature: 'Horario',
    nosotros: '24/7',
    recepcionista: '8h/día',
    callCenter: '9-18h',
  },
  {
    feature: 'Acento',
    nosotros: '🇲🇽 Mexicano',
    recepcionista: '🇲🇽 Mexicano',
    callCenter: '❌ Variable',
  },
  {
    feature: 'Nunca falta',
    nosotros: true,
    recepcionista: false,
    callCenter: false,
  },
  {
    feature: 'Soporte local',
    nosotros: '✅ Puebla',
    recepcionista: '✅',
    callCenter: '❌',
  },
  {
    feature: 'Dashboard analytics',
    nosotros: true,
    recepcionista: false,
    callCenter: '⚠️ Básico',
  },
  {
    feature: 'WhatsApp integrado',
    nosotros: true,
    recepcionista: false,
    callCenter: false,
  },
  {
    feature: 'Setup',
    nosotros: '24h',
    recepcionista: '2-4 semanas',
    callCenter: '1-2 meses',
  },
]

export default function ComparisonSection() {
  return (
    <Section background="gray">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Heading level={2} subheading="Compara y decide qué es mejor para tu negocio">
          Por Qué Somos Mejor Que Las Alternativas
        </Heading>
      </motion.div>
      
      {/* Desktop: Table */}
      <div className="hidden lg:block mt-12">
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Característica</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">NOSOTROS</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Recepcionista</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Call Center</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center bg-blue-50 font-semibold text-blue-900">
                      {typeof row.nosotros === 'boolean' ? (
                        row.nosotros ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-red-600 mx-auto" />
                      ) : (
                        row.nosotros
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {typeof row.recepcionista === 'boolean' ? (
                        row.recepcionista ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-red-600 mx-auto" />
                      ) : (
                        row.recepcionista
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {typeof row.callCenter === 'boolean' ? (
                        row.callCenter ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-red-600 mx-auto" />
                      ) : row.callCenter === '⚠️ Básico' ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto" />
                      ) : (
                        row.callCenter
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* Mobile: Cards */}
      <div className="lg:hidden mt-8 space-y-6">
        {comparisonData.map((row, index) => (
          <Card key={index} hover>
            <div className="font-semibold text-gray-900 mb-4">{row.feature}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">Nosotros</div>
                <div className="text-blue-700">
                  {typeof row.nosotros === 'boolean' ? (
                    row.nosotros ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />
                  ) : (
                    row.nosotros
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-700 mb-1">Otros</div>
                <div className="text-gray-600 text-xs">
                  Recep: {typeof row.recepcionista === 'boolean' ? (row.recepcionista ? '✓' : '✗') : row.recepcionista}
                  <br />
                  CC: {typeof row.callCenter === 'boolean' ? (row.callCenter ? '✓' : '✗') : row.callCenter}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
