'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'
import Card from '@/components/ui/Card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, DollarSign } from 'lucide-react'

export default function ROICalculator() {
  const [callsPerDay, setCallsPerDay] = useState(20)
  const [lostPercentage, setLostPercentage] = useState(40)
  const [avgSaleValue, setAvgSaleValue] = useState(5000)
  
  const callsPerMonth = callsPerDay * 30
  const lostCalls = Math.round(callsPerMonth * (lostPercentage / 100))
  const lostRevenue = lostCalls * avgSaleValue
  const recoveredRevenue = Math.round(lostCalls * 0.7 * avgSaleValue) // 70% recovery rate
  const personnelSavings = 12000 // Average personnel cost
  const totalSavings = recoveredRevenue + personnelSavings
  const investment = 4999
  const roi = Math.round(((totalSavings - investment) / investment) * 100)
  
  return (
    <Section background="gray" className="py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Calcula Cuánto Vas a Ahorrar
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Calcula cuánto dinero estás perdiendo y cuánto puedes ahorrar
        </p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-white shadow-xl border border-gray-200">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuántas llamadas recibes al día?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={callsPerDay}
                    onChange={(e) => setCallsPerDay(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-2xl font-bold text-gray-900 text-center">
                    {formatNumber(callsPerDay)} llamadas/día
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuántas estimas que pierdes?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={lostPercentage}
                    onChange={(e) => setLostPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-2xl font-bold text-gray-900 text-center">
                    {lostPercentage}%
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuánto vale cada venta promedio?
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={avgSaleValue}
                    onChange={(e) => setAvgSaleValue(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                  />
                  <div className="text-sm text-gray-500 text-center">MXN</div>
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div className="space-y-4">
              <Card className="bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">PIERDES AL MES</h3>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {formatNumber(lostCalls)}
                </div>
                <div className="text-sm text-red-700 mb-4">llamadas perdidas</div>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(lostRevenue)}
                </div>
                <div className="text-sm text-red-700">en ventas perdidas</div>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">CON NUESTRO ASISTENTE AHORRAS</h3>
                </div>
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="text-lg text-green-700">{formatCurrency(recoveredRevenue)}/mes</div>
                    <div className="text-xs text-green-600">en ventas recuperadas</div>
                  </div>
                  <div>
                    <div className="text-lg text-green-700">{formatCurrency(personnelSavings)}/mes</div>
                    <div className="text-xs text-green-600">en costos de personal</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-green-300">
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {formatCurrency(totalSavings)}/mes
                  </div>
                  <div className="text-sm text-green-700">TOTAL AHORRADO</div>
                </div>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <div className="text-center">
                  <div className="text-sm text-blue-700 mb-1">ROI en el primer mes</div>
                  <div className="text-4xl font-bold text-blue-900">{roi}%</div>
                  <div className="text-xs text-blue-600 mt-2">
                    Inversión: {formatCurrency(investment)}/mes
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </motion.div>
    </Section>
  )
}
