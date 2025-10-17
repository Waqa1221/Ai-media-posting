import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?redirect=/dashboard/social-accounts`)
    }

    // Check if Instagram credentials are configured
    if (!process.env.INSTAGRAM_CLIENT_ID || !process.env.INSTAGRAM_CLIENT_SECRET) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_config&message=${encodeURIComponent('Instagram integration not configured. Please add INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET to your environment variables.')}`)
    }

    // Validate credentials are not placeholder values
    if (process.env.INSTAGRAM_CLIENT_ID === 'your_instagram_client_id' || 
        process.env.INSTAGRAM_CLIENT_SECRET === 'your_instagram_client_secret') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_placeholder&message=${encodeURIComponent('Instagram credentials are using placeholder values. Please update with actual Facebook App credentials.')}`)
    }

    // Generate secure state parameter
    const stateParam = crypto.randomUUID()
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`
    
    // Store state in session for security (in production, use Redis or database)
    // For now, we'll include user ID in state for validation
    const secureState = `${stateParam}_${user.id}`
    
    // Build Instagram OAuth URL (using Facebook's OAuth since Instagram uses Facebook's system)
    const instagramAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    instagramAuthUrl.searchParams.set('client_id', process.env.INSTAGRAM_CLIENT_ID)
    instagramAuthUrl.searchParams.set('redirect_uri', redirectUri)
    instagramAuthUrl.searchParams.set('scope', 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement')
    instagramAuthUrl.searchParams.set('response_type', 'code')
    instagramAuthUrl.searchParams.set('state', secureState)
    
    console.log('Redirecting to Instagram OAuth:', instagramAuthUrl.toString())
    return NextResponse.redirect(instagramAuthUrl.toString())
    
  } catch (error) {
    console.error('Instagram OAuth initiation error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=instagram_general&message=${encodeURIComponent('Failed to initiate Instagram connection. Please try again.')}`)
  }
}