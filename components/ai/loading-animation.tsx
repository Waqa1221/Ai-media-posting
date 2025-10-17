'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Image, Zap, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LoadingAnimationProps {
  stage: 'analyzing' | 'generating' | 'images' | 'optimization' | 'complete'
  message?: string
}

export function LoadingAnimation({ stage, message }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { 
      id: 'analyzing',
      label: 'Analyzing Brief', 
      icon: Sparkles, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      description: 'Understanding your requirements...'
    },
    { 
      id: 'generating', 
      label: 'Generating Content', 
      icon: Sparkles, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      description: 'Creating engaging captions and hashtags...'
    },
    { 
      id: 'images', 
      label: 'Creating Images', 
      icon: Image, 
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      description: 'Generating stunning visuals...'
    },
    { 
      id: 'optimization', 
      label: 'Optimizing Content', 
      icon: Zap, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      description: 'Fine-tuning for maximum engagement...'
    },
    { 
      id: 'complete', 
      label: 'Complete', 
      icon: CheckCircle, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      description: 'Your content is ready!'
    }
  ]

  useEffect(() => {
    const stageIndex = steps.findIndex(step => step.id === stage)
    setCurrentStep(stageIndex)
    
    // Animate progress based on stage
    const targetProgress = ((stageIndex + 1) / steps.length) * 100
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          clearInterval(interval)
          return targetProgress
        }
        return Math.min(prev + 3, targetProgress)
      })
    }, 50)

    return () => {
      clearInterval(interval)
    }
  }, [stage])

  const getStageMessage = () => {
    const currentStepData = steps[currentStep]
    return message || currentStepData?.description || 'Processing...'
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Main Animation */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              
              {/* Inner pulsing circle */}
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-primary to-purple-600 animate-pulse flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            <div className="flex justify-between items-center overflow-x-auto pb-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                const isUpcoming = index > currentStep
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1 min-w-0">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 mb-2
                      ${isActive ? `${step.bgColor} ${step.color} scale-110 shadow-lg` : ''}
                      ${isCompleted ? 'bg-emerald-100 text-emerald-500' : ''}
                      ${isUpcoming ? 'bg-gray-100 text-gray-400' : ''}
                    `}>
                      <StepIcon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-300 text-center ${
                      isActive ? step.color : isCompleted ? 'text-emerald-500' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {steps[currentStep]?.label || 'Processing...'}
            </h3>
            <p className="text-gray-600 animate-pulse">
              {getStageMessage()}
            </p>
          </div>

          {/* Floating Particles Animation */}
          <div className="relative h-16 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 animate-bounce`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    marginLeft: i > 0 ? '8px' : '0'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Did you know?</strong> AI-generated content gets 85% more engagement on average!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}