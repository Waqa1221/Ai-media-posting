import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiContentGenerator } from '@/lib/ai/generator'
import { schedulePost } from '@/lib/queue/client'
import { checkUsageLimit, incrementUsage } from '@/lib/stripe/server'

export async function POST(req: Request) {
  try {
    const {
      brief,
      platforms,
      scheduledFor,
      publishNow = false,
      model = 'gpt-3.5-turbo'
    } = await req.json()

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!brief || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content brief and platforms are required' },
        { status: 400 }
      )
    }

    // Check usage limits
    const canGenerate = await checkUsageLimit(user.id, 'ai_generations_per_month', supabase)
    if (!canGenerate) {
      return NextResponse.json(
        { error: 'AI generation limit exceeded. Please upgrade your plan.' },
        { status: 429 }
      )
    }

    const canCreatePost = await checkUsageLimit(user.id, 'posts_per_month', supabase)
    if (!canCreatePost) {
      return NextResponse.json(
        { error: 'Monthly post limit exceeded. Please upgrade your plan.' },
        { status: 429 }
      )
    }

    // Generate AI content
    const aiResult = await aiContentGenerator.generateContent({
      brief,
      userId: user.id,
      model,
      useCache: true,
      supabase
    })

    // Determine post status
    let status = 'draft'
    let finalScheduledFor = null

    if (publishNow) {
      status = 'published'
    } else if (scheduledFor) {
      status = 'scheduled'
      finalScheduledFor = scheduledFor
    }

    // Create the post
    const postData = {
      user_id: user.id,
      title: aiResult.content.caption?.substring(0, 50) + '...' || 'AI Generated Post',
      content: aiResult.content.caption || '',
      platforms,
      hashtags: aiResult.content.hashtags || [],
      media_urls: aiResult.content.generated_images || [],
      status,
      scheduled_for: finalScheduledFor,
      published_at: publishNow ? new Date().toISOString() : null,
      ai_generated: true,
      ai_prompt: JSON.stringify({
        brief,
        model,
        generation_id: aiResult.generationId,
        generated_at: new Date().toISOString()
      })
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (postError) {
      console.error('Error creating post:', postError)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Handle scheduling or immediate publishing
    if (status === 'scheduled' && finalScheduledFor) {
      // Add to scheduling queue
      for (const platform of platforms) {
        try {
          await schedulePost({
            postId: post.id,
            userId: user.id,
            platform,
            content: aiResult.content.caption || '',
            mediaUrls: aiResult.content.generated_images || [],
            scheduledFor: finalScheduledFor
          })

          await supabase
            .from('scheduling_queue')
            .insert({
              post_id: post.id,
              user_id: user.id,
              platform,
              scheduled_for: finalScheduledFor,
              status: 'pending'
            })
        } catch (error) {
          console.error(`Error scheduling for ${platform}:`, error)
        }
      }
    }

    // Update usage limits
    await incrementUsage(user.id, 'posts_per_month', supabase)

    const message = publishNow 
      ? 'AI post published successfully!'
      : status === 'scheduled'
      ? `AI post scheduled for ${new Date(finalScheduledFor).toLocaleString()}`
      : 'AI post saved as draft!'

    return NextResponse.json({
      success: true,
      post,
      aiResult,
      message
    })

  } catch (error) {
    console.error('Schedule AI post API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}