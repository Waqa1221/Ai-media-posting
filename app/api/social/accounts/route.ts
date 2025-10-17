import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
      .from('social_accounts')
      .select(`
        *,
        social_platforms!inner(
          display_name,
          description,
          max_post_length,
          supports_media,
          supports_scheduling
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
      query = query.eq('connection_status', 'connected')
    }

    const { data: accounts, error } = await query

    if (error) {
      console.error('Error fetching social accounts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch social accounts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      accounts: accounts || [],
      total: accounts?.length || 0
    })

  } catch (error) {
    console.error('Social accounts API error:', error)
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

    const { platform, redirect_uri } = await request.json()

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    // Check if platform is supported
    const { data: platformConfig, error: configError } = await supabase
      .from('social_platforms')
      .select('platform_name')
      .eq('platform_name', platform)
      .eq('is_active', true)
      .single()

    if (configError || !platformConfig) {
      return NextResponse.json(
        { error: `Platform ${platform} is not supported or not active` },
        { status: 400 }
      )
    }

    // Generate OAuth URL
    const oauthUrl = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/social/oauth/initiate`)
    oauthUrl.searchParams.set('platform', platform)
    if (redirect_uri) {
      oauthUrl.searchParams.set('redirect_uri', redirect_uri)
    }

    return NextResponse.json({
      oauth_url: oauthUrl.toString(),
      platform,
      message: 'OAuth URL generated successfully'
    })

  } catch (error) {
    console.error('Social account creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}