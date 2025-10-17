'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Hash, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface TrendingTopicsProps {
  topics: Array<{
    topic: string
    volume: number
    growth: number
  }>
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  const getTrendIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getTrendColor = (growth: number) => {
    if (growth > 20) return 'text-green-600'
    if (growth > 0) return 'text-green-500'
    return 'text-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Trending Topics
            </CardTitle>
            <CardDescription>
              Popular topics in your industry right now
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/ai-generator">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <div className="text-center py-6">
            <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No trending topics available</p>
            <p className="text-sm text-gray-400">
              Connect your social accounts to see trending topics
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">#{topic.topic}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.volume.toLocaleString()} posts
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {getTrendIcon(topic.growth)}
                    <span className={getTrendColor(topic.growth)}>
                      {topic.growth > 0 ? '+' : ''}{topic.growth}% growth
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/ai-generator?topic=${encodeURIComponent(topic.topic)}`}>
                      <Sparkles className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="w-full">
              <Hash className="w-4 h-4 mr-2" />
              Research Hashtags
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}