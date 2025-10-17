'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar as CalendarIcon, Sparkles } from 'lucide-react'
import { PostScheduler } from '@/components/scheduler/post-scheduler'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function SchedulerPage() {
  const [initialData, setInitialData] = useState<any>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for AI content in URL params
    const aiContent = searchParams.get('ai-content')
    if (aiContent) {
      try {
        const parsedContent = JSON.parse(decodeURIComponent(aiContent))
        setInitialData({
          content: parsedContent.caption || '',
          hashtags: parsedContent.hashtags || [],
          title: parsedContent.caption?.substring(0, 50) + '...' || '',
          aiGenerated: true,
          aiPrompt: JSON.stringify(parsedContent)
        })
      } catch (error) {
        console.error('Error parsing AI content:', error)
      }
    }
  }, [searchParams])

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/posts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Schedule Post
        </h1>
        <p className="text-muted-foreground mt-2">
          Create and schedule your social media content across platforms
        </p>

        {initialData?.aiGenerated && (
          <Alert className="mt-4">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              AI-generated content loaded! You can customize it before scheduling.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <PostScheduler 
        initialData={initialData}
        onComplete={(post) => {
          // Redirect to post detail page
          window.location.href = `/dashboard/posts/${post.id}`
        }}
        onCancel={() => {
          window.location.href = '/dashboard/posts'
        }}
      />
    </div>
  )
}