'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Instagram, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle,
  Bookmark,
  Users,
  ExternalLink
} from 'lucide-react'
import { useInstagramConnection } from '@/hooks/use-instagram-connection'

export function InstagramAnalyticsWidget() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { account, getAnalytics } = useInstagramConnection()

  useEffect(() => {
    if (account) {
      loadAnalytics()
    } else {
      setIsLoading(false)
    }
  }, [account])

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics(undefined, '7d')
      setAnalytics(data.insights)
    } catch (error) {
      console.error('Error loading Instagram analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Instagram Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Instagram className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Connect Instagram to view analytics</p>
            <Button size="sm" asChild>
              <a href="/dashboard/social-accounts">
                Connect Instagram
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Instagram Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mr-2"></div>
            <span>Loading analytics...</span>
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
              <Instagram className="w-5 h-5" />
              Instagram Analytics
            </CardTitle>
            <CardDescription>
              @{account.username} • Last 7 days
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/analytics" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View Details
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <Eye className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-pink-600">
              {analytics?.impressions?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-pink-600">Impressions</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-600">
              {analytics?.reach?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-purple-600">Reach</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">
              {analytics?.profile_views?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-blue-600">Profile Views</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <ExternalLink className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">
              {analytics?.website_clicks?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-green-600">Website Clicks</div>
          </div>
        </div>

        {analytics?.follower_count && (
          <div className="mt-4 pt-4 border-t text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.follower_count.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}