'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { IndustrySelect } from '@/components/onboarding/industry-select'
import { ToneSelect } from './tone-select'
import { PlatformSelect } from './platform-select'
import { KeywordInput } from './keyword-input'
import { contentBriefSchema, type ContentBrief } from '@/lib/ai/types'
import { Sparkles } from 'lucide-react'

interface ContentBriefFormProps {
  onSubmit: (brief: ContentBrief) => void
  isLoading?: boolean
  defaultValues?: Partial<ContentBrief>
}

export function ContentBriefForm({ onSubmit, isLoading, defaultValues }: ContentBriefFormProps) {
  const form = useForm<ContentBrief>({
    resolver: zodResolver(contentBriefSchema),
    defaultValues: {
      industry: '',
      tone: 'friendly',
      keywords: [],
      platform: 'facebook',
      targetAudience: '',
      brandVoice: '',
      ...defaultValues,
    },
  })

  const handleSubmit = (data: ContentBrief) => {
    console.log('Submitting content brief:', data)
    onSubmit(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Content Brief
        </CardTitle>
        <CardDescription>
          Provide details about your content requirements to generate engaging posts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <IndustrySelect 
                  value={form.watch('industry')} 
                  onValueChange={(value) => form.setValue('industry', value)} 
                />
                {form.formState.errors.industry && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.industry.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <PlatformSelect 
                  value={form.watch('platform')} 
                  onValueChange={(value) => form.setValue('platform', value as ContentBrief['platform'])} 
                />
                {form.formState.errors.platform && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.platform.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tone</label>
                <ToneSelect 
                  value={form.watch('tone')} 
                  onValueChange={(value) => form.setValue('tone', value as ContentBrief['tone'])} 
                />
                {form.formState.errors.tone && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.tone.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Keywords</label>
                <KeywordInput 
                  value={form.watch('keywords')} 
                  onChange={(value) => form.setValue('keywords', value)} 
                />
                {form.formState.errors.keywords && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.keywords.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience (Optional)</label>
              <Input 
                placeholder="e.g., Young professionals aged 25-35 interested in fitness"
                value={form.watch('targetAudience') || ''}
                onChange={(e) => form.setValue('targetAudience', e.target.value)}
              />
              {form.formState.errors.targetAudience && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.targetAudience.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Brand Voice (Optional)</label>
              <Textarea 
                placeholder="Describe your brand's personality and communication style..."
                className="min-h-[80px]"
                value={form.watch('brandVoice') || ''}
                onChange={(e) => form.setValue('brandVoice', e.target.value)}
              />
              {form.formState.errors.brandVoice && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.brandVoice.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : 'Generate Content'}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
        </form>
      </CardContent>
    </Card>
  )
}