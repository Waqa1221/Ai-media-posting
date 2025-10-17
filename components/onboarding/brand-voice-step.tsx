'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { brandVoiceSchema, type BrandVoice } from '@/lib/schemas/onboarding'
import { FormFieldWrapper } from './form-field-wrapper'
import { VoiceSlider } from './voice-slider'
import { ContentTypeSelector } from './content-type-selector'
import { PostingFrequencySelect } from './posting-frequency-select'
import { Palette, MessageSquare, Calendar } from 'lucide-react'
import { useState } from 'react'

interface BrandVoiceStepProps {
  data?: BrandVoice
  onSubmit: (data: BrandVoice) => void
}


export function BrandVoiceStep({ data, onSubmit }: BrandVoiceStepProps) {
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(data?.contentTypes || [])

  const form = useForm<BrandVoice>({
    resolver: zodResolver(brandVoiceSchema),
    defaultValues: data || {
      tone: 50,
      personality: 50,
      expertise: 50,
      contentTypes: [],
      postingFrequency: 'few-times-week'
    }
  })

  const handleContentTypesChange = (types: string[]) => {
    setSelectedContentTypes(types)
    form.setValue('contentTypes', types as any)
  }

  const getToneLabel = (value: number) => {
    if (value < 25) return 'Very Formal'
    if (value < 50) return 'Formal'
    if (value < 75) return 'Casual'
    return 'Very Casual'
  }

  const getPersonalityLabel = (value: number) => {
    if (value < 25) return 'Very Serious'
    if (value < 50) return 'Serious'
    if (value < 75) return 'Humorous'
    return 'Very Humorous'
  }

  const getExpertiseLabel = (value: number) => {
    if (value < 25) return 'Very Approachable'
    if (value < 50) return 'Approachable'
    if (value < 75) return 'Authoritative'
    return 'Very Authoritative'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Define your brand voice
        </CardTitle>
        <CardDescription>
          Your brand voice shapes how your audience perceives and connects with your content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Voice Sliders */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <VoiceSlider
                    label="Communication Tone"
                    value={field.value}
                    onValueChange={field.onChange}
                    leftLabel="Formal"
                    rightLabel="Casual"
                    getValueLabel={getToneLabel}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <VoiceSlider
                    label="Personality"
                    value={field.value}
                    onValueChange={field.onChange}
                    leftLabel="Serious"
                    rightLabel="Humorous"
                    getValueLabel={getPersonalityLabel}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="expertise"
                render={({ field }) => (
                  <VoiceSlider
                    label="Expertise Level"
                    value={field.value}
                    onValueChange={field.onChange}
                    leftLabel="Approachable"
                    rightLabel="Authoritative"
                    getValueLabel={getExpertiseLabel}
                  />
                )}
              />
            </div>

            {/* Content Types */}
            <FormField
              control={form.control}
              name="contentTypes"
              render={() => (
                <FormFieldWrapper label="Content Types (Select at least 2)" required>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Choose the types of content you want to create</span>
                  </div>
                  <ContentTypeSelector 
                    selectedTypes={selectedContentTypes}
                    onTypesChange={handleContentTypesChange}
                    minRequired={2}
                  />
                </FormFieldWrapper>
              )}
            />

            {/* Posting Frequency */}
            <FormField
              control={form.control}
              name="postingFrequency"
              render={({ field }) => (
                <FormFieldWrapper label="Posting Frequency" required>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">How often do you want to post?</span>
                  </div>
                  <PostingFrequencySelect 
                    value={field.value} 
                    onValueChange={field.onChange} 
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