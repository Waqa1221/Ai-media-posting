'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ContentBriefForm } from '@/components/ai/content-brief-form'
import { LoadingAnimation } from '@/components/ai/loading-animation'
import GeneratedContentDisplay from '@/components/ai/generated-content-display'
import { PlatformInfoCard } from '@/components/ai/platform-info-card'
import { useAIGenerator } from '@/hooks/use-ai-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, CircleAlert as AlertCircle } from 'lucide-react'
import type { ContentBrief } from '@/lib/ai/types'
import type { GenerationResult } from '@/lib/ai/types'
import { toast } from 'sonner'

export default function AIGeneratorPage() {
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'gpt-3.5-turbo'>('gpt-4')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook')
  const router = useRouter()
  const supabase = createClient()
  
  const aiGeneratorOptions = useMemo(() => ({
    onSuccess: (result: GenerationResult) => {
      console.log('Content generated successfully:', result)
      toast.success('Content generated successfully!')
    },
    onError: (error: string) => {
      console.error('Generation failed:', error)
      toast.error('Failed to generate content. Please try again.')
    }
  }), [])

  const { 
    generateContent, 
    regenerateContent, 
    isGenerating, 
    loadingStage,
    lastGeneration, 
    error 
  } = useAIGenerator(aiGeneratorOptions)

  // Check if API keys are configured
  const checkApiKeys = useCallback(async () => {
    try {
      const response = await fetch('/api/health/check-keys')
      const data = await response.json()
      
      if (!data.openai) {
        console.warn('OpenAI API key not configured')
      }
    } catch (error) {
      console.error('Failed to check API keys:', error)
    }
  }, [])

  useEffect(() => {
    checkApiKeys()
  }, [checkApiKeys])

  const handleSubmit = async (brief: ContentBrief) => {
    console.log('AI Generator form submitted with brief:', brief)
    setSelectedPlatform(brief.platform)
    await generateContent(brief, selectedModel)
  }

  const handleRegenerate = async () => {
    if (lastGeneration) {
      // For demo purposes, create a basic brief from the last generation
      const brief: ContentBrief = {
        industry: 'technology',
        tone: 'friendly',
        keywords: ['AI', 'social media'],
        platform: 'facebook'
      }
      await regenerateContent(brief, selectedModel)
    }
  }

  const handleSave = useCallback(async (content: any) => {
    try {
      setIsSaving(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to save posts')
        return
      }

      // Redirect to scheduler with AI content
      const contentToSchedule = {
        caption: content.caption,
        hashtags: content.hashtags,
        image_prompt: content.image_prompt,
        generated_images: content.generated_images,
        selected_image: content.selected_image,
        optimal_time: content.optimal_time,
        cta: content.cta,
        engagement_hooks: content.engagement_hooks,
        content_pillars: content.content_pillars
      }
      
      const encodedContent = encodeURIComponent(JSON.stringify(contentToSchedule))
      router.push(`/dashboard/scheduler?ai-content=${encodedContent}`)

    } catch (error) {
      console.error('Error saving post:', error)
      toast.error('Failed to save post. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [selectedModel, supabase, router])

  const getOptimalScheduleTime = (optimalTime: string) => {
    const today = new Date()
    const [hours, minutes] = optimalTime.split(':').map(Number)
    
    // If the optimal time has passed today, schedule for tomorrow
    const scheduleDate = new Date(today)
    scheduleDate.setHours(hours, minutes, 0, 0)
    
    if (scheduleDate <= today) {
      scheduleDate.setDate(scheduleDate.getDate() + 1)
    }
    
    return scheduleDate.toISOString()
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          AI Content Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate engaging social media content with AI-powered creativity
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ContentBriefForm 
            onSubmit={handleSubmit}
            isLoading={isGenerating}
          />
          
          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle>AI Model</CardTitle>
              <CardDescription>
                Choose the AI model for content generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedModel('gpt-4')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedModel === 'gpt-4' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">GPT-4</div>
                  <div className="text-sm text-muted-foreground">
                    Higher quality, more creative
                  </div>
                </button>
                <button
                  onClick={() => setSelectedModel('gpt-3.5-turbo')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedModel === 'gpt-3.5-turbo' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">GPT-3.5 Turbo</div>
                  <div className="text-sm text-muted-foreground">
                    Faster, cost-effective
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Info Card */}
          <PlatformInfoCard platform={selectedPlatform} />
        </div>

        <div>
          {isGenerating ? (
            <LoadingAnimation 
              stage={loadingStage} 
              message="Creating your perfect social media content..."
            />
          ) : lastGeneration ? (
            <GeneratedContentDisplay
              result={lastGeneration.content}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
              isRegenerating={isGenerating || isSaving}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                <p className="text-muted-foreground">
                  Fill out the content brief to generate your first AI-powered post
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}