'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, CircleCheck as CheckCircle, RefreshCw, Settings, Trash2, Info } from 'lucide-react'
import { toast } from 'sonner'

interface FacebookAccount {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  account_type?: string
}

interface FacebookConnectionCardProps {
  account: FacebookAccount | null
  isConnecting: boolean
  onConnect: () => void
  onDisconnect: () => void
  onRefresh: () => void
}

export function FacebookConnectionCard({
  account,
  isConnecting,
  onConnect,
  onDisconnect,
  onRefresh
}: FacebookConnectionCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
      toast.success('Facebook account refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh Facebook account')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Facebook account? This will stop all scheduled posts to Facebook.')) {
      try {
        await onDisconnect()
        toast.success('Facebook account disconnected')
      } catch (error) {
        toast.error('Failed to disconnect Facebook account')
      }
    }
  }

  return (
    <Card className={`transition-all ${account ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📘
            </div>
            <div>
              <CardTitle className="text-lg">Facebook</CardTitle>
              <CardDescription>
                Connect with friends and pages
              </CardDescription>
            </div>
          </div>

          {account ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {account ? (
          <>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              {account.avatar_url && (
                <img
                  src={account.avatar_url}
                  alt={account.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">{account.display_name}</div>
                <div className="text-sm text-muted-foreground">
                  {account.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  Connected {new Date(account.created_at).toLocaleDateString()}
                </div>
              </div>
              {account.account_type && (
                <Badge variant="secondary" className="text-xs">
                  {account.account_type}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Available Features</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Page Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Analytics</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Requirements for Facebook connection:</div>
                  <ul className="text-sm space-y-1">
                    <li>• Facebook Page admin access</li>
                    <li>• Business account in good standing</li>
                    <li>• Publishing permissions enabled</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">What you'll get:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Publish posts to your Facebook Page</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Schedule Facebook Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Share videos and images</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Access page analytics and insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI-powered content recommendations</span>
                </div>
              </div>
            </div>

            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting to Facebook...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Facebook Page
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Need help setting up your Facebook Page?
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="link" size="sm" asChild>
                  <a
                    href="https://www.facebook.com/business/pages/set-up"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs"
                  >
                    Facebook Page Guide
                  </a>
                </Button>
                <Button variant="link" size="sm" asChild>
                  <a
                    href="/docs/troubleshooting/facebook-connection-issues"
                    className="text-xs"
                  >
                    Troubleshooting
                  </a>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}