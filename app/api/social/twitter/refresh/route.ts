import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Load user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to load profile' },
        { status: 500 }
      )
    }

    // Load posts data
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (postsError) {
      return NextResponse.json(
        { error: 'Failed to load posts' },
        { status: 500 }
      )
    }

    // Load social accounts
    const { data: socialAccounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (accountsError) {
      return NextResponse.json(
        { error: 'Failed to load social accounts' },
        { status: 500 }
      )
    }

    // Load analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: true })

    if (analyticsError) {
      return NextResponse.json(
        { error: 'Failed to load analytics' },
        { status: 500 }
      )
    }

    // Load usage data
    const { data: usage, error: usageError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)

    if (usageError) {
      return NextResponse.json(
        { error: 'Failed to load usage data' },
        { status: 500 }
      )
    }

    // Load AI generations
    const { data: aiGenerations, error: aiError } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (aiError) {
      return NextResponse.json(
        { error: 'Failed to load AI generations' },
        { status: 500 }
      )
    }

    // Calculate stats
    const publishedPosts = posts.filter(p => p.status === 'published')
    const scheduledPosts = posts.filter(p => p.status === 'scheduled')
    const draftPosts = posts.filter(p => p.status === 'draft')

    const totalEngagement = publishedPosts.reduce((sum, post) => {
      const engagement = post.engagement_data || {}
      return sum + (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
    }, 0)

    const totalImpressions = publishedPosts.reduce((sum, post) => {
      const engagement = post.engagement_data || {}
      return sum + (engagement.impressions || 0)
    }, 0)

    const engagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0

    // Calculate weekly growth
    const lastWeekPosts = posts.filter(p => 
      new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    const previousWeekPosts = posts.filter(p => {
      const date = new Date(p.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      return date > twoWeeksAgo && date <= weekAgo
    })

    const weeklyGrowth = previousWeekPosts.length > 0 
      ? ((lastWeekPosts.length - previousWeekPosts.length) / previousWeekPosts.length) * 100 
      : 0

    // Find top performing platform
    const platformEngagement: Record<string, number> = {}
    publishedPosts.forEach(post => {
      post.platforms?.forEach((platform: string) => {
        const engagement = (post.engagement_data?.likes || 0) + 
                          (post.engagement_data?.comments || 0) + 
                          (post.engagement_data?.shares || 0)
        platformEngagement[platform] = (platformEngagement[platform] || 0) + engagement
      })
    })

    const topPlatform = Object.entries(platformEngagement).reduce((best, [platform, engagement]) => {
      return engagement > best.engagement ? { platform, engagement } : best
    }, { platform: 'instagram', engagement: 0 })

    return NextResponse.json({
      user,
      profile,
      stats: {
        totalPosts: posts.length,
        scheduledPosts: scheduledPosts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalEngagement,
        engagementRate: Math.round(engagementRate * 100) / 100,
        aiGenerations: aiGenerations.length,
        connectedAccounts: socialAccounts.length,
        weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
        monthlyReach: totalImpressions,
        avgEngagementRate: engagementRate,
        topPerformingPlatform: topPlatform.platform,
        contentScore: Math.min(100, Math.round((totalEngagement / Math.max(publishedPosts.length, 1)) * 2)),
        automationSavings: Math.round((aiGenerations.length * 0.5 + scheduledPosts.length * 0.25) * 10) / 10
      },
      recentPosts: posts.slice(0, 10),
      upcomingPosts: scheduledPosts
        .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
        .slice(0, 8),
      analytics: analytics || [],
      usageData: usage.reduce((acc, item) => {
        acc[item.limit_type] = item
        return acc
      }, {} as any),
      notifications: [],
      automations: [],
      teamMembers: [],
      trendingTopics: [
        { topic: 'AI Technology', volume: 15420, growth: 23 },
        { topic: 'Social Media Marketing', volume: 8930, growth: 18 },
        { topic: 'Content Creation', volume: 6750, growth: 31 },
        { topic: 'Digital Transformation', volume: 4320, growth: 12 }
      ],
      contentCalendar: scheduledPosts.slice(0, 15)
    })

  } catch (error) {
    console.error('Dashboard data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}