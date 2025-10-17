'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
  isLoading?: boolean
  canProceed?: boolean
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  isLoading = false,
  canProceed = true
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex justify-between pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isLoading}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {isLastStep ? (
        <Button
          onClick={onComplete}
          disabled={!canProceed || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? 'Completing...' : 'Complete Setup'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}