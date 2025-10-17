import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
  }
  return stripePromise
}

/**
 * Redirect to trial checkout
 */
export async function redirectToTrialCheckout() {
  try {
    const response = await fetch('/api/stripe/create-trial-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session')
    }

    // Redirect to Stripe Checkout
    window.location.href = data.url
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

/**
 * Get trial status for current user
 */
export async function getTrialStatus() {
  try {
    const response = await fetch('/api/stripe/trial-status')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch trial status')
    }

    return {
      ...data,
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null
    }
  } catch (error) {
    console.error('Error fetching trial status:', error)
    throw error
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(immediate = false) {
  try {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelImmediately: immediate }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel subscription')
    }

    return data
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

/**
 * Open Stripe Customer Portal for subscription management
 */
export async function openCustomerPortal() {
  try {
    const response = await fetch('/api/subscriptions/portal', {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to open customer portal')
    }

    // Redirect to Stripe Customer Portal
    window.location.href = data.url
  } catch (error) {
    console.error('Error opening customer portal:', error)
    throw error
  }
}