'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  Users,
  Eye,
  ArrowUpIcon,
  ArrowDownIcon,
  BarChart3,
  FileText
} from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalPosts: number
    scheduledPosts: number
    publishedPosts: number
    draftPosts: number
    totalEngagement: number
    engagementRate: number
    aiGenerations: number
    connectedAccounts: number
    weeklyGrowth: number
    monthlyReach: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = useMemo(() => [
    {
      title: 'Total Posts',
      value: (stats.totalPosts || 0).toLocaleString(),
      change: `${stats.weeklyGrowth >= 0 ? '+' : ''}${stats.weeklyGrowth}%`,
      changeType: stats.weeklyGrowth >= 0 ? 'positive' : 'negative',
      icon: MessageSquare,
      description: 'All time posts',
      trend: stats.weeklyGrowth
    },
    {
      title: 'Scheduled',
      value: (stats.scheduledPosts || 0).toLocaleString(),
      change: 'Ready to publish',
      changeType: 'neutral',
      icon: Calendar,
      description: 'Upcoming posts',
      trend: 0
    },
    {
      title: 'Engagement',
      value: (stats.totalEngagement || 0).toLocaleString(),
      change: `${stats.engagementRate}% rate`,
      changeType: stats.engagementRate > 3 ? 'positive' : 'neutral',
      icon: TrendingUp,
      description: 'Total interactions',
      trend: stats.engagementRate
    },
    {
      title: 'Monthly Reach',
      value: (stats.monthlyReach || 0).toLocaleString(),
      change: 'Impressions',
      changeType: 'neutral',
      icon: Eye,
      description: 'People reached',
      trend: 0
    },
    {
      title: 'AI Generations',
      value: (stats.aiGenerations || 0).toLocaleString(),
      change: 'This month',
      changeType: 'neutral',
      icon: Sparkles,
      description: 'Content created',
      trend: 0
    },
    {
      title: 'Connected Accounts',
      value: (stats.connectedAccounts || 0).toLocaleString(),
      change: 'Active platforms',
      changeType: 'neutral',
      icon: Users,
      description: 'Social platforms',
      trend: 0
    },
    {
      title: 'Published',
      value: (stats.publishedPosts || 0).toLocaleString(),
      change: 'Live posts',
      changeType: 'positive',
      icon: BarChart3,
      description: 'Successfully posted',
      trend: 0
    },
    {
      title: 'Drafts',
      value: (stats.draftPosts || 0).toLocaleString(),
      change: 'In progress',
      changeType: 'neutral',
      icon: FileText,
      description: 'Work in progress',
      trend: 0
    }
  ], [stats])

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getChangeBadgeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpIcon className="w-3 h-3" />
    if (trend < 0) return <ArrowDownIcon className="w-3 h-3" />
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <card.icon className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </div>
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={`text-xs flex items-center gap-1 ${getChangeBadgeColor(card.changeType)}`}
              >
                {getTrendIcon(card.trend)}
                {card.change}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}