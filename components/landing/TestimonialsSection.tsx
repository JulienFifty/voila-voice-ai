'use client'

import { motion } from 'framer-motion'
import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'
import Card from '@/components/ui/Card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    quote: 'En el primer mes recuperamos 15 llamadas que antes perdíamos. Ya cerramos 3 ventas adicionales solo por eso. Se pagó solo.',
    author: 'Carlos López',
    role: 'CEO',
    company: 'Inmobiliaria Puebla',
    avatar: '👨‍💼',
  },
  {
    quote: 'Nuestros clientes ni siquiera notan que es IA. Habla perfectamente y agenda citas sin errores. Increíble.',
    author: 'Ana Martínez',
    role: 'Dueña',
    company: 'Clínica Dental',
    avatar: '👩‍⚕️',
  },
  {
    quote: 'Instalación en 24h como prometieron. Soporte súper atento. La mejor inversión que hice este año.',
    author: 'Roberto Sánchez',
    role: 'Dueño',
    company: 'Barbería Moderna',
    avatar: '💇',
  },
]

export default function TestimonialsSection() {
  return (
    <Section background="white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Heading level={2} subheading="Lo que dicen nuestros clientes">
          Lo Que Dicen Nuestros Clientes
        </Heading>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card hover className="h-full relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-200" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 relative z-10 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
