'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrialSubscriptionCard } from '@/components/billing/trial-subscription-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Gift, Clock, CreditCard, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, ArrowLeft, Calendar, DollarSign } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function TrialBillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [trialInfo, setTrialInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadTrialData()
  }, [])

  const loadTrialData = async () => {
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

      // Load trial info
      const response = await fetch('/api/stripe/trial-status')
      const trialData = await response.json()
      
      if (response.ok) {
        setTrialInfo({
          ...trialData,
          trialEndsAt: trialData.trialEndsAt ? new Date(trialData.trialEndsAt) : null
        })
      }
    } catch (error) {
      console.error('Error loading trial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trial information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="w-8 h-8" />
          Free Trial & Billing
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your 7-day free trial and subscription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <TrialSubscriptionCard />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trial Timeline */}
          {trialInfo?.isInTrial && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Trial Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Trial Started</div>
                      <div className="text-xs text-muted-foreground">
                        {profile?.trial_started_at && format(new Date(profile.trial_started_at), 'PPP')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Trial Ends</div>
                      <div className="text-xs text-muted-foreground">
                        {trialInfo.trialEndsAt && format(trialInfo.trialEndsAt, 'PPP p')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">First Charge</div>
                      <div className="text-xs text-muted-foreground">
                        $70 on {trialInfo.trialEndsAt && format(trialInfo.trialEndsAt, 'PPP')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">$70</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Included Features</h4>
                  <div className="space-y-2">
                    {[
                      'Unlimited AI content generation',
                      'Multi-platform publishing',
                      'Advanced analytics dashboard',
                      'Smart scheduling system',
                      'Priority customer support',
                      'Team collaboration tools'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Have questions about your trial or billing?
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/help/billing">
                      <Calendar className="w-4 h-4 mr-2" />
                      Billing FAQ
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/contact">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}