'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Gift, ArrowRight, Calendar } from 'lucide-react'
import { format, addDays } from 'date-fns'
import Link from 'next/link'

export default function BillingSuccessPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // In a real implementation, you would verify the session with Stripe
      // For now, we'll simulate successful trial setup
      setSessionData({
        trialStarted: true,
        trialEndsAt: addDays(new Date(), 7),
        amount: 70,
        currency: 'usd'
      })
    }
    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Session not found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find your payment session. Please try again.
            </p>
            <Button asChild>
              <Link href="/dashboard/billing">
                Return to Billing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">
            🎉 Free Trial Started!
          </CardTitle>
          <CardDescription className="text-green-700">
            Your 7-day free trial is now active. Enjoy full access to all features!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Trial Details */}
          <div className="bg-white/60 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Trial Period</span>
              <Badge className="bg-blue-100 text-blue-800">
                <Gift className="w-3 h-3 mr-1" />
                7 Days Free
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Trial Ends</span>
              <span className="text-sm">
                {format(sessionData.trialEndsAt, 'PPP p')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">After Trial</span>
              <span className="text-sm font-semibold">
                ${sessionData.amount}/month
              </span>
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-3">
            <h4 className="font-medium">What's Included in Your Trial</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Unlimited AI content generation',
                'Multi-platform publishing',
                'Advanced scheduling',
                'Detailed analytics',
                'Priority customer support',
                'All premium features'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your trial starts immediately and lasts 7 days</li>
              <li>• You'll be charged $70 on {format(sessionData.trialEndsAt, 'PPP')}</li>
              <li>• Cancel anytime before the trial ends to avoid charges</li>
              <li>• All features are unlocked during your trial period</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <ArrowRight className="w-4 h-4 mr-2" />
                Start Using SocialAI
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard/billing">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Subscription
              </Link>
            </Button>
          </div>

          {/* Support */}
          <div className="text-center text-sm text-muted-foreground">
            Questions about your trial?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contact our support team
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}