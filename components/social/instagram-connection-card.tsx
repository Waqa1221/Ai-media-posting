'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Instagram, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Settings,
  Trash2,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface InstagramAccount {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  account_type?: string
}

interface InstagramConnectionCardProps {
  account: InstagramAccount | null
  isConnecting: boolean
  onConnect: () => void
  onDisconnect: () => void
  onRefresh: () => void
}

export function InstagramConnectionCard({
  account,
  isConnecting,
  onConnect,
  onDisconnect,
  onRefresh
}: InstagramConnectionCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
      toast.success('Instagram account refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh Instagram account')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Instagram account? This will stop all scheduled posts to Instagram.')) {
      try {
        await onDisconnect()
        toast.success('Instagram account disconnected')
      } catch (error) {
        toast.error('Failed to disconnect Instagram account')
      }
    }
  }

  return (
    <Card className={`transition-all ${account ? 'ring-2 ring-pink-200 bg-pink-50/50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📸
            </div>
            <div>
              <CardTitle className="text-lg">Instagram</CardTitle>
              <CardDescription>
                Visual storytelling and brand building
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
            {/* Connected Account Info */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              {account.avatar_url && (
                <img
                  src={account.avatar_url}
                  alt={account.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">@{account.username}</div>
                <div className="text-sm text-muted-foreground">
                  {account.display_name}
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

            {/* Account Actions */}
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

            {/* Publishing Features */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Available Features</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Feed Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Reels</span>
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
            {/* Connection Requirements */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Requirements for Instagram connection:</div>
                  <ul className="text-sm space-y-1">
                    <li>• Instagram Business or Creator account</li>
                    <li>• Connected Facebook Page</li>
                    <li>• Account in good standing</li>
                    <li>• Posting permissions enabled</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Connection Features */}
            <div className="space-y-3">
              <h4 className="font-medium">What you'll get:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Publish photos and videos to your feed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Schedule Instagram Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Create and schedule Reels</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Access detailed analytics and insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI-powered content optimization</span>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting to Instagram...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Instagram Account
                </>
              )}
            </Button>

            {/* Help Links */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Need help setting up your Instagram Business account?
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="link" size="sm" asChild>
                  <a 
                    href="https://business.instagram.com/getting-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs"
                  >
                    Instagram Business Guide
                  </a>
                </Button>
                <Button variant="link" size="sm" asChild>
                  <a 
                    href="/docs/troubleshooting/instagram-connection-issues" 
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