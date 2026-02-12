'use client'

interface FormattedCurrencyProps {
  amount?: number | null
  min?: number | null
  max?: number | null
  className?: string
}

export function FormattedCurrency({ amount, min, max, className = '' }: FormattedCurrencyProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Si hay min y max, mostrar rango
  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return (
      <span className={className}>
        {formatCurrency(min)} - {formatCurrency(max)}
      </span>
    )
  }

  // Si solo hay min
  if (min !== null && min !== undefined) {
    return (
      <span className={className}>
        Desde {formatCurrency(min)}
      </span>
    )
  }

  // Si solo hay max
  if (max !== null && max !== undefined) {
    return (
      <span className={className}>
        Hasta {formatCurrency(max)}
      </span>
    )
  }

  // Si hay un amount único
  if (amount !== null && amount !== undefined) {
    return (
      <span className={className}>
        {formatCurrency(amount)}
      </span>
    )
  }

  return <span className={className}>No especificado</span>
}
