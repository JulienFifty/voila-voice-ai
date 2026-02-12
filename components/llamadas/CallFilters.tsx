'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { TipoInteres, Score, Urgencia } from '@/types/realty'

interface CallFiltersProps {
  onFilterChange: (filters: CallFilters) => void
}

export interface CallFilters {
  tipoInteres?: TipoInteres | null
  score?: Score | null
  urgencia?: Urgencia | null
  fechaDesde?: string | null
  fechaHasta?: string | null
  zona?: string | null
  busqueda?: string | null
}

export default function CallFiltersComponent({ onFilterChange }: CallFiltersProps) {
  const [filters, setFilters] = useState<CallFilters>({})
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof CallFilters, value: any) => {
    const newFilters = { ...filters, [key]: value || null }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: CallFilters = {}
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {Object.values(filters).filter(v => v !== null && v !== undefined).length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Tipo de Interés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Interés
            </label>
            <select
              value={filters.tipoInteres || ''}
              onChange={(e) => updateFilter('tipoInteres', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="compra">Compra 🏠</option>
              <option value="renta">Renta 🔑</option>
              <option value="venta">Venta 💰</option>
              <option value="info">Información ℹ️</option>
            </select>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Score
            </label>
            <select
              value={filters.score || ''}
              onChange={(e) => updateFilter('score', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="A">A - Hot Lead 🔥</option>
              <option value="B">B - Warm Lead 🟡</option>
              <option value="C">C - Cold Lead 🔵</option>
            </select>
          </div>

          {/* Urgencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgencia
            </label>
            <select
              value={filters.urgencia || ''}
              onChange={(e) => updateFilter('urgencia', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="alta">Alta 🔴</option>
              <option value="media">Media 🟡</option>
              <option value="baja">Baja 🟢</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, teléfono, zona..."
              value={filters.busqueda || ''}
              onChange={(e) => updateFilter('busqueda', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filters.fechaDesde || ''}
              onChange={(e) => updateFilter('fechaDesde', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.fechaHasta || ''}
              onChange={(e) => updateFilter('fechaHasta', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona
            </label>
            <input
              type="text"
              placeholder="Ej: Angelópolis, Centro..."
              value={filters.zona || ''}
              onChange={(e) => updateFilter('zona', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
