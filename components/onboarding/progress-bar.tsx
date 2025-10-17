'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}