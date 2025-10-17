'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Sparkles, 
  Bell,
  Clock,
  User,
  Calendar
} from 'lucide-react'

interface RecentActivityProps {
  posts: Array<{
    id: string
    title: string
    platform: string
    status: string
    createdAt: string
  }>
  aiGenerations: Array<{
    id: string
    type: string
    createdAt: string
  }>
  notifications: Array<{
    id: string
    message: string
    type: string
    createdAt: string
  }>
}

export function RecentActivity({ posts, aiGenerations, notifications }: RecentActivityProps) {
  // Combine all activities and sort by date
  const activities = [
    ...posts.map(post => ({
      id: post.id,
      type: 'post',
      title: post.title,
      subtitle: `${post.platform} • ${post.status}`,
      createdAt: post.createdAt,
      icon: MessageSquare
    })),
    ...aiGenerations.map(gen => ({
      id: gen.id,
      type: 'ai',
      title: `AI ${gen.type} generated`,
      subtitle: 'Content creation',
      createdAt: gen.createdAt,
      icon: Sparkles
    })),
    ...notifications.map(notif => ({
      id: notif.id,
      type: 'notification',
      title: notif.message,
      subtitle: notif.type,
      createdAt: notif.createdAt,
      icon: Bell
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10) // Show only the 10 most recent

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-800'
      case 'ai': return 'bg-purple-100 text-purple-800'
      case 'notification': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <activity.icon className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                    >
                      {activity.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">
                      {activity.subtitle}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}