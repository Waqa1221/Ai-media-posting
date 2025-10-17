'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown, Sparkles, Gift } from 'lucide-react'
import { SUBSCRIPTION_PLAN } from '@/lib/stripe/config'
import { toast } from 'sonner'

interface SubscriptionPlansProps {
  currentPlan?: string
  onSelectPlan: (priceId: string, planName: string) => Promise<void>
  isLoading?: boolean
}

export function SubscriptionPlans({ 
  currentPlan, 
  onSelectPlan, 
  isLoading = false 
}: SubscriptionPlansProps) {
  const [isSelecting, setIsSelecting] = useState(false)

  const handleSelectPlan = async () => {
    try {
      setIsSelecting(true)
      await onSelectPlan(SUBSCRIPTION_PLAN.priceId, SUBSCRIPTION_PLAN.name)
    } catch (error) {
      toast.error('Failed to start checkout process')
    } finally {
      setIsSelecting(false)
    }
  }

  const isCurrentPlan = currentPlan === 'premium'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6 shadow-lg">
          <Star className="w-4 h-4 mr-2" />
          Simple, Transparent Pricing
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          One plan, everything included
        </h2>
        <p className="text-xl text-gray-600">
          No tiers, no restrictions. Get full access to all features.
        </p>
      </div>

      {/* Single Plan Card */}
      <Card className="relative transition-all duration-300 hover:shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50 overflow-hidden">
        {/* Popular Badge */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm font-medium shadow-lg">
            <Crown className="w-4 h-4 mr-2" />
            Complete Solution
          </Badge>
        </div>

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-4 right-4">
            <Badge className="bg-green-500 text-white px-4 py-2">
              <Check className="w-4 h-4 mr-1" />
              Current Plan
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-6 pt-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
            <Sparkles className="w-10 h-10" />
          </div>
          
          <CardTitle className="text-3xl font-bold">{SUBSCRIPTION_PLAN.name}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {SUBSCRIPTION_PLAN.description}
          </CardDescription>
          
          <div className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${SUBSCRIPTION_PLAN.price}
              </span>
              <div className="text-left">
                <div className="text-gray-600 text-lg">/month</div>
                <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  7-day free trial
                </div>
              </div>
            </div>
            <div className="text-gray-500">
              Cancel anytime • No setup fees • No contracts
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUBSCRIPTION_PLAN.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Value Highlights */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-4 text-center">What makes this plan special?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">∞</div>
                <div className="text-sm text-blue-700">Unlimited Everything</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
                <div className="text-sm text-purple-700">AI Working for You</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">10x</div>
                <div className="text-sm text-green-700">Faster Content Creation</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            {isCurrentPlan ? (
              <Button disabled className="w-full py-4 text-lg" variant="outline">
                <Check className="w-5 h-5 mr-2" />
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={handleSelectPlan}
                disabled={isLoading || isSelecting}
                className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {isSelecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Starting Trial...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Start 7-Day Free Trial
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 pt-6 border-t text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day money back</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Value Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Join thousands of creators and businesses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">1M+</div>
            <div className="text-gray-600">Posts Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </div>
  )
}