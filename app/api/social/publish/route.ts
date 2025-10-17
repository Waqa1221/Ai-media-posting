import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishToSocialPlatform } from '@/lib/social/publisher'
import { PlatformFactory } from '@/lib/social/platform-factory'

export async function POST(req: Request) {
  try {
    const { postId, platforms, publishNow } = await req.json()
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Validate platforms
    const supportedPlatforms = PlatformFactory.getSupportedPlatforms()
    const invalidPlatforms = platforms.filter((p: string) => !supportedPlatforms.includes(p))
    
    if (invalidPlatforms.length > 0) {
      return NextResponse.json({ 
        error: `Unsupported platforms: ${invalidPlatforms.join(', ')}` 
      }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const platform of platforms) {
      try {
        // Check if user has connected account for this platform
        const { data: account, error: accountError } = await supabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', platform)
          .eq('is_active', true)
          .single()

        if (accountError || !account) {
          errors.push(`No connected ${platform} account`)
          continue
        }

        // Validate content for platform
        const requirements = PlatformFactory.getPlatformRequirements(platform)
        if (requirements) {
          if (requirements.requiresMedia && (!post.media_urls || post.media_urls.length === 0)) {
            errors.push(`${platform} requires media files`)
            continue
          }
          
          if (post.content.length > requirements.maxTextLength) {
            errors.push(`Content too long for ${platform} (max ${requirements.maxTextLength} characters)`)
            continue
          }
        }

        if (publishNow) {
          // Publish immediately
          const result = await publishToSocialPlatform({
            userId: user.id,
            platform,
            content: post.content,
            mediaUrls: post.media_urls,
            postId: post.id
          })

          results.push({
            platform,
            success: result.success,
            platformPostId: result.platformPostId,
            url: result.url,
            error: result.error
          })

          if (!result.success) {
            errors.push(`${platform}: ${result.error}`)
          }
        } else if (post.scheduled_for) {
          // Add to scheduling queue
          await supabase
            .from('scheduling_queue')
            .insert({
              post_id: post.id,
              user_id: user.id,
              platform,
              scheduled_for: post.scheduled_for,
              status: 'pending'
            })

          results.push({
            platform,
            success: true,
            scheduled: true
          })
        }
      } catch (error) {
        console.error(`Error processing ${platform}:`, error)
        errors.push(`${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Update post status
    const hasSuccessfulPublications = results.some(r => r.success && !r.scheduled)
    const hasScheduledPublications = results.some(r => r.scheduled)
    
    let newStatus = post.status
    if (hasSuccessfulPublications) {
      newStatus = 'published'
    } else if (hasScheduledPublications) {
      newStatus = 'scheduled'
    } else if (errors.length > 0) {
      newStatus = 'failed'
    }

    await supabase
      .from('posts')
      .update({
        status: newStatus,
        published_at: hasSuccessfulPublications ? new Date().toISOString() : null,
        error_message: errors.length > 0 ? errors.join('; ') : null
      })
      .eq('id', postId)

    return NextResponse.json({
      success: results.length > 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Publish API error:', error)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }
}