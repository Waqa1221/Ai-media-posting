import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const error_reason = searchParams.get('error_reason')
    const error_description = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('Instagram OAuth error:', { error, error_reason, error_description })
      const errorMessage = error_description || error_reason || error
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_${error}&message=${encodeURIComponent(errorMessage)}`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_no_code&message=${encodeURIComponent('Authorization code or state parameter missing')}`)
    }

    // Validate state parameter and extract user ID
    const [stateParam, userId] = state.split('_')
    if (!stateParam || !userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_invalid_state&message=${encodeURIComponent('Invalid state parameter')}`)
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?redirect=/dashboard/social-accounts`)
    }

    try {
      // Step 1: Exchange code for access token
      const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`
      
      const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.INSTAGRAM_CLIENT_ID!,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Facebook token exchange failed:', errorText)
        throw new Error(`Token exchange failed: ${tokenResponse.status}`)
      }

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        throw new Error(tokenData.error.message || tokenData.error)
      }

      // Step 2: Get user's Facebook pages (required for Instagram Business accounts)
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
      )
      
      if (!pagesResponse.ok) {
        throw new Error('Failed to fetch Facebook pages')
      }
      
      const pagesData = await pagesResponse.json()

      if (!pagesData.data || pagesData.data.length === 0) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_no_pages&message=${encodeURIComponent('No Facebook pages found. Please create a Facebook page and connect it to your Instagram Business account.')}`)
      }

      // Step 3: Find Instagram account connected to Facebook page
      let instagramAccount = null
      let pageAccessToken = null

      for (const page of pagesData.data) {
        try {
          const instagramResponse = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
          )
          
          if (instagramResponse.ok) {
            const instagramData = await instagramResponse.json()
            if (instagramData.instagram_business_account) {
              instagramAccount = instagramData.instagram_business_account
              pageAccessToken = page.access_token
              break
            }
          }
        } catch (error) {
          console.warn(`Failed to check Instagram account for page ${page.id}:`, error)
        }
      }

      if (!instagramAccount || !pageAccessToken) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_no_business&message=${encodeURIComponent('No Instagram Business account found. Please convert your Instagram account to a Business account and connect it to a Facebook page.')}`)
      }

      // Step 4: Get Instagram account details
      const profileResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccount.id}?fields=id,username,name,profile_picture_url,followers_count,media_count,account_type&access_token=${pageAccessToken}`
      )
      
      if (!profileResponse.ok) {
        const errorText = await profileResponse.text()
        console.error('Instagram profile fetch failed:', errorText)
        throw new Error('Failed to fetch Instagram profile')
      }
      
      const profileData = await profileResponse.json()

      if (profileData.error) {
        throw new Error(profileData.error.message || 'Failed to get Instagram profile data')
      }

      // Step 5: Save to database using the enhanced function
      const { data: accountData, error: dbError } = await supabase.rpc('connect_social_account', {
        p_user_id: user.id,
        p_platform: 'instagram',
        p_platform_user_id: profileData.id,
        p_username: profileData.username,
        p_display_name: profileData.name || profileData.username,
        p_access_token: pageAccessToken,
        p_refresh_token: null,
        p_expires_at: null, // Facebook page tokens don't expire
        p_avatar_url: profileData.profile_picture_url,
        p_platform_data: {
          account_type: profileData.account_type || 'BUSINESS',
          media_count: profileData.media_count || 0,
          page_id: pagesData.data[0].id,
          page_name: pagesData.data[0].name
        },
        p_account_type: profileData.account_type || 'BUSINESS',
        p_follower_count: profileData.followers_count || 0,
        p_following_count: 0,
        p_permissions: {
          instagram_basic: true,
          instagram_content_publish: true,
          pages_show_list: true,
          pages_read_engagement: true
        },
        p_capabilities: {
          can_publish_feed: true,
          can_publish_stories: true,
          can_publish_reels: true,
          can_view_insights: true
        },
        p_scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement']
      })

      if (dbError) {
        console.error('Database error saving Instagram account:', dbError)
        throw new Error('Failed to save Instagram account information')
      }

      // Success redirect
      const successMessage = `Instagram Business account @${profileData.username} connected successfully! You can now publish content to Instagram.`
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?connected=instagram&message=${encodeURIComponent(successMessage)}`)
      
    } catch (tokenError) {
      console.error('Instagram connection error:', tokenError)
      const errorMsg =
        typeof tokenError === "object" && tokenError !== null && "message" in tokenError
          ? String((tokenError as { message?: string }).message)
          : "Instagram connection failed";
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_connection&message=${encodeURIComponent(errorMsg)}`
      )
    }
  } catch (error) {
    console.error('Instagram OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_general&message=${encodeURIComponent('Instagram connection failed. Please try again.')}`)
  }
}