import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
  }
  return stripePromise
}

/**
 * Enhanced subscription management with better UX
 */
export const subscriptionManager = {
  async getSubscriptionDetails() {
    try {
      const response = await fetch('/api/billing/subscription-details')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription details')
      }

      return data
    } catch (error) {
      console.error('Error fetching subscription details:', error)
      throw error
    }
  },

  async updateSubscription(priceId: string) {
    try {
      const response = await fetch('/api/billing/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription')
      }

      return data
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  },

  async cancelSubscription(immediate = false, reason?: string) {
    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cancelImmediately: immediate,
          cancellationReason: reason 
        }),
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
  },

  async reactivateSubscription() {
    try {
      const response = await fetch('/api/billing/reactivate-subscription', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate subscription')
      }

      return data
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw error
    }
  }
}

/**
 * Enhanced payment method management
 */
export const paymentMethodManager = {
  async getPaymentMethods() {
    try {
      const response = await fetch('/api/billing/payment-methods')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment methods')
      }

      return data.paymentMethods || []
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      throw error
    }
  },

  async attachPaymentMethod(paymentMethodId: string) {
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to attach payment method')
      }

      return data
    } catch (error) {
      console.error('Error attaching payment method:', error)
      throw error
    }
  },

  async deletePaymentMethod(paymentMethodId: string) {
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method')
      }

      return data
    } catch (error) {
      console.error('Error deleting payment method:', error)
      throw error
    }
  },

  async setDefaultPaymentMethod(paymentMethodId: string) {
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set default payment method')
      }

      return data
    } catch (error) {
      console.error('Error setting default payment method:', error)
      throw error
    }
  }
}

/**
 * Enhanced checkout experience
 */
export const checkoutManager = {
  async createCheckoutSession(priceId: string, options?: {
    successUrl?: string
    cancelUrl?: string
    allowPromotionCodes?: boolean
    collectBillingAddress?: boolean
  }) {
    try {
      const response = await fetch('/api/billing/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: options?.successUrl || `${window.location.origin}/dashboard/billing/success`,
          cancelUrl: options?.cancelUrl || `${window.location.origin}/dashboard/billing`,
          allowPromotionCodes: options?.allowPromotionCodes || true,
          collectBillingAddress: options?.collectBillingAddress || true
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      return data
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  async redirectToCheckout(sessionId: string) {
    try {
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error)
      throw error
    }
  }
}

/**
 * Billing utilities for better UX
 */
export const billingUtils = {
  formatCurrency(amountCents: number, currency = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100)
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  getSubscriptionStatus(status: string): {
    label: string
    color: string
    description: string
  } {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color:  'bg-green-100 text-green-800',
          description: 'Your subscription is active and all features are available'
        }
      case 'trialing':
        return {
          label: 'Free Trial',
          color: 'bg-blue-100 text-blue-800',
          description: 'You\'re in your free trial period'
        }
      case 'past_due':
        return {
          label: 'Past Due',
          color: 'bg-red-100 text-red-800',
          description: 'Your payment is overdue'
        }
      case 'canceled':
        return {
          label: 'Canceled',
          color: 'bg-gray-100 text-gray-800',
          description: 'Your subscription has been canceled'
        }
      case 'incomplete':
        return {
          label: 'Incomplete',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Your subscription setup is incomplete'
        }
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          description: 'Subscription status unknown'
        }
    }
  },

  getPaymentMethodBrand(brand: string): string {
    const brands: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay'
    }
    return brands[brand] || brand.charAt(0).toUpperCase() + brand.slice(1)
  }
}