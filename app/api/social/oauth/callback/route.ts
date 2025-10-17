import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OAuthManager } from '@/lib/social/oauth-manager'
import { PlatformClientFactory } from '@/lib/social/platform-clients'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', { error, errorDescription })
      const redirectUri = '/dashboard/social-accounts'
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}${redirectUri}?error=${error}&message=${encodeURIComponent(errorDescription || error)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=missing_params&message=${encodeURIComponent('Missing authorization code or state')}`
      )
    }

    // Parse state parameter
    const [stateToken, platform, encodedRedirectUri] = state.split(':')
    const redirectUri = decodeURIComponent(encodedRedirectUri)

    if (!stateToken || !platform) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=invalid_state&message=${encodeURIComponent('Invalid state parameter')}`
      )
    }

    const supabase = await createClient()
    const oauthManager = new OAuthManager()

    // Validate OAuth state
    const validatedState = await oauthManager.validateState(stateToken, platform)
    if (!validatedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=invalid_state&message=${encodeURIComponent('Invalid or expired OAuth state')}`
      )
    }

    // Exchange code for tokens
    const tokenResponse = await oauthManager.exchangeCodeForToken(
      platform,
      code,
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/social/oauth/callback`,
      validatedState.codeVerifier
    )

    // Get user profile from the platform
    const platformClient = PlatformClientFactory.createClient(platform, tokenResponse.accessToken)
    const profile = await platformClient.getProfile()

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', validatedState.userId)
      .eq('platform', platform)
      .eq('platform_user_id', profile.platformUserId)
      .single()

    const accountData = {
      user_id: validatedState.userId,
      platform: platform as any,
      platform_user_id: profile.platformUserId,
      username: profile.username,
      display_name: profile.displayName,
      email: profile.email,
      avatar_url: profile.avatarUrl,
      profile_url: profile.profileUrl,
      access_token: tokenResponse.accessToken,
      refresh_token: tokenResponse.refreshToken,
      token_type: tokenResponse.tokenType || 'Bearer',
      expires_at: tokenResponse.expiresAt?.toISOString(),
      scope: tokenResponse.scope || validatedState.scopes,
      connection_status: 'connected' as any,
      is_active: true,
      last_sync_at: new Date().toISOString(),
      platform_data: profile.platformData || {},
      account_type: profile.accountType,
      follower_count: profile.followerCount || 0,
      following_count: profile.followingCount || 0,
      posts_count: profile.postsCount || 0
    }

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update(accountData)
        .eq('id', existingAccount.id)

      if (updateError) {
        console.error('Error updating social account:', updateError)
        throw new Error('Failed to update social account')
      }
    } else {
      // Create new account
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert(accountData)

      if (insertError) {
        console.error('Error creating social account:', insertError)
        throw new Error('Failed to create social account')
      }
    }

    // Success redirect
    const successMessage = `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully!`
    return NextResponse.redirect(
      `${redirectUri}?success=true&platform=${platform}&message=${encodeURIComponent(successMessage)}`
    )

  } catch (error) {
    console.error('OAuth callback error:', error)
    const redirectUri = '/dashboard/social-accounts'
    const errorMessage = error instanceof Error ? error.message : 'OAuth connection failed'
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}${redirectUri}?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}