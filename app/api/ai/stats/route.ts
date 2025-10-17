import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { aiContentGenerator } from '@/lib/ai/generator'
import { aiCache } from '@/lib/ai/cache'
import { aiRateLimiter } from '@/lib/ai/rate-limiter'

export async function GET(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [usageStats, cacheStats, rateLimitInfo] = await Promise.all([
      aiContentGenerator.getUsageStats(user.id),
      aiCache.getStats(),
      aiRateLimiter.getRemainingRequests(user.id),
    ])

    return NextResponse.json({
      usage: usageStats,
      cache: cacheStats,
      rateLimit: {
        remaining: rateLimitInfo,
        resetTime: await aiRateLimiter.getResetTime(user.id),
      },
    })
  } catch (error) {
    console.error('AI stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}