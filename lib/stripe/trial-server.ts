import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { TRIAL_CONFIG } from './trial-config'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

/**
 * Create a checkout session with 7-day free trial
 */
export async function createTrialCheckoutSession({
  userId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  const supabase = createClient()
  
  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new Error('User not found')
  }

  let customerId = profile.stripe_customer_id

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: profile.full_name || undefined,
      metadata: {
        userId: userId,
      },
    })
    
    customerId = customer.id
    
    // Update profile with customer ID
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)
  }

  // Create checkout session with trial
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: TRIAL_CONFIG.priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: TRIAL_CONFIG.trialDays,
      metadata: {
        userId: userId,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId,
    },
    allow_promotion_codes: TRIAL_CONFIG.trialSettings.allowPromotionCodes,
    billing_address_collection: TRIAL_CONFIG.trialSettings.billingAddressCollection,
    payment_method_collection: 'always', // Always collect payment method for trial
  })

  return session
}

/**
 * Handle Stripe webhook events for trial subscriptions
 */
export async function handleTrialWebhookEvent(event: Stripe.Event) {
  const supabase = createClient()

  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId

      if (!userId) {
        console.error('No userId in subscription metadata')
        return
      }

      // Determine if this is a trial or paid subscription
      const isTrialActive = subscription.status === 'trialing'
      const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null

      const subscriptionData = {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status as any,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: trialEnd?.toISOString() || null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      }

      // Upsert subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'stripe_subscription_id'
        })

      if (subError) {
        console.error('Error upserting subscription:', subError)
        return
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: isTrialActive ? 'trial' : 'active',
          subscription_status: subscription.status as any,
          subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_ends_at: trialEnd?.toISOString() || null,
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId

      if (!userId) {
        console.error('No userId in subscription metadata')
        return
      }

      // Update subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status as any,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        })
        .eq('stripe_subscription_id', subscription.id)

      if (subError) {
        console.error('Error updating subscription:', subError)
        return
      }

      // Update profile based on subscription status
      let subscriptionTier: string
      switch (subscription.status) {
        case 'trialing':
          subscriptionTier = 'trial'
          break
        case 'active':
          subscriptionTier = 'active'
          break
        case 'past_due':
          subscriptionTier = 'past_due'
          break
        case 'canceled':
          subscriptionTier = 'canceled'
          break
        default:
          subscriptionTier = 'inactive'
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: subscriptionTier,
          subscription_status: subscription.status as any,
          subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }

      break
    }

    case 'customer.subscription.trial_will_end': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId

      if (!userId) {
        console.error('No userId in subscription metadata')
        return
      }

      // Send trial ending notification (you can implement email notification here)
      console.log(`Trial ending soon for user ${userId}`)
      
      // You could add email notification logic here
      // await sendTrialEndingEmail(userId)

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        // Get subscription to find user
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.userId

        if (userId) {
          // Update profile to active status (trial ended, payment successful)
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_tier: 'active',
              subscription_status: 'active',
              trial_ends_at: null, // Clear trial end date
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating profile after payment:', error)
          }
        }
      }

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.userId

        if (userId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating subscription status:', error)
          }
        }
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId

      if (!userId) {
        console.error('No userId in subscription metadata')
        return
      }

      // Update subscription status
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      if (subError) {
        console.error('Error updating subscription:', subError)
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'canceled',
          subscription_status: 'canceled',
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

/**
 * Check if user is in trial period
 */
export async function isUserInTrial(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, trial_ends_at')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return false
  }

  if (profile.subscription_tier === 'trial' && profile.trial_ends_at) {
    return new Date(profile.trial_ends_at) > new Date()
  }

  return false
}

/**
 * Get trial information for a user
 */
export async function getTrialInfo(userId: string, supabase?: any) {
  const supabaseClient = supabase || createClient()
  
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('subscription_tier, trial_ends_at, subscription_status')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return null
  }

  const isInTrial = profile.subscription_tier === 'trial'
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const daysRemaining = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  return {
    isInTrial,
    trialEndsAt,
    daysRemaining: Math.max(0, daysRemaining),
    subscriptionStatus: profile.subscription_status
  }
}