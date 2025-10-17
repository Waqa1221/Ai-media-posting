'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Zap, 
  MessageSquare, 
  Users, 
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { SUBSCRIPTION_PLAN } from '@/lib/stripe/config'
import Link from 'next/link'

interface UsageMetricsProps {
  usageData: any
  subscriptionTier: 'trial' | 'premium' | 'canceled'
}

export function UsageMetrics({ usageData, subscriptionTier }: UsageMetricsProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-red-500" />
    if (percentage >= 75) return <AlertTriangle className="w-4 h-4 text-orange-500" />
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  // Memoize usage calculations for better performance
  const usageCalculations = useMemo(() => {
  const usageItems = [
    {
      key: 'posts_per_month',
      title: 'Posts',
      icon: MessageSquare,
      description: 'Monthly posts'
    },
    {
      key: 'ai_generations_per_month',
      title: 'AI Generations',
      icon: Zap,
      description: 'AI content created'
    },
    {
      key: 'social_accounts',
      title: 'Social Accounts',
      icon: Users,
      description: 'Connected platforms'
    }
  ]
    
    return usageItems.map(item => {
      const usage = usageData[item.key] || { current_usage: 0, limit_value: 0 }
      const current = usage.current_usage || 0
      const limit = usage.limit_value || 0
      const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0
      const isUnlimited = limit === -1
      const isNearLimit = percentage >= 75
      
      return {
        ...item,
        current,
        limit,
        percentage,
        isUnlimited,
        isNearLimit
      }
    })
  }, [usageData])

  const getTierLimits = (tier: string) => {
    // With single pricing model, premium users get unlimited everything
    if (tier === 'premium') {
      return { posts: -1, ai: -1, accounts: -1 }
    }
    // Trial users get high limits
    if (tier === 'trial') {
      return { posts: 100, ai: 500, accounts: 20 }
    }
    // Default (no access)
    return { posts: 0, ai: 0, accounts: 0 }
  }

  const limits = getTierLimits(subscriptionTier)
  
  // Check if user is approaching limits
  const approachingLimits = subscriptionTier === 'trial' && usageCalculations.some(item => item.isNearLimit && !item.isUnlimited)
  
  // Show upgrade prompt if user is on trial and approaching limits
  const shouldShowUpgrade = subscriptionTier === 'trial' && approachingLimits

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Usage This Month
            </CardTitle>
            <CardDescription>
              Track your subscription limits
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {subscriptionTier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Alert */}
        {shouldShowUpgrade && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You're approaching your usage limits. Consider upgrading for unlimited access.
            </AlertDescription>
          </Alert>
        )}
        
        {usageCalculations.map((item) => {
          return (
            <div key={item.key} className={`space-y-3 ${item.isNearLimit && !item.isUnlimited ? 'p-3 border border-orange-200 rounded-lg bg-orange-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!item.isUnlimited && getUsageIcon(item.percentage)}
                  <span className={`text-sm font-medium ${!item.isUnlimited ? getUsageColor(item.percentage) : 'text-gray-600'}`}>
                    {item.current.toLocaleString()}{!item.isUnlimited && `/${item.limit.toLocaleString()}`}
                    {item.isUnlimited && ' (Unlimited)'}
                  </span>
                </div>
              </div>
              
              {!item.isUnlimited && (
                <div className="space-y-1">
                  <Progress 
                    value={item.percentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.description}</span>
                    <span>{item.percentage}% used</span>
                  </div>
                </div>
              )}
              
              {item.isUnlimited && (
                <div className="text-xs text-gray-500">
                  {item.description} - No limits
                </div>
              )}
            </div>
          )
        })}

        {/* Upgrade prompt for high usage */}
        {shouldShowUpgrade && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">
                  Upgrade to Premium
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  You're using {Math.max(...usageCalculations.filter(i => !i.isUnlimited).map(i => i.percentage))}% of your trial limits. Upgrade to premium for unlimited access.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                  <Link href="/dashboard/billing">
                      <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Link>
                </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowUpgradePrompt(false)}>
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing link */}
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}