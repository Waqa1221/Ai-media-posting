'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Clock,
  Lightbulb,
  BarChart3,
  Hash,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

interface AIInsightsWidgetProps {
  posts: any[]
  analytics: any[]
}

export function AIInsightsWidget({ posts, analytics }: AIInsightsWidgetProps) {
  const insights = useMemo(() => {
    const aiPosts = posts.filter(p => p.ai_generated && p.status === 'published')
    const manualPosts = posts.filter(p => !p.ai_generated && p.status === 'published')
    
    if (aiPosts.length === 0 && manualPosts.length === 0) {
      return {
        aiPerformance: 0,
        manualPerformance: 0,
        recommendations: [],
        bestAIPost: null,
        aiUsageRate: 0
      }
    }

    // Calculate average engagement for AI vs manual posts
    const aiEngagement = aiPosts.reduce((sum, post) => {
      const engagement = (post.engagement_data?.likes || 0) + 
                        (post.engagement_data?.comments || 0) + 
                        (post.engagement_data?.shares || 0)
      return sum + engagement
    }, 0) / Math.max(aiPosts.length, 1)

    const manualEngagement = manualPosts.reduce((sum, post) => {
      const engagement = (post.engagement_data?.likes || 0) + 
                        (post.engagement_data?.comments || 0) + 
                        (post.engagement_data?.shares || 0)
      return sum + engagement
    }, 0) / Math.max(manualPosts.length, 1)

    // Find best performing AI post
    const bestAIPost = aiPosts.reduce((best, post) => {
      const currentEngagement = (post.engagement_data?.likes || 0) + 
                               (post.engagement_data?.comments || 0) + 
                               (post.engagement_data?.shares || 0)
      const bestEngagement = (best?.engagement_data?.likes || 0) + 
                            (best?.engagement_data?.comments || 0) + 
                            (best?.engagement_data?.shares || 0)
      return currentEngagement > bestEngagement ? post : best
    }, null)

    // Calculate AI usage rate
    const aiUsageRate = posts.length > 0 ? (aiPosts.length / posts.length) * 100 : 0

    // Generate recommendations
    const recommendations = []
    
    if (aiUsageRate < 30) {
      recommendations.push({
        type: 'usage',
        title: 'Increase AI Usage',
        description: `Only ${aiUsageRate.toFixed(0)}% of your posts use AI. Try generating more content with AI for better performance.`,
        action: 'Generate AI Content',
        color: 'text-purple-600',
        icon: Sparkles
      })
    }

    if (aiEngagement > manualEngagement && manualPosts.length > 0) {
      recommendations.push({
        type: 'performance',
        title: 'AI Outperforming Manual',
        description: `AI posts get ${((aiEngagement / manualEngagement - 1) * 100).toFixed(0)}% more engagement. Consider using AI more often.`,
        action: 'Use AI Generator',
        color: 'text-green-600',
        icon: TrendingUp
      })
    }

    if (posts.length > 5 && aiPosts.length === 0) {
      recommendations.push({
        type: 'opportunity',
        title: 'Try AI Content',
        description: 'You haven\'t used AI content generation yet. It could significantly boost your engagement.',
        action: 'Generate First AI Post',
        color: 'text-blue-600',
        icon: Target
      })
    }

    return {
      aiPerformance: Math.round(aiEngagement),
      manualPerformance: Math.round(manualEngagement),
      recommendations,
      bestAIPost,
      aiUsageRate
    }
  }, [posts, analytics])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Performance Insights
        </CardTitle>
        <CardDescription>
          How AI is improving your content performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {insights.aiPerformance}
            </div>
            <div className="text-sm text-muted-foreground">AI Posts Avg</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {insights.manualPerformance}
            </div>
            <div className="text-sm text-muted-foreground">Manual Posts Avg</div>
          </div>
        </div>

        {/* AI Usage Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Usage Rate</span>
            <span className="text-sm text-muted-foreground">
              {insights.aiUsageRate.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(insights.aiUsageRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Best AI Post */}
        {insights.bestAIPost && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800">
                  Top AI Post
                </h4>
                <p className="text-xs text-green-600 mt-1 line-clamp-2">
                  {insights.bestAIPost.content?.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                  <span>❤️ {insights.bestAIPost.engagement_data?.likes || 0}</span>
                  <span>💬 {insights.bestAIPost.engagement_data?.comments || 0}</span>
                  <span>🔄 {insights.bestAIPost.engagement_data?.shares || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">AI Recommendations</h4>
            {insights.recommendations.map((rec, index) => {
              const IconComponent = rec.icon
              return (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <IconComponent className={`w-4 h-4 mt-0.5 ${rec.color}`} />
                    <div className="flex-1">
                      <h5 className="text-sm font-medium">{rec.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                      <Button size="sm" variant="outline" className="mt-2" asChild>
                        <Link href="/dashboard/ai-generator">
                          {rec.action}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No Data State */}
        {posts.length === 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Start creating content to see AI performance insights. 
              <Button variant="link" className="p-0 h-auto ml-1" asChild>
                <Link href="/dashboard/ai-generator">
                  Generate your first AI post
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}