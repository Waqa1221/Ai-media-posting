'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface AgencyStatus {
  hasAgencySetup: boolean
  isActive: boolean
  businessName: string
  lastActivity: string | null
  upcomingPosts: number
  totalPosts: number
}

export function AgencyStatusWidget() {
  const [agencyStatus, setAgencyStatus] = useState<AgencyStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAgencyStatus()
  }, [])

  const loadAgencyStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user has agency setup
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_agency_setup')
        .eq('id', user.id)
        .single()

      if (!profile?.has_agency_setup) {
        setAgencyStatus({
          hasAgencySetup: false,
          isActive: false,
          businessName: '',
          lastActivity: null,
          upcomingPosts: 0,
          totalPosts: 0
        })
        return
      }

      // Get agency project details
      const { data: project } = await supabase
        .from('client_projects')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!project) {
        setAgencyStatus({
          hasAgencySetup: false,
          isActive: false,
          businessName: '',
          lastActivity: null,
          upcomingPosts: 0,
          totalPosts: 0
        })
        return
      }

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('agency_activity_logs')
        .select('created_at')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get post counts
      const { data: upcomingPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('project_id', project.id)
        .eq('status', 'scheduled')

      const { data: totalPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('project_id', project.id)

      setAgencyStatus({
        hasAgencySetup: true,
        isActive: project.is_active,
        businessName: project.business_name,
        lastActivity: recentActivity?.created_at || null,
        upcomingPosts: upcomingPosts?.length || 0,
        totalPosts: totalPosts?.length || 0
      })

    } catch (error) {
      console.error('Error loading agency status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm">Loading agency status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!agencyStatus?.hasAgencySetup) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Marketing Agency
          </CardTitle>
          <CardDescription>
            Transform your social media with AI automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-blue-800">
              Set up your AI Marketing Agency to automate content creation, scheduling, and publishing 24/7.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/onboarding/agency-setup">
                  <Zap className="w-4 h-4 mr-2" />
                  Complete Setup
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Marketing Agency
            </CardTitle>
            <CardDescription>
              Working for {agencyStatus.businessName}
            </CardDescription>
          </div>
          <Badge className={agencyStatus.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {agencyStatus.isActive ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Paused
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!agencyStatus.isActive && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your AI agency is paused. Activate it to resume automated content creation.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{agencyStatus.totalPosts}</div>
            <div className="text-sm text-blue-600">Total Posts</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{agencyStatus.upcomingPosts}</div>
            <div className="text-sm text-green-600">Scheduled</div>
          </div>
        </div>

        {agencyStatus.lastActivity && (
          <div className="text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Last activity: {formatDistanceToNow(new Date(agencyStatus.lastActivity), { addSuffix: true })}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href="/dashboard/agency">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/agency/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}