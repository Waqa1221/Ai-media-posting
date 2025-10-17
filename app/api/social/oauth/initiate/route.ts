import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OAuthManager } from '@/lib/social/oauth-manager'

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
    const redirectUri = searchParams.get('redirect_uri') || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts`

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      )
    }

    // Get platform configuration
    const { data: platformConfig, error: configError } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('platform_name', platform)
      .eq('is_active', true)
      .single()

    if (configError || !platformConfig) {
      return NextResponse.json(
        { error: `Platform ${platform} not found or not active` },
        { status: 404 }
      )
    }

    const oauthManager = new OAuthManager()
    
    // Get client IP and user agent for security
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Generate OAuth state with PKCE
    const { stateToken, codeChallenge } = await oauthManager.generateState(
      user.id,
      platform,
      redirectUri,
      platformConfig.default_scopes,
      true, // Use PKCE
      ipAddress,
      userAgent
    )

    // Build authorization URL
    const authUrl = new URL(platformConfig.oauth_authorize_url)
    authUrl.searchParams.set('client_id', platformConfig.client_id)
    authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_SITE_URL}/api/social/oauth/callback`)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', platformConfig.default_scopes.join(' '))
    authUrl.searchParams.set('state', `${stateToken}:${platform}:${encodeURIComponent(redirectUri)}`)
    
    if (codeChallenge) {
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')
    }

    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}