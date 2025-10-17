'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { audienceSchema, type Audience } from '@/lib/schemas/onboarding'
import { FormFieldWrapper } from './form-field-wrapper'
import { AgeRangeSelect } from './age-range-select'
import { AudienceSizeSelect } from './audience-size-select'
import { InterestsSelector } from './interests-selector'
import { Target, MapPin } from 'lucide-react'
import { useState } from 'react'

interface AudienceStepProps {
  data?: Audience
  onSubmit: (data: Audience) => void
}

export function AudienceStep({ data, onSubmit }: AudienceStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data?.interests || [])

  const form = useForm<Audience>({
    resolver: zodResolver(audienceSchema),
    defaultValues: data || {
      primaryAgeRange: '',
      secondaryAgeRanges: [],
      interests: [],
      location: '',
      audienceSize: 'local'
    }
  })

  const handleInterestsChange = (interests: string[]) => {
    setSelectedInterests(interests)
    form.setValue('interests', interests)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Define your target audience
        </CardTitle>
        <CardDescription>
          Understanding your audience helps us create content that resonates with them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="primaryAgeRange"
                render={({ field }) => (
                  <FormFieldWrapper label="Primary Age Range" required>
                    <AgeRangeSelect 
                      value={field.value} 
                      onValueChange={field.onChange}
                      placeholder="Select primary age range"
                    />
                  </FormFieldWrapper>
                )}
              />

              <FormField
                control={form.control}
                name="audienceSize"
                render={({ field }) => (
                  <FormFieldWrapper label="Audience Reach" required>
                    <AudienceSizeSelect 
                      value={field.value} 
                      onValueChange={field.onChange} 
                    />
                  </FormFieldWrapper>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormFieldWrapper label="Target Location" required>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Input placeholder="e.g., United States, California, San Francisco" {...field} />
                  </div>
                </FormFieldWrapper>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormFieldWrapper label="Audience Interests (Select at least 3)" required>
                  <InterestsSelector 
                    selectedInterests={selectedInterests}
                    onInterestsChange={handleInterestsChange}
                    minRequired={3}
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