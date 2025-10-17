import { useState, useEffect, useCallback } from 'react'
import { subscriptionManager, paymentMethodManager } from '@/lib/stripe/enhanced-client'
import { toast } from 'sonner'

interface BillingData {
  subscription: any
  paymentMethods: any[]
  invoices: any[]
  trialInfo: any
  summary: any
}

export function useEnhancedBilling() {
  const [billingData, setBillingData] = useState<BillingData>({
    subscription: null,
    paymentMethods: [],
    invoices: [],
    trialInfo: null,
    summary: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBillingData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load all billing data in parallel
      const [
        subscriptionResult,
        paymentMethodsResult,
        invoicesResult
      ] = await Promise.allSettled([
        subscriptionManager.getSubscriptionDetails(),
        paymentMethodManager.getPaymentMethods(),
        fetch('/api/billing/invoices').then(res => res.json())
      ])

      const newBillingData: BillingData = {
        subscription: subscriptionResult.status === 'fulfilled' ? subscriptionResult.value.subscription : null,
        paymentMethods: paymentMethodsResult.status === 'fulfilled' ? paymentMethodsResult.value : [],
        invoices: invoicesResult.status === 'fulfilled' ? invoicesResult.value.invoices || [] : [],
        trialInfo: subscriptionResult.status === 'fulfilled' ? subscriptionResult.value.trialInfo : null,
        summary: subscriptionResult.status === 'fulfilled' ? subscriptionResult.value.summary : null
      }

      setBillingData(newBillingData)

      // Handle any errors
      if (subscriptionResult.status === 'rejected') {
        console.warn('Failed to load subscription:', subscriptionResult.reason)
      }
      if (paymentMethodsResult.status === 'rejected') {
        console.warn('Failed to load payment methods:', paymentMethodsResult.reason)
      }
      if (invoicesResult.status === 'rejected') {
        console.warn('Failed to load invoices:', invoicesResult.reason)
      }

    } catch (error) {
      console.error('Error loading billing data:', error)
      setError('Failed to load billing information')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await paymentMethodManager.attachPaymentMethod(paymentMethodId)
      await loadBillingData()
      toast.success('Payment method added successfully')
    } catch (error) {
      toast.error('Failed to add payment method')
      throw error
    }
  }, [loadBillingData])

  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await paymentMethodManager.deletePaymentMethod(paymentMethodId)
      await loadBillingData()
      toast.success('Payment method removed successfully')
    } catch (error) {
      toast.error('Failed to remove payment method')
      throw error
    }
  }, [loadBillingData])

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await paymentMethodManager.setDefaultPaymentMethod(paymentMethodId)
      await loadBillingData()
      toast.success('Default payment method updated')
    } catch (error) {
      toast.error('Failed to update default payment method')
      throw error
    }
  }, [loadBillingData])

  const createCheckoutSession = useCallback(async (priceId: string) => {
    try {
      const response = await fetch('/api/billing/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      toast.error('Failed to start checkout process')
      throw error
    }
  }, [])

  const openCustomerPortal = useCallback(async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open customer portal')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error('Failed to open billing portal')
      throw error
    }
  }, [])

  useEffect(() => {
    loadBillingData()
  }, [loadBillingData])

  return {
    billingData,
    isLoading,
    error,
    loadBillingData,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    createCheckoutSession,
    openCustomerPortal
  }
}