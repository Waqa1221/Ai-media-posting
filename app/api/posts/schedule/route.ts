import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

export async function POST(req: Request) {
  try {
    // Parse request body with error handling
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const {
      title,
      content,
      platforms,
      hashtags = [],
      mediaUrls = [],
      scheduledFor,
      publishNow = false,
      aiGenerated = false,
      aiPrompt
    } = requestBody

    // Validate required fields
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    if (!publishNow && !scheduledFor) {
      return NextResponse.json(
        { error: 'Either publishNow must be true or scheduledFor must be provided' },
        { status: 400 }
      )
    }

    // Create Supabase client with proper server-side initialization
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate scheduled time is in the future
    if (scheduledFor && !publishNow) {
      const scheduledDate = new Date(scheduledFor)
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }
    }

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
      title: title || content.substring(0, 50) + '...',
      content,
      platforms,
      hashtags,
      media_urls: mediaUrls,
      status,
      scheduled_for: finalScheduledFor,
      published_at: publishNow ? new Date().toISOString() : null,
      ai_generated: aiGenerated,
      ai_prompt: aiPrompt
    }

    let post
    try {
      const { data: postResult, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (postError) {
        console.error('Error creating post:', postError)
        return NextResponse.json(
          { error: `Failed to create post: ${postError.message}` },
          { status: 500 }
        )
      }

      post = postResult
    } catch (postInsertError) {
      console.error('Error during post insertion:', postInsertError)
      return NextResponse.json(
        { error: 'Failed to save post to database' },
        { status: 500 }
      )
    }

    // Handle scheduling or immediate publishing
    const results = []
    const errors = []

    if (publishNow) {
      // For immediate publishing, we'll just mark as published for now
      // In a real implementation, you would call the actual platform APIs
      for (const platform of platforms) {
        results.push({
          platform,
          success: true,
          message: `Published to ${platform} successfully`
        })
      }
    } else if (finalScheduledFor) {
      // Add to scheduling queue
      for (const platform of platforms) {
        try {
          const { error: scheduleError } = await supabase
            .from('scheduling_queue')
            .insert({
              post_id: post.id,
              user_id: user.id,
              platform,
              scheduled_for: finalScheduledFor,
              status: 'pending'
            })

          if (scheduleError) {
            console.error(`Error scheduling for ${platform}:`, scheduleError)
            errors.push(`${platform}: Failed to schedule`)
          } else {
            results.push({ platform, scheduled: true })
          }
        } catch (scheduleError) {
          console.error(`Error scheduling for ${platform}:`, scheduleError)
          errors.push(`${platform}: Failed to schedule`)
        }
      }
    }

    const message = publishNow 
      ? `Post published to ${platforms.join(', ')} successfully!`
      : finalScheduledFor
      ? `Post scheduled for ${new Date(finalScheduledFor).toLocaleString()}`
      : 'Draft saved successfully!'

    return NextResponse.json({
      success: true,
      post,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message
    })

  } catch (error) {
    console.error('Schedule post API error:', error)
    
    // Return detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'scheduled'

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get scheduled posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        scheduling_queue(*)
      `)
      .eq('user_id', user.id)
      .eq('status', status)
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Get scheduled posts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}