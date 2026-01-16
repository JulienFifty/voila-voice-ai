'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              Voila Voice AI
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Características
            </Link>
            <Link
              href="#use-cases"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Casos de Uso
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Precios
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Button
              href="/register"
              variant="primary"
              size="sm"
            >
              Probar gratis
            </Button>
            <Button
              href="#contacto"
              variant="secondary"
              size="sm"
              className="bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Solicitar demo
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="#features"
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Características
            </Link>
            <Link
              href="#use-cases"
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Casos de Uso
            </Link>
            <Link
              href="#pricing"
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Button
              href="/register"
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comenzar
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
