import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/trial-server'

export async function POST(req: Request) {
  try {
    const { cancelImmediately = false } = await req.json()
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    if (cancelImmediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    return NextResponse.json({ 
      success: true,
      message: cancelImmediately 
        ? 'Subscription canceled immediately' 
        : 'Subscription will cancel at the end of the current period'
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}