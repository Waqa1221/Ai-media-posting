import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', { error, error_description })
      const errorMessage = error_description || error
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=linkedin_${error}&message=${encodeURIComponent(errorMessage)}`)
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?redirect=/dashboard/social-accounts`)
    }

    // Check if LinkedIn credentials are configured
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=linkedin_config&message=${encodeURIComponent('LinkedIn integration not configured. Please add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to your environment variables.')}`)
    }

    if (!code) {
      // Step 1: Redirect to LinkedIn OAuth
      const clientId = process.env.LINKEDIN_CLIENT_ID
      const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/linkedin`)
      const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social')
      const state = encodeURIComponent(user.id)

      const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`
      
      console.log('Redirecting to LinkedIn OAuth:', linkedinAuthUrl)
      return NextResponse.redirect(linkedinAuthUrl)
    }

    // Step 2: Exchange code for access token
    try {
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/linkedin`,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('LinkedIn token exchange failed:', errorText)
        throw new Error(`Token exchange failed: ${tokenResponse.status}`)
      }

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error)
      }

      const { access_token, expires_in } = tokenData

      // Get user profile
      const profileResponse = await fetch(
        'https://api.linkedin.com/v2/people/(id:~)?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }
      )

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text()
        console.error('LinkedIn profile fetch failed:', errorText)
        throw new Error('Failed to fetch LinkedIn profile')
      }

      const profileData = await profileResponse.json()

      if (profileData.error) {
        throw new Error(profileData.error.message || 'Failed to get LinkedIn profile data')
      }

      // Get email address
      const emailResponse = await fetch(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }
      )

      let emailAddress = null
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        emailAddress = emailData.elements?.[0]?.['handle~']?.emailAddress
      }

      const expiresAt = expires_in ? new Date(Date.now() + (expires_in * 1000)) : null
      const displayName = `${profileData.localizedFirstName} ${profileData.localizedLastName}`
      const profileImageUrl = profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier

      // Save to database using enhanced function
      const { data: accountData, error: dbError } = await supabase.rpc('connect_social_account', {
        p_user_id: user.id,
        p_platform: 'linkedin',
        p_platform_user_id: profileData.id,
        p_username: displayName.replace(' ', '').toLowerCase(),
        p_display_name: displayName,
        p_access_token: access_token,
        p_refresh_token: null, // LinkedIn doesn't provide refresh tokens
        p_expires_at: expiresAt?.toISOString(),
        p_avatar_url: profileImageUrl,
        p_platform_data: {
          email: emailAddress,
          first_name: profileData.localizedFirstName,
          last_name: profileData.localizedLastName,
          profile_url: `https://www.linkedin.com/in/${profileData.id}`
        },
        p_account_type: 'professional',
        p_follower_count: 0, // LinkedIn doesn't provide this in basic profile
        p_following_count: 0,
        p_permissions: {
          r_liteprofile: true,
          r_emailaddress: true,
          w_member_social: true
        },
        p_capabilities: {
          can_post: true,
          can_share: true,
          can_comment: true,
          can_view_profile: true
        },
        p_scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
      })

      if (dbError) {
        console.error('Database error saving LinkedIn account:', dbError)
        throw new Error('Failed to save LinkedIn account information')
      }

      // Success redirect
      const successMessage = `LinkedIn account ${displayName} connected successfully! You can now publish professional content to LinkedIn.`
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?connected=linkedin&message=${encodeURIComponent(successMessage)}`)
      
    } catch (tokenError) {
      console.error('LinkedIn OAuth error:', tokenError)
      
      let errorMessage = 'Failed to complete LinkedIn connection.'
      if (
        typeof tokenError === "object" &&
        tokenError !== null &&
        "message" in tokenError &&
        typeof (tokenError as { message?: unknown }).message === "string"
      ) {
        const msg = (tokenError as { message: string }).message
        if (msg.includes('invalid_client')) {
          errorMessage = 'LinkedIn app configuration is invalid. Please check your client ID and secret.'
        } else if (msg.includes('invalid_grant')) {
          errorMessage = 'LinkedIn authorization expired. Please try connecting again.'
        }
      }
      
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=linkedin_connection_failed&message=${encodeURIComponent(errorMessage)}`)
    }
  } catch (error) {
    console.error('LinkedIn auth general error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/social-accounts?error=linkedin_general&message=${encodeURIComponent('LinkedIn connection failed. Please try again.')}`)
  }
}