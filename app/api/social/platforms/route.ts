import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
      .from('social_platforms')
      .select('*')
      .order('display_name')

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: platforms, error } = await query

    if (error) {
      console.error('Error fetching social platforms:', error)
      return NextResponse.json(
        { error: 'Failed to fetch social platforms' },
        { status: 500 }
      )
    }

    // Get user's connected accounts for each platform
    const { data: userAccounts } = await supabase
      .from('social_accounts')
      .select('platform, id, is_active, connection_status')
      .eq('user_id', user.id)

    const accountsByPlatform = userAccounts?.reduce((acc, account) => {
      if (!acc[account.platform]) {
        acc[account.platform] = []
      }
      acc[account.platform].push(account)
      return acc
    }, {} as Record<string, any[]>) || {}

    // Enhance platforms with user connection status
    const enhancedPlatforms = platforms?.map(platform => ({
      ...platform,
      user_accounts: accountsByPlatform[platform.platform_name] || [],
      is_connected: (accountsByPlatform[platform.platform_name] || []).some(
        account => account.is_active && account.connection_status === 'connected'
      ),
      connected_accounts_count: (accountsByPlatform[platform.platform_name] || []).filter(
        account => account.is_active && account.connection_status === 'connected'
      ).length
    }))

    return NextResponse.json({
      platforms: enhancedPlatforms || [],
      total: enhancedPlatforms?.length || 0
    })

  } catch (error) {
    console.error('Social platforms API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}