'use client'

import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'
import Accordion from '@/components/ui/Accordion'

const faqItems = [
  {
    question: '¿Los clientes notan que es IA?',
    answer: 'No. Nuestra IA usa voz ultra-realista con acento mexicano. El 95% de llamadas no distinguen que no es humano.',
  },
  {
    question: '¿Cuánto tarda la instalación?',
    answer: '24-48 horas máximo. Te configuramos todo y solo desvías tus llamadas.',
  },
  {
    question: '¿Qué pasa si la IA no puede resolver algo?',
    answer: 'Transfiere automáticamente la llamada a ti o a quien designes.',
  },
  {
    question: '¿Funciona con mi número actual?',
    answer: 'Sí. Puedes desviar tu número existente o te damos uno nuevo.',
  },
  {
    question: '¿Necesito conocimientos técnicos?',
    answer: 'Cero. Nosotros configuramos todo. Tú solo usas el dashboard.',
  },
  {
    question: '¿Hay contrato de permanencia?',
    answer: 'No. Mes a mes sin ataduras. Cancelas cuando quieras.',
  },
  {
    question: '¿Qué pasa con mis datos y grabaciones?',
    answer: '100% seguros. Cumplimos con LFPDPPP (Ley de Privacidad México). Encriptación de datos.',
  },
  {
    question: '¿Funciona para mi industria específica?',
    answer: 'Sí. Personalizamos el script para tu giro: inmobiliaria, salud, legal, restaurantes, servicios, etc.',
  },
]

export default function FAQSection() {
  return (
    <Section background="gray">
      <Heading level={2} subheading="Resolvemos todas tus dudas">
        Preguntas Frecuentes
      </Heading>
      
      <div className="mt-12">
        <Accordion items={faqItems} />
      </div>
    </Section>
  )
}
