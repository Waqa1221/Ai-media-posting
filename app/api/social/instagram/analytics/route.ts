import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InstagramPlatform } from '@/lib/social/platforms/instagram'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    const timeframe = searchParams.get('timeframe') || '7d'

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

    const instagram = new InstagramPlatform(
      account.access_token,
      account.platform_user_id
    )

    if (postId) {
      // Get analytics for specific post
      const analytics = await instagram.getAnalytics(postId)
      return NextResponse.json({ analytics })
    } else {
      // Get account insights
      try {
        const accountInsights = await instagram.getAccountInsights(timeframe)
        return NextResponse.json({ insights: accountInsights })
      } catch (error) {
        console.error('Instagram insights error:', error)
        return NextResponse.json({ 
          insights: {
            impressions: 0,
            reach: 0,
            profile_views: 0,
            website_clicks: 0,
            follower_count: 0
          }
        })
      }
    }

  } catch (error) {
    console.error('Instagram analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Instagram analytics' },
      { status: 500 }
    )
  }
}