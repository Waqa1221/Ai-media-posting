import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { schedulePost } from '@/lib/queue/client'

export async function POST(req: Request) {
  try {
    const { posts } = await req.json()

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: 'Posts array is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const results = []
    const errors = []

    for (const postData of posts) {
      try {
        // Validate each post
        if (!postData.content?.trim()) {
          errors.push(`Post ${postData.title || 'Untitled'}: Content is required`)
          continue
        }

        if (!postData.platforms || postData.platforms.length === 0) {
          errors.push(`Post ${postData.title || 'Untitled'}: At least one platform required`)
          continue
        }

        if (!postData.scheduledFor) {
          errors.push(`Post ${postData.title || 'Untitled'}: Scheduled time is required`)
          continue
        }

        // Create the post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            title: postData.title || postData.content.substring(0, 50) + '...',
            content: postData.content,
            platforms: postData.platforms,
            hashtags: postData.hashtags || [],
            media_urls: postData.mediaUrls || [],
            status: 'scheduled',
            scheduled_for: postData.scheduledFor,
            ai_generated: postData.aiGenerated || false
          })
          .select()
          .single()

        if (postError) {
          errors.push(`Post ${postData.title || 'Untitled'}: ${postError.message}`)
          continue
        }

        // Schedule for each platform
        for (const platform of postData.platforms) {
          try {
            await schedulePost({
              postId: post.id,
              userId: user.id,
              platform,
              content: postData.content,
              mediaUrls: postData.mediaUrls || [],
              scheduledFor: postData.scheduledFor
            })

            await supabase
              .from('scheduling_queue')
              .insert({
                post_id: post.id,
                user_id: user.id,
                platform,
                scheduled_for: postData.scheduledFor,
                status: 'pending'
              })
          } catch (error) {
            console.error(`Error scheduling ${platform}:`, error)
          }
        }

        results.push({
          post,
          platforms: postData.platforms,
          scheduledFor: postData.scheduledFor
        })

      } catch (error) {
        console.error('Error processing post:', error)
        errors.push(`Post ${postData.title || 'Untitled'}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      scheduled: results.length,
      errors: errors.length > 0 ? errors : undefined,
      results
    })

  } catch (error) {
    console.error('Bulk schedule API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}