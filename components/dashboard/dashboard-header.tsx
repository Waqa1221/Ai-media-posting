'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Settings, Bell, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface DashboardHeaderProps {
  user: any
  profile?: any
  onRefresh: () => void
}

export function DashboardHeader({ user, profile, onRefresh }: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }, [onRefresh])

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const getSubscriptionColor = useCallback((tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const displayName = useMemo(() => {
    return profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  }, [profile?.full_name, user?.user_metadata?.full_name, user?.email])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting}, {displayName}! 👋
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-gray-600">
            Welcome back to your social media command center
          </p>
          <Badge className={getSubscriptionColor(profile?.subscription_tier)}>
            {profile?.subscription_tier?.charAt(0).toUpperCase() + profile?.subscription_tier?.slice(1) || 'Starter'}
          </Badge>
        </div>
        {(profile?.last_login_at || user?.last_sign_in_at) && (
          <p className="text-sm text-gray-500 mt-1">
            Last login: {formatDistanceToNow(new Date(profile?.last_login_at || user?.last_sign_in_at), { addSuffix: true })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/settings">
            <User className="w-4 h-4" />
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/settings">
            <Settings className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}