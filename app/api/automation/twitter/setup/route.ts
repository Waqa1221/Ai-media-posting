import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { twitterAutomation } from '@/lib/automation/twitter-automation'

export async function POST(req: Request) {
  try {
    const { ruleType, settings } = await req.json()
    
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

    // Check if user has Twitter account connected
    const { data: twitterAccount, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .eq('is_active', true)
      .single()

    if (accountError || !twitterAccount) {
      return NextResponse.json(
        { error: 'Please connect your Twitter account first' },
        { status: 400 }
      )
    }

    let ruleId: string

    switch (ruleType) {
      case 'daily_motivation':
        ruleId = await twitterAutomation.createDailyMotivationRule(user.id)
        break
        
      case 'engagement_booster':
        const hashtags = settings.hashtags || ['#marketing', '#business']
        ruleId = await twitterAutomation.createEngagementBoosterRule(user.id, hashtags)
        break
        
      default:
        return NextResponse.json(
          { error: 'Unknown automation rule type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      ruleId,
      message: 'Twitter automation rule created successfully'
    })

  } catch (error) {
    console.error('Twitter automation setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup Twitter automation' },
      { status: 500 }
    )
  }
}