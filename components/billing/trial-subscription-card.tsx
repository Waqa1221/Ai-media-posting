'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Crown,
  Gift
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface TrialInfo {
  isInTrial: boolean
  trialEndsAt: Date | null
  daysRemaining: number
  subscriptionStatus: string
}

export function TrialSubscriptionCard() {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    loadTrialInfo()
  }, [])

  const loadTrialInfo = async () => {
    try {
      const response = await fetch('/api/stripe/trial-status')
      const data = await response.json()

      if (response.ok) {
        setTrialInfo({
          ...data,
          trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null
        })
      }
    } catch (error) {
      console.error('Error loading trial info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startFreeTrial = async () => {
    try {
      setIsStartingTrial(true)
      
      const response = await fetch('/api/stripe/create-trial-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start trial')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error starting trial:', error)
      toast.error('Failed to start free trial')
    } finally {
      setIsStartingTrial(false)
    }
  }

  const cancelSubscription = async (immediate = false) => {
    if (!confirm(immediate 
      ? 'Are you sure you want to cancel your subscription immediately?' 
      : 'Are you sure you want to cancel at the end of your billing period?'
    )) {
      return
    }

    try {
      setIsCanceling(true)
      
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

      toast.success(data.message)
      loadTrialInfo()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setIsCanceling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trialing':
        return <Gift className="w-4 h-4" />
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'past_due':
        return <AlertTriangle className="w-4 h-4" />
      case 'canceled':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span>Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No trial info means user hasn't started trial yet
  if (!trialInfo || (!trialInfo.isInTrial && trialInfo.subscriptionStatus !== 'active')) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-blue-600" />
            Start Your Free Trial
          </CardTitle>
          <CardDescription>
            Get 7 days free, then $70/month. Cancel anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">$70</div>
            <div className="text-muted-foreground">per month after trial</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">7-day free trial included</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Unlimited AI content generation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Multi-platform publishing</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Advanced analytics & insights</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">AI Marketing Agency automation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>

          <Button 
            onClick={startFreeTrial}
            disabled={isStartingTrial}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isStartingTrial ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting Trial...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Start 7-Day Free Trial
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            No credit card required for trial. You'll be charged $70/month after 7 days.
          </p>
        </CardContent>
      </Card>
    )
  }

  // User is in trial or has active subscription
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              {trialInfo.isInTrial ? 'Free Trial Active' : 'Subscription Active'}
            </CardTitle>
            <CardDescription>
              {trialInfo.isInTrial 
                ? `${trialInfo.daysRemaining} days remaining in your free trial`
                : 'Your subscription is active and all features are available'
              }
            </CardDescription>
          </div>
          <Badge className={getStatusColor(trialInfo.subscriptionStatus)}>
            {getStatusIcon(trialInfo.subscriptionStatus)}
            <span className="ml-1 capitalize">
              {trialInfo.isInTrial ? 'Trial' : trialInfo.subscriptionStatus}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trial Progress */}
        {trialInfo.isInTrial && trialInfo.trialEndsAt && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Trial Progress</span>
              <span>{7 - trialInfo.daysRemaining} of 7 days used</span>
            </div>
            <Progress 
              value={((7 - trialInfo.daysRemaining) / 7) * 100} 
              className="h-2"
            />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {trialInfo.daysRemaining}
              </div>
              <div className="text-sm text-muted-foreground">
                days remaining
              </div>
            </div>
          </div>
        )}

        {/* Trial Ending Warning */}
        {trialInfo.isInTrial && trialInfo.daysRemaining <= 2 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Trial ending soon!</strong> Your trial ends on{' '}
              {trialInfo.trialEndsAt && format(trialInfo.trialEndsAt, 'PPP')}. 
              You'll be charged $70 unless you cancel.
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Plan</div>
            <div className="text-lg font-semibold">Premium Plan</div>
            <div className="text-sm text-muted-foreground">$70/month</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              {trialInfo.isInTrial ? 'Trial Ends' : 'Next Billing'}
            </div>
            <div className="text-sm">
              {trialInfo.trialEndsAt && format(trialInfo.trialEndsAt, 'PPP')}
            </div>
            <div className="text-xs text-muted-foreground">
              {trialInfo.trialEndsAt && formatDistanceToNow(trialInfo.trialEndsAt, { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-medium">Included Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Unlimited AI generations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Multi-platform publishing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Priority support</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => cancelSubscription(false)}
            disabled={isCanceling}
            className="flex-1"
          >
            {isCanceling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Canceling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </Button>
          
          <Button variant="outline" className="flex-1">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Billing
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-center text-muted-foreground">
          Need help? Contact our support team for assistance with your subscription.
        </div>
      </CardContent>
    </Card>
  )
}