'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Settings,
  ExternalLink
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface SubscriptionStatusProps {
  subscription: {
    id: string
    status: string
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    canceled_at: string | null
  } | null
  plan: {
    name: string
    price: number
  } | null
  onManageSubscription: () => void
  onCancelSubscription?: () => void
  isLoading?: boolean
}

export function SubscriptionStatus({
  subscription,
  plan,
  onManageSubscription,
  onCancelSubscription,
  isLoading = false
}: SubscriptionStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'incomplete':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'past_due':
      case 'incomplete':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'active':
        return 'Your subscription is active and all features are available.'
      case 'past_due':
        return 'Your payment is past due. Please update your payment method to continue using all features.'
      case 'canceled':
        return 'Your subscription has been canceled. You can reactivate it anytime.'
      case 'incomplete':
        return 'Your subscription setup is incomplete. Please complete the payment to activate all features.'
      default:
        return 'Subscription status unknown. Please contact support if you need assistance.'
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
          <div className="text-center py-6">
            <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Active Subscription
            </h3>
            <p className="text-muted-foreground mb-4">
              You're currently on the free tier. Upgrade to unlock more features and higher limits.
            </p>
            <Badge variant="outline" className="mb-4">
              Free Tier
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>
          Manage your current subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold">
                {plan?.name || 'Unknown'} Plan
              </h3>
              <p className="text-sm text-muted-foreground">
                ${plan?.price || 0}/month
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusIcon(subscription.status)}
            <span className="ml-1 capitalize">{subscription.status}</span>
          </Badge>
        </div>

        {/* Status Message */}
        <Alert className={
          subscription.status === 'active' ? 'border-green-200 bg-green-50' :
          subscription.status === 'past_due' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }>
          {getStatusIcon(subscription.status)}
          <AlertDescription>
            {getStatusMessage(subscription.status)}
          </AlertDescription>
        </Alert>

        {/* Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Current Period</div>
            <div className="text-sm">
              {format(new Date(subscription.current_period_start), 'MMM dd, yyyy')} - {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Next Billing</div>
            <div className="text-sm">
              {subscription.cancel_at_period_end ? (
                <span className="text-red-600">Cancels at period end</span>
              ) : (
                <>
                  {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  <span className="text-muted-foreground ml-1">
                    ({formatDistanceToNow(new Date(subscription.current_period_end), { addSuffix: true })})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Notice */}
        {subscription.cancel_at_period_end && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your subscription will cancel at the end of the current billing period on{' '}
              <strong>{format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}</strong>.
              You'll continue to have access until then.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={onManageSubscription} 
            disabled={isLoading}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
          
          {subscription.status === 'past_due' && (
            <Button 
              onClick={onManageSubscription} 
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-sm text-muted-foreground">
          <p>
            Need help with your subscription? Visit our{' '}
            <a href="/help" className="text-primary hover:underline">
              help center
            </a>{' '}
            or{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact support
            </a>.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}