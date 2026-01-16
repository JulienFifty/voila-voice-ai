import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import DemoSection from '@/components/landing/DemoSection'
import UseCasesSection from '@/components/landing/UseCasesSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DashboardPreview from '@/components/landing/DashboardPreview'
import ComparisonSection from '@/components/landing/ComparisonSection'
import PricingSection from '@/components/landing/PricingSection'
import ROICalculator from '@/components/landing/ROICalculator'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FAQSection from '@/components/landing/FAQSection'
import FinalCTASection from '@/components/landing/FinalCTASection'
import Footer from '@/components/landing/Footer'
import DemoRequestForm from '@/components/forms/DemoRequestForm'
import Section from '@/components/ui/Section'
import Heading from '@/components/ui/Heading'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <HeroSection />
      <div id="problem" className="scroll-mt-20"></div>
      <ProblemSection />
      <div id="solution" className="scroll-mt-20"></div>
      <SolutionSection />
      <div id="demo" className="scroll-mt-20"></div>
      <DemoSection />
      <div id="use-cases" className="scroll-mt-20"></div>
      <UseCasesSection />
      <div id="features" className="scroll-mt-20"></div>
      <FeaturesSection />
      <div id="dashboard" className="scroll-mt-20"></div>
      <DashboardPreview />
      <div id="comparison" className="scroll-mt-20"></div>
      <ComparisonSection />
      <div id="pricing" className="scroll-mt-20"></div>
      <PricingSection />
      <div id="roi" className="scroll-mt-20"></div>
      <ROICalculator />
      <div id="testimonials" className="scroll-mt-20"></div>
      <TestimonialsSection />
      <div id="faq" className="scroll-mt-20"></div>
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
