'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrialSubscriptionCard } from '@/components/billing/trial-subscription-card'
import { SubscriptionPlans } from '@/components/billing/subscription-plans'
import { SubscriptionStatus } from '@/components/billing/subscription-status'
import { BillingHistory } from '@/components/billing/billing-history'
import { PaymentMethodCard } from '@/components/billing/payment-method-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Calendar, DollarSign, Settings, ExternalLink, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Crown, Zap, Gift } from 'lucide-react'
import { SUBSCRIPTION_PLAN } from '@/lib/stripe/config'
import { getComprehensiveTrialStatus } from '@/lib/stripe/trial-utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Subscription {
  id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
}

interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  is_default: boolean
}
export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [trialStatus, setTrialStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const supabase = createClient()

  const loadBillingData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Load subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError
      }
      
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('Error loading billing data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase])

  const loadPaymentMethods = useCallback(async () => {
    try {
      const response = await fetch('/api/billing/payment-methods')
      const data = await response.json()
      
      if (response.ok) {
        setPaymentMethods(data.paymentMethods || [])
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    }
  }, [])

  const loadTrialStatus = useCallback(async () => {
    try {
      const status = await getComprehensiveTrialStatus()
      setTrialStatus(status)
    } catch (error) {
      console.error('Error loading trial status:', error)
    }
  }, [])

  useEffect(() => {
    loadBillingData()
    loadPaymentMethods()
    loadTrialStatus()
  }, [loadBillingData, loadPaymentMethods, loadTrialStatus])
  const createCheckoutSession = async (priceId: string) => {
    try {
      setIsCreatingCheckout(true)
      
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setIsCreatingCheckout(false)
    }
  }

  const openCustomerPortal = async () => {
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
      toast.error('Failed to open billing portal')
    }
  }

  const handleSelectPlan = async (priceId: string, planName: string) => {
    await createCheckoutSession(priceId)
  }

  const handleAddPaymentMethod = () => {
    // This would open a payment method setup flow
    // For now, redirect to customer portal
    openCustomerPortal()
  }

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      await loadPaymentMethods()
    } catch (error) {
      throw error
    }
  }

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      await loadPaymentMethods()
    } catch (error) {
      throw error
    }
  }
  const getCurrentPlan = () => {
    if (!subscription) return null
    
    // With single pricing, if they have a subscription, they have premium
    return subscription.stripe_price_id === SUBSCRIPTION_PLAN.priceId ? 'premium' : null
  }


  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()
  const currentPlanData = currentPlan ? SUBSCRIPTION_PLAN : null

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Crown },
              { id: 'trial', label: 'Free Trial', icon: Gift },
              { id: 'plans', label: 'Plans', icon: Zap },
              { id: 'payment', label: 'Payment Methods', icon: CreditCard },
              { id: 'history', label: 'Billing History', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Show trial card if user is in trial or can start trial */}
              {(trialStatus?.isInTrial || trialStatus?.canStartTrial) ? (
                <TrialSubscriptionCard />
              ) : (
                <SubscriptionStatus
                  subscription={subscription}
                  plan={currentPlanData}
                  onManageSubscription={openCustomerPortal}
                  isLoading={isCreatingCheckout}
                />
              )}
            </div>
            <div className="space-y-6">
              {/* Usage Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage This Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Posts Created</span>
                    <span className="font-medium">
                      0 / {trialStatus?.hasTrialAccess ? '∞' : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Generations</span>
                    <span className="font-medium">
                      0 / {trialStatus?.hasTrialAccess ? '∞' : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Accounts</span>
                    <span className="font-medium">
                      0 / {trialStatus?.hasTrialAccess ? '∞' : '0'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Have questions about billing or need to make changes?
                  </p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'trial' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Free Trial Management</h2>
              <p className="text-muted-foreground">
                Manage your 7-day free trial and understand the billing process.
              </p>
            </div>
            <TrialSubscriptionCard />
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Select the plan that best fits your needs. You can change or cancel anytime.
              </p>
            </div>
            <SubscriptionPlans
              currentPlan={currentPlan || undefined}
              onSelectPlan={handleSelectPlan}
              isLoading={isCreatingCheckout}
            />
          </div>
        )}

        {activeTab === 'payment' && (
          <PaymentMethodCard
            paymentMethods={paymentMethods}
            onAddPaymentMethod={handleAddPaymentMethod}
            onDeletePaymentMethod={handleDeletePaymentMethod}
            onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'history' && (
          <BillingHistory customerId={profile?.stripe_customer_id} />
        )}
      </div>
    </div>
  )
}