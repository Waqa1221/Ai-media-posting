import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InstagramPlatform } from '@/lib/social/platforms/instagram'

export async function POST(req: Request) {
  try {
    const { 
      content, 
      mediaUrls, 
      hashtags = [],
      location,
      postType = 'feed'
    } = await req.json()

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Instagram account
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ 
        error: 'No Instagram account connected' 
      }, { status: 400 })
    }

    // Validate content for Instagram
    if (postType === 'feed' && (!mediaUrls || mediaUrls.length === 0)) {
      return NextResponse.json({ 
        error: 'Instagram feed posts require at least one image or video' 
      }, { status: 400 })
    }

    if (content.length > 2200) {
      return NextResponse.json({ 
        error: 'Instagram caption cannot exceed 2,200 characters' 
      }, { status: 400 })
    }

    if (hashtags.length > 30) {
      return NextResponse.json({ 
        error: 'Instagram allows maximum 30 hashtags per post' 
      }, { status: 400 })
    }

    // Create Instagram platform instance
    const instagram = new InstagramPlatform(
      account.access_token,
      account.platform_user_id
    )

    // Prepare content with hashtags
    const fullContent = content + (hashtags.length > 0 ? '\n\n' + hashtags.map((tag: string) => `#${tag}`).join(' ') : '')

    // Publish to Instagram
    const result = await instagram.publishPost(fullContent, mediaUrls)

    if (result.success) {
      // Store publication record
      await supabase
        .from('post_publications')
        .insert({
          user_id: user.id,
          platform: 'instagram',
          platform_post_id: result.platformPostId,
          platform_url: result.url,
          content: fullContent,
          media_urls: mediaUrls,
          published_at: new Date().toISOString(),
          status: 'published',
          post_type: postType,
          location: location || null
        })

      return NextResponse.json({
        success: true,
        platformPostId: result.platformPostId,
        url: result.url,
        message: 'Posted to Instagram successfully!'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to publish to Instagram'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Instagram publish API error:', error)
    return NextResponse.json(
      { error: 'Failed to publish to Instagram' },
      { status: 500 }
    )
  }
}