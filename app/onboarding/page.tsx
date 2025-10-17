'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/hooks/use-onboarding'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { StepNavigation } from '@/components/onboarding/step-navigation'
import { BusinessInfoStep } from '@/components/onboarding/business-info-step'
import { AudienceStep } from '@/components/onboarding/audience-step'
import { BrandVoiceStep } from '@/components/onboarding/brand-voice-step'
import { PlatformsStep } from '@/components/onboarding/platforms-step'
import { CompletionStep } from '@/components/onboarding/completion-step'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import type { BusinessInfo, Audience, BrandVoice, Platforms } from '@/lib/schemas/onboarding'

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const {
    currentStep,
    data,
    isLoading,
    error,
    isComplete,
    updateStep,
    completeOnboarding,
    goToStep,
    generateAISuggestions
  } = useOnboarding()

  useEffect(() => {
    // Track page view
    try {
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('onboarding_page_viewed', {
          step: currentStep,
          is_complete: isComplete
        })
      }
    } catch (error) {
      // Silently fail if PostHog is not available
    }

    // Redirect if already complete
    if (isComplete) {
      router.push('/dashboard?onboarding=complete')
    }
  }, [currentStep, isComplete, router])

  const handleStepSubmit = async (stepData: any) => {
    const nextStep = currentStep + 1
    
    if (nextStep > TOTAL_STEPS) {
      await completeOnboarding()
    } else {
      await updateStep(nextStep, stepData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    // This will be handled by form submission
  }

  const handleStartSubscription = () => {
    try {
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('onboarding_subscription_clicked')
      }
    } catch (error) {
      // Silently fail if PostHog is not available
    }
    router.push('/dashboard/billing')
  }

  const handleGenerateSampleContent = async () => {
    try {
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('onboarding_generate_content_clicked')
      }
    } catch (error) {
      // Silently fail if PostHog is not available
    }
    await generateAISuggestions()
    router.push('/dashboard/posts?sample=true')
  }

  const handleConnectPlatforms = () => {
    try {
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('onboarding_connect_platforms_clicked')
      }
    } catch (error) {
      // Silently fail if PostHog is not available
    }
    router.push('/dashboard/settings/social-accounts')
  }

  if (isLoading && currentStep === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your onboarding...</p>
        </div>
      </div>
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!(data.businessInfo?.companyName && data.businessInfo?.industry)
      case 2:
        return !!(data.audience?.primaryAgeRange && (data.audience?.interests?.length ?? 0) >= 3)
      case 3:
        return !!(data.brandVoice?.contentTypes && data.brandVoice.contentTypes.length >= 2)
      case 4:
        return !!(
          (data.platforms?.selectedPlatforms?.length ?? 0) >= 1 && 
          (data.platforms?.goals?.length ?? 0) >= 1
        )
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to SocialAI</h1>
          <p className="text-muted-foreground">
            Let's set up your social media strategy in just a few steps
          </p>
        </div>

        {/* Progress */}
        <ProgressBar 
          currentStep={currentStep} 
          totalSteps={TOTAL_STEPS} 
          className="mb-8"
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <BusinessInfoStep
              data={data.businessInfo}
              onSubmit={(stepData: BusinessInfo) => handleStepSubmit({ businessInfo: stepData })}
            />
          )}

          {currentStep === 2 && (
            <AudienceStep
              data={data.audience}
              onSubmit={(stepData: Audience) => handleStepSubmit({ audience: stepData })}
            />
          )}

          {currentStep === 3 && (
            <BrandVoiceStep
              data={data.brandVoice}
              onSubmit={(stepData: BrandVoice) => handleStepSubmit({ brandVoice: stepData })}
            />
          )}

          {currentStep === 4 && (
            <PlatformsStep
              data={data.platforms}
              onSubmit={(stepData: Platforms) => handleStepSubmit({ platforms: stepData })}
            />
          )}

          {currentStep === 5 && (
            <CompletionStep
              data={data}
              onStartSubscription={handleStartSubscription}
              onGenerateSampleContent={handleGenerateSampleContent}
              onConnectPlatforms={handleConnectPlatforms}
              isGenerating={isLoading}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStep <= TOTAL_STEPS && (
          <Card>
            <CardContent className="p-6">
              <StepNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={completeOnboarding}
                isLoading={isLoading}
                canProceed={canProceed()}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}