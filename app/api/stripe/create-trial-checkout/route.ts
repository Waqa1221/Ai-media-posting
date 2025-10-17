import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTrialCheckoutSession } from '@/lib/stripe/trial-server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user already has an active subscription or trial
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Prevent multiple trials/subscriptions
    if (profile.subscription_tier && ['trial', 'active', 'past_due'].includes(profile.subscription_tier)) {
      return NextResponse.json(
        { error: 'You already have an active subscription or trial' },
        { status: 400 }
      )
    }

    const session = await createTrialCheckoutSession({
      userId: user.id,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
    })

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    })

  } catch (error) {
    console.error('Error creating trial checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}