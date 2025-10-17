'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Clock, Calendar, CreditCard, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react'
import { getComprehensiveTrialStatus, formatTrialStatus, getTrialProgress, getTrialUrgency } from '@/lib/stripe/trial-utils'
import { format } from 'date-fns'
import Link from 'next/link'

export function TrialProgressWidget() {
  const [trialStatus, setTrialStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrialStatus()
  }, [])

  const loadTrialStatus = async () => {
    try {
      const status = await getComprehensiveTrialStatus()
      setTrialStatus(status)
    } catch (error) {
      console.warn('Error loading trial status, using safe defaults:', error)
      // Set safe defaults to prevent UI crashes
      setTrialStatus({
        hasTrialAccess: false,
        isInTrial: false,
        trialEndsAt: null,
        daysRemaining: 0,
        subscriptionStatus: 'none',
        canStartTrial: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Don't show widget if user has active premium subscription
  if (!trialStatus || trialStatus.subscriptionStatus === 'active') {
    return null
  }

  const urgency = getTrialUrgency(trialStatus.daysRemaining)
  const progress = getTrialProgress(trialStatus)

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'high': return 'border-orange-200 bg-orange-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getUrgencyTextColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-800'
      case 'high': return 'text-orange-800'
      case 'medium': return 'text-yellow-800'
      default: return 'text-blue-800'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Clock className="w-4 h-4" />
      default:
        return <Gift className="w-4 h-4" />
    }
  }

  // Don't show widget if user has active subscription (not trial)
  if (!trialStatus.isInTrial && trialStatus.subscriptionStatus === 'active') {
    return null
  }

  return (
    <Card className={`w-full ${getUrgencyColor(urgency)}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-base flex items-center gap-2 ${getUrgencyTextColor(urgency)}`}>
          {getUrgencyIcon(urgency)}
          {trialStatus.isInTrial ? 'Free Trial' : 'Start Trial'}
        </CardTitle>
        <CardDescription className={getUrgencyTextColor(urgency)}>
          {formatTrialStatus(trialStatus)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {trialStatus.isInTrial ? (
          <>
            {/* Trial Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Trial Progress</span>
                <span>Day {Math.max(1, 8 - trialStatus.daysRemaining)} of 7</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Days Remaining */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getUrgencyTextColor(urgency)}`}>
                {trialStatus.daysRemaining}
              </div>
              <div className="text-sm text-muted-foreground">
                {trialStatus.daysRemaining === 1 ? 'day' : 'days'} remaining
              </div>
            </div>

            {/* Trial End Date */}
            {trialStatus.trialEndsAt && (
              <div className="text-center text-sm text-muted-foreground">
                Ends {format(trialStatus.trialEndsAt, 'PPP')}
              </div>
            )}

            {/* Action Button */}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard/billing/trial">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Trial
              </Link>
            </Button>
          </>
        ) : trialStatus.canStartTrial ? (
          <>
            {/* Trial Offer */}
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-blue-600">
                7 Days Free
              </div>
              <div className="text-sm text-muted-foreground">
                Then $70/month
              </div>
            </div>

            {/* Features */}
            <div className="space-y-1">
              {[
                'Unlimited AI content',
                'Multi-platform publishing',
                'Advanced analytics'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Start Trial Button */}
            <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600" asChild>
              <Link href="/dashboard/billing/trial">
                <Gift className="w-4 h-4 mr-2" />
                Start Free Trial
              </Link>
            </Button>
          </>
        ) : (
          <>
            {/* Already Used Trial */}
            <div className="text-center space-y-2">
              <div className="text-sm font-medium">
                Trial Already Used
              </div>
              <div className="text-xs text-muted-foreground">
                Upgrade to continue using premium features
              </div>
            </div>

            <Button size="sm" className="w-full" asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Now
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}