'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { BusinessInfo, Audience, BrandVoice, Platforms } from '@/lib/schemas/onboarding'

export interface OnboardingData {
  businessInfo?: BusinessInfo
  audience?: Audience
  brandVoice?: BrandVoice
  platforms?: Platforms
}

export interface OnboardingState {
  currentStep: number
  data: OnboardingData
  isLoading: boolean
  error: string | null
  isComplete: boolean
}

export function useOnboarding() {
  const router = useRouter()
  const supabase = createClient()
  
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    data: {},
    isLoading: false,
    error: null,
    isComplete: false
  })

  // Load existing onboarding data
  useEffect(() => {
    loadOnboardingData()
  }, [])

  const loadOnboardingData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Check if onboarding is complete
      const isComplete = !!(
        profile.company_name &&
        profile.full_name
      )

      if (isComplete) {
        setState(prev => ({ 
          ...prev, 
          isComplete: true,
          currentStep: 5,
          isLoading: false 
        }))
        return
      }

      // Load saved onboarding progress
      const savedData = localStorage.getItem('onboarding-data')
      const savedStep = localStorage.getItem('onboarding-step')
      
      if (savedData) {
        setState(prev => ({
          ...prev,
          data: JSON.parse(savedData),
          currentStep: savedStep ? parseInt(savedStep) : 1,
          isLoading: false
        }))
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }

    } catch (error) {
      console.error('Error loading onboarding data:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load onboarding data',
        isLoading: false 
      }))
    }
  }, [supabase])

  const updateStep = useCallback(async (step: number, stepData: Partial<OnboardingData>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const newData = { ...state.data, ...stepData }
      
      // Save to localStorage for persistence
      localStorage.setItem('onboarding-data', JSON.stringify(newData))
      localStorage.setItem('onboarding-step', step.toString())

      // Track step completion
      try {
        if (typeof window !== 'undefined' && window.posthog) {
          window.posthog.capture('onboarding_step_completed', {
            step,
            step_name: getStepName(step),
            data: stepData
          })
        }
      } catch (error) {
        // Silently fail if PostHog is not available
      }

      setState(prev => ({
        ...prev,
        currentStep: step,
        data: newData,
        isLoading: false
      }))

      // Save progress to Supabase
      await saveProgressToSupabase(newData)

    } catch (error) {
      console.error('Error updating onboarding step:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to save progress',
        isLoading: false 
      }))
    }
  }, [state.data])

  const saveProgressToSupabase = useCallback(async (data: OnboardingData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const updateData: any = {}

      if (data.businessInfo) {
        updateData.company_name = data.businessInfo.companyName
        updateData.full_name = user.user_metadata?.full_name || user.email?.split('@')[0]
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)

        if (error) throw error
      }

    } catch (error) {
      console.error('Error saving to Supabase:', error)
    }
  }, [supabase])

  const completeOnboarding = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Final save to Supabase
      await saveProgressToSupabase(state.data)

      // Generate AI suggestions
      await generateAISuggestions()

      // Track completion
      try {
        if (typeof window !== 'undefined' && window.posthog) {
          window.posthog.capture('onboarding_completed', {
            user_id: user.id,
            completion_time: Date.now(),
            data: state.data
          })
        }
      } catch (error) {
        // Silently fail if PostHog is not available
      }

      // Clear localStorage
      localStorage.removeItem('onboarding-data')
      localStorage.removeItem('onboarding-step')

      setState(prev => ({ 
        ...prev, 
        isComplete: true,
        currentStep: 5,
        isLoading: false 
      }))

      // Redirect to dashboard
      router.push('/dashboard?onboarding=complete')

    } catch (error) {
      console.error('Error completing onboarding:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to complete onboarding',
        isLoading: false 
      }))
    }
  }, [state.data, supabase, router])

  const generateAISuggestions = useCallback(async () => {
    try {
      // This would integrate with your AI service
      const suggestions = await fetch('/api/ai/generate-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data)
      })

      if (suggestions.ok) {
        const data = await suggestions.json()
        try {
          if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.capture('ai_suggestions_generated', {
              suggestions_count: data.suggestions?.length || 0
            })
          }
        } catch (error) {
          // Silently fail if PostHog is not available
        }
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
    }
  }, [state.data])

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }))
    localStorage.setItem('onboarding-step', step.toString())
  }, [])

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('onboarding-data')
    localStorage.removeItem('onboarding-step')
    setState({
      currentStep: 1,
      data: {},
      isLoading: false,
      error: null,
      isComplete: false
    })
  }, [])

  return {
    ...state,
    updateStep,
    completeOnboarding,
    goToStep,
    resetOnboarding,
    generateAISuggestions
  }
}

function getStepName(step: number): string {
  const stepNames = {
    1: 'business_info',
    2: 'audience',
    3: 'brand_voice',
    4: 'platforms',
    5: 'complete'
  }
  return stepNames[step as keyof typeof stepNames] || 'unknown'
}