'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Crown, Calendar, CreditCard, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Settings, Play, Pause, TrendingUp, Gift, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { subscriptionManager } from '@/lib/stripe/enhanced-client'
import { toast } from 'sonner'

interface SubscriptionDetails {
  subscription: {
    id: string
    status: string
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    canceled_at: string | null
    amount_cents: number
    currency: string
    plan?: {
      name: string
      features: string[]
    }
  } | null
  trialInfo: {
    isInTrial: boolean
    daysRemaining: number
    trialProgress: number
  } | null
  summary: {
    totalPaidCents: number
    totalTransactions: number
  } | null
}

interface EnhancedSubscriptionManagerProps {
  subscriptionDetails: SubscriptionDetails
  onSubscriptionChange: () => void
}

export function EnhancedSubscriptionManager({
  subscriptionDetails,
  onSubscriptionChange
}: EnhancedSubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelFeedback, setCancelFeedback] = useState('')
  const [cancelImmediately, setCancelImmediately] = useState(false)

  const { subscription, trialInfo, summary } = subscriptionDetails

  const formatCurrency = (amountCents: number, currency = 'usd'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100)
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          message: 'Your subscription is active and all features are available.',
          color: 'text-green-600'
        }
      case 'trialing':
        return {
          icon: Gift,
          message: 'You\'re in your free trial period. Enjoy full access to all features!',
          color: 'text-blue-600'
        }
      case 'past_due':
        return {
          icon: AlertTriangle,
          message: 'Your payment is past due. Please update your payment method to continue using all features.',
          color: 'text-yellow-600'
        }
      case 'canceled':
        return {
          icon: AlertTriangle,
          message: 'Your subscription has been canceled. You can reactivate it anytime.',
          color: 'text-red-600'
        }
      case 'incomplete':
        return {
          icon: AlertTriangle,
          message: 'Your subscription setup is incomplete. Please complete the payment to activate all features.',
          color: 'text-orange-600'
        }
      default:
        return {
          icon: AlertTriangle,
          message: 'Subscription status unknown. Please contact support if you need assistance.',
          color: 'text-gray-600'
        }
    }
  }

  const getNextBillingDisplay = (subscription: any) => {
    if (subscription.cancel_at_period_end) {
      return 'Cancels On'
    }
    if (subscription.status === 'trialing') {
      return 'Trial Ends'
    }
    return 'Next Billing'
  }

  const handleCancelSubscription = async () => {
    if (!cancelReason) {
      toast.error('Please select a reason for canceling')
      return
    }

    try {
      setIsLoading(true)
      
      await subscriptionManager.cancelSubscription(cancelImmediately, cancelReason)
      
      toast.success(
        cancelImmediately 
          ? 'Subscription canceled immediately' 
          : 'Subscription will cancel at the end of the current period'
      )
      
      setIsCancelDialogOpen(false)
      setCancelReason('')
      setCancelFeedback('')
      setCancelImmediately(false)
      onSubscriptionChange()
    } catch (error) {
      toast.error('Failed to cancel subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true)
      await subscriptionManager.reactivateSubscription()
      toast.success('Subscription reactivated successfully')
      onSubscriptionChange()
    } catch (error) {
      toast.error('Failed to reactivate subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const openCustomerPortal = async () => {
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
    }
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            You don't have an active subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Active Subscription
            </h3>
            <p className="text-muted-foreground mb-4">
              Start your free trial to unlock all premium features
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Gift className="w-4 h-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusDisplay = getStatusDisplay(subscription.status)

  return (
    <div className="space-y-6">
      {/* Main Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Manage your current subscription and billing
              </CardDescription>
            </div>
            <Badge className={
              subscription.status === 'active' ? 'bg-green-100 text-green-800' :
              subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
              subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              <statusDisplay.icon className="w-3 h-3 mr-1" />
              <span className="capitalize">{subscription.status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Message */}
          <Alert className={
            subscription.status === 'active' ? 'border-green-200 bg-green-50' :
            subscription.status === 'trialing' ? 'border-blue-200 bg-blue-50' :
            subscription.status === 'past_due' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }>
            <statusDisplay.icon className="h-4 w-4" />
            <AlertDescription>
              {statusDisplay.message}
            </AlertDescription>
          </Alert>

          {/* Trial Progress */}
          {trialInfo?.isInTrial && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trial Progress</span>
                <span className="text-sm text-muted-foreground">
                  {7 - trialInfo.daysRemaining} of 7 days used
                </span>
              </div>
              <Progress value={trialInfo.trialProgress} className="h-2" />
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {trialInfo.daysRemaining}
                </div>
                <div className="text-sm text-muted-foreground">
                  days remaining
                </div>
              </div>
            </div>
          )}

          {/* Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Plan</div>
              <div className="text-lg font-semibold">
                {subscription.plan?.name || 'Premium Plan'}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(subscription.amount_cents, subscription.currency)}/month
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {getNextBillingDisplay(subscription)}
              </div>
              <div className="text-sm">
                {format(new Date(subscription.current_period_end), 'PPP')}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(subscription.current_period_end), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Cancellation Notice */}
          {subscription.cancel_at_period_end && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will cancel at the end of the current billing period on{' '}
                <strong>{format(new Date(subscription.current_period_end), 'PPP')}</strong>.
                You'll continue to have access until then.
              </AlertDescription>
            </Alert>
          )}

          {/* Features List */}
          {subscription.plan?.features && (
            <div className="space-y-3">
              <h4 className="font-medium">Included Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {subscription.cancel_at_period_end ? (
              <Button 
                onClick={handleReactivateSubscription}
                disabled={isLoading}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Reactivate Subscription
              </Button>
            ) : (
              <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      We're sorry to see you go. Please let us know why you're canceling.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cancel-reason">Reason for canceling</Label>
                      <select
                        id="cancel-reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a reason</option>
                        <option value="too_expensive">Too expensive</option>
                        <option value="not_using">Not using enough</option>
                        <option value="missing_features">Missing features</option>
                        <option value="technical_issues">Technical issues</option>
                        <option value="switching_service">Switching to another service</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="cancel-feedback">Additional feedback (optional)</Label>
                      <Textarea
                        id="cancel-feedback"
                        placeholder="Help us improve by sharing your feedback..."
                        value={cancelFeedback}
                        onChange={(e) => setCancelFeedback(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cancel-immediately"
                        checked={cancelImmediately}
                        onChange={(e) => setCancelImmediately(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="cancel-immediately" className="text-sm">
                        Cancel immediately (lose access now)
                      </Label>
                    </div>

                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {cancelImmediately ? (
                          'Your subscription will be canceled immediately and you will lose access to all premium features.'
                        ) : (
                          `Your subscription will remain active until ${format(new Date(subscription.current_period_end), 'PPP')} and then cancel automatically.`
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCancelDialogOpen(false)}
                        className="flex-1"
                      >
                        Keep Subscription
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={isLoading || !cancelReason}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Canceling...
                          </>
                        ) : (
                          'Confirm Cancellation'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button 
              onClick={openCustomerPortal}
              variant="outline"
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
          </div>

          {/* Billing Summary */}
          {summary && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(summary.totalPaidCents)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Paid</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {summary.totalTransactions}
                  </div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {subscription.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage and Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Value This Month
          </CardTitle>
          <CardDescription>
            See how much value you're getting from your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">∞</div>
              <div className="text-sm text-blue-600">AI Generations</div>
              <div className="text-xs text-muted-foreground">Unlimited</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">∞</div>
              <div className="text-sm text-green-600">Posts</div>
              <div className="text-xs text-muted-foreground">Unlimited</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <div className="text-sm text-purple-600">Social Accounts</div>
              <div className="text-xs text-muted-foreground">Unlimited</div>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              You're saving an estimated <strong>15+ hours per week</strong> with AI automation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}