import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get trial info directly from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, trial_ends_at, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isInTrial = profile.subscription_tier === 'trial'
    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
    const daysRemaining = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

    const trialInfo = {
      isInTrial,
      trialEndsAt,
      daysRemaining: Math.max(0, daysRemaining),
      subscriptionStatus: profile.subscription_status
    }
    
    if (!trialInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(trialInfo)

  } catch (error) {
    console.error('Error fetching trial status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}