import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { TwitterPlatform } from '@/lib/social/platforms/twitter'

export async function POST(req: Request) {
  try {
    const { content } = await req.json()
    
    // Get cookies and create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Twitter account
    const { data: twitterAccount, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .eq('is_active', true)
      .single()

    if (accountError || !twitterAccount) {
      return NextResponse.json(
        { error: 'No Twitter account connected' },
        { status: 400 }
      )
    }

    // Test Twitter API connection
    const twitter = new TwitterPlatform(
      twitterAccount.access_token,
      twitterAccount.refresh_token || ''
    )

    // Test with profile fetch first
    try {
      const profile = await twitter.getProfile()
      console.log('Twitter profile test successful:', profile)
    } catch (error) {
      console.error('Twitter profile test failed:', error)
      return NextResponse.json(
        { error: 'Failed to connect to Twitter API. Please reconnect your account.' },
        { status: 400 }
      )
    }

    // If content provided, test posting (but don't actually post)
    if (content) {
      if (content.length > 280) {
        return NextResponse.json(
          { error: 'Content exceeds Twitter character limit (280)' },
          { status: 400 }
        )
      }

      // Simulate posting without actually posting
      return NextResponse.json({
        success: true,
        message: 'Twitter integration test successful',
        preview: {
          content: content,
          platform: 'twitter',
          characterCount: content.length,
          characterLimit: 280
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Twitter API connection successful',
      account: {
        username: twitterAccount.username,
        platform: 'twitter'
      }
    })

  } catch (error) {
    console.error('Twitter test error:', error)
    return NextResponse.json(
      { error: 'Twitter integration test failed' },
      { status: 500 }
    )
  }
}