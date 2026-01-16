import { LucideIcon } from 'lucide-react'
import Card from './Card'

interface StatCardProps {
  icon: LucideIcon
  number: string | number
  label: string
  description?: string
}

export default function StatCard({
  icon: Icon,
  number,
  label,
  description,
}: StatCardProps) {
  return (
    <Card glassmorphism hover className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div className="text-5xl font-bold text-gray-900 mb-2">{number}</div>
      <div className="text-lg font-semibold text-gray-700 mb-2">{label}</div>
      {description && (
        <p className="text-gray-600 text-sm">{description}</p>
      )}
    </Card>
  )
}
