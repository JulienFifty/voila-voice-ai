import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voila Voice AI - Asistentes de IA Receptionist para Negocios en México',
  description: 'Nunca vuelvas a perder una llamada. Tu asistente IA contesta 24/7, agenda citas y cierra ventas mientras duermes. Acento mexicano perfecto, $4,999/mes.',
  keywords: 'asistente IA, recepcionista virtual, llamadas automáticas, IA de voz, México, PyMEs, automatización de llamadas, atención al cliente 24/7',
  openGraph: {
    title: 'Voila Voice AI - Asistentes de IA Receptionist para Negocios en México',
    description: 'Nunca vuelvas a perder una llamada. Tu asistente IA contesta 24/7, agenda citas y cierra ventas.',
    type: 'website',
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voila Voice AI - Asistentes de IA Receptionist',
    description: 'Nunca vuelvas a perder una llamada. Tu asistente IA contesta 24/7.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
