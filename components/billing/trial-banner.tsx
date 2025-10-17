'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gift, Clock, CreditCard, X } from 'lucide-react'
import { getTrialStatus } from '@/lib/stripe/trial-client'
import { format } from 'date-fns'
import Link from 'next/link'

export function TrialBanner() {
  const [trialInfo, setTrialInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrialInfo()
  }, [])

  const loadTrialInfo = async () => {
    try {
      const info = await getTrialStatus()
      setTrialInfo(info)
      
      // Only show banner if user is in trial
      setIsVisible(info.isInTrial && info.daysRemaining > 0)
    } catch (error) {
      console.warn('Error loading trial info, hiding banner:', error)
      setIsVisible(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !isVisible || !trialInfo?.isInTrial) {
    return null
  }

  const getBannerColor = (daysRemaining: number) => {
    if (daysRemaining <= 1) return 'border-red-200 bg-red-50'
    if (daysRemaining <= 3) return 'border-orange-200 bg-orange-50'
    return 'border-blue-200 bg-blue-50'
  }

  const getTextColor = (daysRemaining: number) => {
    if (daysRemaining <= 1) return 'text-red-800'
    if (daysRemaining <= 3) return 'text-orange-800'
    return 'text-blue-800'
  }

  const getIconColor = (daysRemaining: number) => {
    if (daysRemaining <= 1) return 'text-red-600'
    if (daysRemaining <= 3) return 'text-orange-600'
    return 'text-blue-600'
  }

  return (
    <Alert className={`${getBannerColor(trialInfo.daysRemaining)} mb-6`}>
      <Gift className={`h-4 w-4 ${getIconColor(trialInfo.daysRemaining)}`} />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className={`font-medium ${getTextColor(trialInfo.daysRemaining)}`}>
                {trialInfo.daysRemaining === 1 
                  ? '🚨 Trial ends tomorrow!' 
                  : trialInfo.daysRemaining <= 3
                  ? `⏰ Trial ends in ${trialInfo.daysRemaining} days`
                  : `🎉 ${trialInfo.daysRemaining} days left in your free trial`
                }
              </span>
              <div className="text-sm mt-1">
                You'll be charged $70 on {trialInfo.trialEndsAt && format(trialInfo.trialEndsAt, 'PPP')}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-white/80">
                <Clock className="w-3 h-3 mr-1" />
                {trialInfo.daysRemaining} days left
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/billing/trial">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Trial
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}