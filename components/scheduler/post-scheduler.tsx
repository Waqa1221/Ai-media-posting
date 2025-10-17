'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PlatformBestPracticesWidget } from '@/components/social/platform-best-practices-widget'
import { ContentOptimizationWidget } from '@/components/dashboard/content-optimization-widget'
import { ContentValidationPanel } from '@/components/scheduler/content-validation-panel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, Clock, Send, Save, Sparkles, Hash, Image, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Plus, X, Target, Zap, RefreshCw } from 'lucide-react'
import { format, isBefore, setHours, setMinutes, addDays } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PostData {
  title: string
  content: string
  platforms: string[]
  hashtags: string[]
  mediaUrls: string[]
  scheduledDate: Date | null
  scheduledTime: string
  publishNow: boolean
  aiGenerated: boolean
  aiPrompt?: string
}

interface ConnectedAccount {
  id: string
  platform: string
  username: string
  display_name: string
  is_active: boolean
}

interface ValidationErrors {
  content?: string
  platforms?: string
  schedule?: string
  hashtags?: string
}

interface Platform {
  id: string
  name: string
  icon: string
  color: string
  maxLength: number
}

const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-pink-100 text-pink-800', maxLength: 2200 },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-100 text-blue-800', maxLength: 3000 },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-gray-100 text-gray-800', maxLength: 280 },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-100 text-blue-800', maxLength: 63206 },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black text-white', maxLength: 150 }
]

const OPTIMAL_TIMES = [
  { time: '09:00', label: '9:00 AM', description: 'Morning engagement peak' },
  { time: '12:00', label: '12:00 PM', description: 'Lunch break activity' },
  { time: '15:00', label: '3:00 PM', description: 'Afternoon break' },
  { time: '17:00', label: '5:00 PM', description: 'End of workday' },
  { time: '19:00', label: '7:00 PM', description: 'Evening social time' },
  { time: '21:00', label: '9:00 PM', description: 'Prime time engagement' }
]

interface PostSchedulerProps {
  initialData?: Partial<PostData>
  onComplete?: (post: any) => void
  onCancel?: () => void
}

export function PostScheduler({ initialData, onComplete, onCancel }: PostSchedulerProps) {
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    platforms: [],
    hashtags: [],
    mediaUrls: [],
    scheduledDate: null,
    scheduledTime: '09:00',
    publishNow: false,
    aiGenerated: false,
    ...initialData
  })
  
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [hashtagInput, setHashtagInput] = useState('')
  const [activeTab, setActiveTab] = useState('content')
  const [contentScore, setContentScore] = useState(0)
  
  const router = useRouter()
  const supabase = createClient()

  // Load connected accounts on mount
  useEffect(() => {
    loadConnectedAccounts()
  }, [])

  // Load AI content from URL params if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const aiContent = urlParams.get('ai-content')
    if (aiContent) {
      loadAIContent(aiContent)
    }
  }, [])

  // Calculate content score when data changes
  useEffect(() => {
    calculateContentScore()
  }, [postData])

  const loadConnectedAccounts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) throw error
      setConnectedAccounts(data || [])
    } catch (error) {
      console.error('Error loading connected accounts:', error)
      toast.error('Failed to load connected accounts')
    }
  }, [supabase])

  const loadAIContent = (aiContentParam: string) => {
    try {
      const parsedContent = JSON.parse(decodeURIComponent(aiContentParam))
      setPostData(prev => ({
        ...prev,
        content: parsedContent.caption || '',
        hashtags: parsedContent.hashtags || [],
        title: parsedContent.caption?.substring(0, 50) + '...' || '',
        aiGenerated: true,
        aiPrompt: JSON.stringify(parsedContent)
      }))
      toast.success('AI-generated content loaded!')
      setActiveTab('platforms')
    } catch (error) {
      console.error('Error parsing AI content:', error)
      toast.error('Failed to load AI content')
    }
  }

  const calculateContentScore = () => {
    let score = 0
    
    // Content length score
    if (postData.content.length > 0) {
      if (postData.content.length >= 50 && postData.content.length <= 300) {
        score += 25
      } else if (postData.content.length > 0) {
        score += 15
      }
    }
    
    // Platform selection score
    if (postData.platforms.length > 0) {
      score += 20
    }
    
    // Hashtag score
    if (postData.hashtags.length >= 3 && postData.hashtags.length <= 10) {
      score += 25
    } else if (postData.hashtags.length > 0) {
      score += 15
    }
    
    // Engagement elements score
    const hasQuestion = postData.content.includes('?')
    const hasCallToAction = /\b(click|visit|check|try|download|sign up|learn more|comment|share|like)\b/i.test(postData.content)
    const hasEmojis = /[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27BF]/.test(postData.content)
    
    if (hasQuestion || hasCallToAction) score += 15
    if (hasEmojis) score += 10
    
    // AI generated bonus
    if (postData.aiGenerated) score += 5
    
    setContentScore(Math.min(score, 100))
  }

  const updatePostData = (updates: Partial<PostData>) => {
    setPostData(prev => ({ ...prev, ...updates }))
    
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev }
      Object.keys(updates).forEach(key => {
        delete newErrors[key as keyof ValidationErrors]
      })
      return newErrors
    })
  }

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}

    // Content validation
    if (!postData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (postData.content.length > 5000) {
      newErrors.content = 'Content is too long (max 5000 characters)'
    }

    // Platform validation
    if (postData.platforms.length === 0) {
      newErrors.platforms = 'Select at least one platform'
    } else {
      // Check platform-specific limits
      const platformErrors: string[] = []
      postData.platforms.forEach(platformId => {
        const platform = PLATFORMS.find(p => p.id === platformId)
        if (platform && postData.content.length > platform.maxLength) {
          platformErrors.push(`Content exceeds ${platform.name} limit (${platform.maxLength} chars)`)
        }
      })
      if (platformErrors.length > 0) {
        newErrors.platforms = platformErrors.join(', ')
      }
    }

    // Schedule validation
    if (!postData.publishNow && !postData.scheduledDate) {
      newErrors.schedule = 'Select a date for scheduling or choose to publish now'
    } else if (postData.scheduledDate && !postData.publishNow) {
      const scheduledDateTime = setMinutes(
        setHours(postData.scheduledDate, parseInt(postData.scheduledTime.split(':')[0])),
        parseInt(postData.scheduledTime.split(':')[1])
      )
      
      if (isBefore(scheduledDateTime, new Date())) {
        newErrors.schedule = 'Scheduled time must be in the future'
      }
    }

    // Hashtag validation
    if (postData.hashtags.length > 30) {
      newErrors.hashtags = 'Maximum 30 hashtags allowed'
    }

    return newErrors
  }

  const generateAIContent = async () => {
    if (!postData.content.trim()) {
      toast.error('Please add some content first to enhance with AI')
      return
    }

    setIsGeneratingAI(true)
    try {
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postData.content,
          platforms: postData.platforms,
          currentHashtags: postData.hashtags
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enhance content')
      }

      // Fix: Properly handle the Set conversion
      const suggestedHashtags = result.suggestedHashtags || []
      const mergedHashtags = [...postData.hashtags, ...suggestedHashtags]
      const uniqueHashtags = Array.from(new Set(mergedHashtags))

      updatePostData({
        content: result.enhancedContent || postData.content,
        hashtags: uniqueHashtags,
        aiGenerated: true
      })

      toast.success('Content enhanced with AI!')
    } catch (error) {
      console.error('Error generating AI content:', error)
      toast.error('Failed to enhance content with AI')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const togglePlatform = (platformId: string) => {
    const isConnected = connectedAccounts.some(acc => acc.platform === platformId)
    if (!isConnected) {
      toast.error(`Please connect your ${platformId} account first`)
      return
    }
    
    const newPlatforms = postData.platforms.includes(platformId)
      ? postData.platforms.filter(p => p !== platformId)
      : [...postData.platforms, platformId]
    
    updatePostData({ platforms: newPlatforms })
  }

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace('#', '')
    if (tag && !postData.hashtags.includes(tag) && postData.hashtags.length < 30) {
      updatePostData({ hashtags: [...postData.hashtags, tag] })
      setHashtagInput('')
    }
  }

  const removeHashtag = (index: number) => {
    updatePostData({ hashtags: postData.hashtags.filter((_, i) => i !== index) })
  }

  const handleSchedulePost = async () => {
    const validationErrors = validateForm()
    setErrors(validationErrors)
    
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors before scheduling')
      return
    }

    setIsLoading(true)
    try {
      let scheduledFor = null
      if (!postData.publishNow && postData.scheduledDate) {
        scheduledFor = setMinutes(
          setHours(postData.scheduledDate, parseInt(postData.scheduledTime.split(':')[0])),
          parseInt(postData.scheduledTime.split(':')[1])
        ).toISOString()
      }

      const requestPayload = {
        title: postData.title,
        content: postData.content,
        platforms: postData.platforms,
        hashtags: postData.hashtags,
        mediaUrls: postData.mediaUrls,
        scheduledFor,
        publishNow: postData.publishNow,
        aiGenerated: postData.aiGenerated,
        aiPrompt: postData.aiPrompt
      }

      console.log('Sending request to schedule API:', requestPayload)

      const response = await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      let result
      try {
        const responseText = await response.text()
        console.log('Raw response:', responseText)
        
        if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
          throw new Error('Server returned HTML instead of JSON. This usually indicates a server error or missing API route.')
        }
        
        result = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError)
        throw new Error('Server returned invalid response format')
      }

      if (!response.ok) {
        console.error('API error response:', result)
        throw new Error(result.error || `Server error: ${response.status}`)
      }

      toast.success(result.message)
      
      if (onComplete) {
        onComplete(result.post)
      } else {
        router.push('/dashboard/posts')
      }

    } catch (error) {
      console.error('Error scheduling post:', error)
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to schedule post'
      if (error instanceof Error) {
        if (error.message.includes('HTML instead of JSON')) {
          errorMessage = 'Server configuration error. Please check if the database is properly set up.'
        } else if (error.message.includes('Failed to parse')) {
          errorMessage = 'Server response error. Please try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!postData.content.trim()) {
      toast.error('Content is required to save draft')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          platforms: postData.platforms,
          hashtags: postData.hashtags,
          mediaUrls: postData.mediaUrls,
          publishNow: false,
          scheduledFor: null,
          aiGenerated: postData.aiGenerated,
          aiPrompt: postData.aiPrompt
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save draft')
      }

      toast.success('Draft saved successfully!')
      
      if (onComplete) {
        onComplete(result.post)
      } else {
        router.push('/dashboard/posts')
      }

    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailablePlatforms = () => {
    return PLATFORMS.filter(platform => 
      connectedAccounts.some(account => account.platform === platform.id)
    )
  }

  const getScheduledDateTime = () => {
    if (!postData.scheduledDate) return null
    return setMinutes(
      setHours(postData.scheduledDate, parseInt(postData.scheduledTime.split(':')[0])),
      parseInt(postData.scheduledTime.split(':')[1])
    )
  }

  const getContentScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getContentScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Schedule Post
              </CardTitle>
              <CardDescription>
                Create and schedule your social media content
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getContentScoreColor(contentScore)}`}>
                  {contentScore}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getContentScoreLabel(contentScore)}
                </div>
              </div>
              {postData.aiGenerated && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Post Content</CardTitle>
                  <CardDescription>
                    Write your social media content
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={generateAIContent}
                  disabled={isGeneratingAI || !postData.content.trim()}
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enhance with AI
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Post Title (Optional)
                </label>
                <Input
                  placeholder="Give your post a descriptive title..."
                  value={postData.title}
                  onChange={(e) => updatePostData({ title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content *
                </label>
                <Textarea
                  placeholder="What's your message? Share your thoughts, insights, or updates..."
                  value={postData.content}
                  onChange={(e) => updatePostData({ content: e.target.value })}
                  className={cn(
                    "min-h-[150px]",
                    errors.content && "border-red-500"
                  )}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{postData.content.length} characters</span>
                  {errors.content && <span className="text-red-500">{errors.content}</span>}
                </div>
              </div>

              {/* Content Suggestions */}
              {postData.content.length > 0 && contentScore < 60 && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">Suggestions to improve your content:</div>
                      <ul className="text-sm space-y-1">
                        {!postData.content.includes('?') && !(/\b(click|visit|check|try|download|sign up|learn more|comment|share|like)\b/i.test(postData.content)) && (
                          <li>• Add a question or call-to-action to boost engagement</li>
                        )}
                        {!/[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27BF]/.test(postData.content) && (
                          <li>• Add emojis to make your content more engaging</li>
                        )}
                        {postData.content.length < 50 && (
                          <li>• Add more detail to provide value to your audience</li>
                        )}
                        {postData.hashtags.length < 3 && (
                          <li>• Add relevant hashtags to increase discoverability</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Selection</CardTitle>
              <CardDescription>
                Choose where to publish your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedAccounts.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No social media accounts connected. Please{' '}
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href="/dashboard/social-accounts">connect your accounts</a>
                    </Button>
                    {' '}first.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getAvailablePlatforms().map((platform) => {
                      const account = connectedAccounts.find(acc => acc.platform === platform.id)
                      const selected = postData.platforms.includes(platform.id)
                      const contentLength = postData.content.length
                      const exceedsLimit = contentLength > platform.maxLength
                      
                      return (
                        <div
                          key={platform.id}
                          className={cn(
                            "p-4 border-2 rounded-lg cursor-pointer transition-all",
                            selected && !exceedsLimit
                              ? "border-primary bg-primary/5"
                              : exceedsLimit
                              ? "border-red-300 bg-red-50"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => !exceedsLimit && togglePlatform(platform.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{platform.icon}</div>
                            <div className="flex-1">
                              <div className="font-medium">{platform.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{account?.username || 'Connected'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {contentLength}/{platform.maxLength} chars
                                {exceedsLimit && (
                                  <span className="text-red-500 ml-1">
                                    (Exceeds limit)
                                  </span>
                                )}
                              </div>
                            </div>
                            {selected && !exceedsLimit && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                            {exceedsLimit && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {postData.platforms.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Selected Platforms:</div>
                      <div className="flex flex-wrap gap-2">
                        {postData.platforms.map((platformId) => {
                          const platform = PLATFORMS.find(p => p.id === platformId)
                          return platform ? (
                            <Badge key={platformId} className={platform.color}>
                              {platform.icon} {platform.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {errors.platforms && (
                    <div className="text-red-500 text-sm mt-2">{errors.platforms}</div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimize Tab */}
        <TabsContent value="optimize" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Validation */}
            <ContentValidationPanel
              content={postData.content}
              hashtags={postData.hashtags}
              platforms={postData.platforms}
              mediaUrls={postData.mediaUrls}
              scheduledTime={postData.scheduledTime}
            />

            {/* Platform Best Practices */}
            <PlatformBestPracticesWidget
              selectedPlatforms={postData.platforms}
              content={postData.content}
              hashtags={postData.hashtags}
              mediaCount={postData.mediaUrls.length}
            />
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Scheduling Options
              </CardTitle>
              <CardDescription>
                Choose when to publish your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hashtag Manager */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hashtags ({postData.hashtags.length}/30)
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add hashtag (without #)"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    disabled={postData.hashtags.length >= 30}
                  />
                  <Button 
                    onClick={addHashtag} 
                    variant="outline"
                    disabled={!hashtagInput.trim() || postData.hashtags.length >= 30}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {postData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {postData.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <button
                          onClick={() => removeHashtag(index)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {errors.hashtags && (
                  <div className="text-red-500 text-sm mt-2">{errors.hashtags}</div>
                )}
              </div>

              {/* Content Optimization Score */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Content Optimization Score</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getContentScoreColor(contentScore)}`}>
                      {contentScore}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content Quality</span>
                    <span className={getContentScoreColor(contentScore)}>
                      {getContentScoreLabel(contentScore)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        contentScore >= 80 ? 'bg-green-500' :
                        contentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${contentScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Enhancement */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">AI Content Enhancement</h4>
                    <p className="text-sm text-muted-foreground">
                      Improve your content with AI suggestions
                    </p>
                  </div>
                  <Button
                    onClick={generateAIContent}
                    disabled={isGeneratingAI || !postData.content.trim()}
                    variant="outline"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enhance Content
                      </>
                    )}
                  </Button>
                </div>
                
                {!postData.content.trim() && (
                  <p className="text-sm text-muted-foreground">
                    Add some content first to use AI enhancement
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                  id="publish-now"
                  checked={postData.publishNow}
                  onCheckedChange={(checked) => updatePostData({ 
                    publishNow: !!checked,
                    scheduledDate: checked ? null : postData.scheduledDate
                  })}
                />
                <label htmlFor="publish-now" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              {!postData.publishNow && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Select Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full justify-start text-left",
                              !postData.scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {postData.scheduledDate ? (
                              format(postData.scheduledDate, 'PPP')
                            ) : (
                              'Pick a date'
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={postData.scheduledDate || undefined}
                            onSelect={(date) => updatePostData({ scheduledDate: date || null })}
                            disabled={(date) => isBefore(date, new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Select Time
                      </label>
                      <select
                        value={postData.scheduledTime}
                        onChange={(e) => updatePostData({ scheduledTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {OPTIMAL_TIMES.map((timeOption) => (
                          <option key={timeOption.time} value={timeOption.time}>
                            {timeOption.label} - {timeOption.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quick Schedule Options */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Quick Schedule
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: 'Tomorrow 9AM', date: addDays(new Date(), 1), time: '09:00' },
                        { label: 'Tomorrow 12PM', date: addDays(new Date(), 1), time: '12:00' },
                        { label: 'Tomorrow 7PM', date: addDays(new Date(), 1), time: '19:00' },
                        { label: 'Next Week', date: addDays(new Date(), 7), time: '09:00' }
                      ].map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => updatePostData({ 
                            scheduledDate: option.date,
                            scheduledTime: option.time,
                            publishNow: false
                          })}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {postData.scheduledDate && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Your post will be published on{' '}
                        <strong>
                          {format(getScheduledDateTime()!, 'PPP p')}
                        </strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {errors.schedule && (
                    <div className="text-red-500 text-sm">{errors.schedule}</div>
                  )}
                </div>
              )}

            {/* Content Optimization */}
            <ContentOptimizationWidget
              content={postData.content}
              hashtags={postData.hashtags}
              platforms={postData.platforms}
              mediaUrls={postData.mediaUrls}
              onOptimize={(optimizations) => {
                if (optimizations.enhancedContent) {
                  updatePostData({ content: optimizations.enhancedContent })
                }
                if (optimizations.suggestedHashtags) {
                  // Fix: Properly handle the Set conversion
                  const mergedHashtags = [...postData.hashtags, ...optimizations.suggestedHashtags]
                  const uniqueHashtags = Array.from(new Set(mergedHashtags))
                  updatePostData({ hashtags: uniqueHashtags })
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Final Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={isLoading || !postData.content.trim()}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            
            <Button
              onClick={handleSchedulePost}
              disabled={isLoading || Object.keys(validateForm()).length > 0}
              className="flex-1"
            >
              {isLoading ? (
                'Processing...'
              ) : postData.publishNow ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule Post
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}