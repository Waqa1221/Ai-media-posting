import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PlatformClientFactory } from '@/lib/social/platform-clients'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('social_posts')
      .select(`
        *,
        social_accounts!inner(
          platform,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (platform) {
      query = query.eq('platform', platform)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching social posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch social posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Social posts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      social_account_id,
      platform,
      content,
      media_urls = [],
      hashtags = [],
      mentions = [],
      location,
      scheduled_for,
      publish_immediately = false,
      post_type = 'post',
      metadata = {}
    } = await request.json()

    // Validation
    if (!social_account_id || !platform || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: social_account_id, platform, content' },
        { status: 400 }
      )
    }

    // Verify social account ownership and status
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', social_account_id)
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('is_active', true)
      .eq('connection_status', 'connected')
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Social account not found, inactive, or not connected' },
        { status: 404 }
      )
    }

    // Validate content length based on platform
    const platformRequirements = PlatformClientFactory.getPlatformRequirements(platform)
    if (platformRequirements && content.length > platformRequirements.maxTextLength) {
      return NextResponse.json(
        { error: `Content exceeds maximum length of ${platformRequirements.maxTextLength} characters for ${platform}` },
        { status: 400 }
      )
    }

    // Validate media requirements
    if (platformRequirements?.requiresMedia && (!media_urls || media_urls.length === 0)) {
      return NextResponse.json(
        { error: `${platform} requires at least one media file` },
        { status: 400 }
      )
    }

    let status = 'draft'
    let publishedAt = null
    let platformPostId = null
    let platformPostUrl = null
    let errorMessage = null

    // Handle immediate publishing
    if (publish_immediately) {
      try {
        const platformClient = PlatformClientFactory.createClient(platform, account.access_token)
        const publishResult = await platformClient.publishPost(content, media_urls, metadata)

        if (publishResult.success) {
          status = 'published'
          publishedAt = new Date().toISOString()
          platformPostId = publishResult.platformPostId
          platformPostUrl = publishResult.platformPostUrl
        } else {
          status = 'failed'
          errorMessage = publishResult.error
        }
      } catch (publishError) {
        console.error('Publishing error:', publishError)
        status = 'failed'
        let errorMessageText = "Publishing failed"
        if (
          typeof publishError === "object" &&
          publishError !== null &&
          "message" in publishError
        ) {
          errorMessageText = String((publishError as { message?: string }).message)
        }
        errorMessage = errorMessageText
      }
    } else if (scheduled_for) {
      const scheduledDate = new Date(scheduled_for)
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }
      status = 'scheduled'
    }

    // Create the post
    const { data: newPost, error: insertError } = await supabase
      .from('social_posts')
      .insert({
        user_id: user.id,
        social_account_id,
        platform: platform as any,
        content,
        media_urls,
        hashtags,
        mentions,
        location,
        status: status as any,
        scheduled_for,
        published_at: publishedAt,
        platform_post_id: platformPostId,
        platform_post_url: platformPostUrl,
        error_message: errorMessage,
        post_type,
        metadata
      })
      .select(`
        *,
        social_accounts!inner(
          platform,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error('Error creating social post:', insertError)
      return NextResponse.json(
        { error: 'Failed to create social post' },
        { status: 500 }
      )
    }

    return NextResponse.json(newPost, { status: 201 })

  } catch (error) {
    console.error('Social post creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}