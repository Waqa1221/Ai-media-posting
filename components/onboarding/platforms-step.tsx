'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { platformsSchema, type Platforms } from '@/lib/schemas/onboarding'
import { SOCIAL_PLATFORMS } from '@/lib/constants/industries'
import { FormFieldWrapper } from './form-field-wrapper'
import { PlatformCard } from './platform-card'
import { GoalSelector } from './goal-selector'
import { Share2, Target } from 'lucide-react'
import { useState } from 'react'

interface PlatformsStepProps {
  data?: Platforms
  onSubmit: (data: Platforms) => void
}


export function PlatformsStep({ data, onSubmit }: PlatformsStepProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(data?.selectedPlatforms || [])
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data?.goals || [])

  const form = useForm<Platforms>({
    resolver: zodResolver(platformsSchema),
    defaultValues: data || {
      selectedPlatforms: [],
      priorities: {},
      goals: []
    }
  })

  const handlePlatformToggle = (platformId: string) => {
    const newPlatforms = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(p => p !== platformId)
      : [...selectedPlatforms, platformId]
    
    setSelectedPlatforms(newPlatforms)
    form.setValue('selectedPlatforms', newPlatforms)
  }

  const handleGoalsChange = (goals: string[]) => {
    setSelectedGoals(goals)
    form.setValue('goals', goals as any)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Choose your social platforms
        </CardTitle>
        <CardDescription>
          Select the platforms where you want to build your presence and achieve your goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Platform Selection */}
            <FormField
              control={form.control}
              name="selectedPlatforms"
              render={() => (
                <FormFieldWrapper label="Social Media Platforms (Select at least 1)" required>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        isSelected={selectedPlatforms.includes(platform.id)}
                        onToggle={() => handlePlatformToggle(platform.id)}
                      />
                    ))}
                  </div>
                  {selectedPlatforms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedPlatforms.map((platformId) => {
                        const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId)
                        return platform ? (
                          <Badge key={platformId} variant="secondary" className="flex items-center gap-1">
                            <span>{platform.icon}</span>
                            {platform.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </FormFieldWrapper>
              )}
            />

            {/* Goals Selection */}
            <FormField
              control={form.control}
              name="goals"
              render={() => (
                <FormFieldWrapper label="Marketing Goals (Select at least 1)" required>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">What do you want to achieve with social media?</span>
                  </div>
                  <GoalSelector 
                    selectedGoals={selectedGoals}
                    onGoalsChange={handleGoalsChange}
                    minRequired={1}
                  />
                </FormFieldWrapper>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}