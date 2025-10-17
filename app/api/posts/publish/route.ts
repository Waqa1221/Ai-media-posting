import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishToSocialPlatform } from '@/lib/social/publisher'

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

    const results = []
    const errors = []
    const platformsToPublish = platforms || post.platforms || []

    if (publishNow) {
      // Publish immediately
      for (const platform of platformsToPublish) {
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
      }

      // Update post status based on results
      const hasSuccessfulPublications = results.some(r => r.success)
      await supabase
        .from('posts')
        .update({ 
          status: hasSuccessfulPublications ? 'published' : 'failed',
          published_at: hasSuccessfulPublications ? new Date().toISOString() : null,
          error_message: errors.length > 0 ? errors.join('; ') : null
        })
        .eq('id', postId)

    } else if (post.scheduled_for) {
      // Schedule for later
      for (const platform of platformsToPublish) {
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
      // Update post status
      await supabase
        .from('posts')
        .update({ status: 'scheduled' })
        .eq('id', postId)
    }

    return NextResponse.json({ 
      success: results.length > 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error publishing post:', error)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }
}