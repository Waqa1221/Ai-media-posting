'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { CTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'

export default function LandingPage() {
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Always redirect to dashboard after login
        router.push('/dashboard')
      } else {
        setIsChecking(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsChecking(false)
    }
  }, [router, supabase])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}