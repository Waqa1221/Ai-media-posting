import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InstagramPlatform } from '@/lib/social/platforms/instagram'

export async function POST(req: Request) {
  try {
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
        error: 'No Instagram account found' 
      }, { status: 404 })
    }

    const instagram = new InstagramPlatform(
      account.access_token,
      account.platform_user_id
    )

    try {
      // Refresh access token
      const newAccessToken = await instagram.refreshAccessToken()
      
      if (newAccessToken) {
        // Update token in database
        await supabase
          .from('social_accounts')
          .update({
            access_token: newAccessToken,
            expires_at: new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)).toISOString(), // 60 days
            updated_at: new Date().toISOString()
          })
          .eq('id', account.id)
      }

      // Get updated profile information
      const profile = await instagram.getProfile()
      
      // Update profile information
      await supabase
        .from('social_accounts')
        .update({
          username: profile.username,
          display_name: profile.displayName,
          metadata: {
            account_type: profile.accountType,
            media_count: profile.mediaCount
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', account.id)

      return NextResponse.json({
        success: true,
        message: 'Instagram account refreshed successfully',
        profile
      })

    } catch (refreshError) {
      console.error('Instagram refresh error:', refreshError)
      
      // If refresh fails, the token might be permanently expired
      let isTokenExpired = false;
      if (
        typeof refreshError === "object" &&
        refreshError !== null &&
        "response" in refreshError &&
        (refreshError as any).response?.status === 190
      ) {
        isTokenExpired = true;
      }

      if (isTokenExpired) {
        await supabase
          .from('social_accounts')
          .update({ 
            is_active: false,
            error_message: 'Access token expired - please reconnect'
          })
          .eq('id', account.id)

        return NextResponse.json({
          success: false,
          error: 'Instagram access token expired. Please reconnect your account.',
          requiresReconnection: true
        }, { status: 401 })
      }

      throw refreshError
    }

  } catch (error) {
    console.error('Instagram refresh API error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh Instagram account' },
      { status: 500 }
    )
  }
}