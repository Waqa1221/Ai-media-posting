import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin/auth'

export async function GET(req: Request) {
  try {
    // Check admin access
    const adminUser = await getAdminUser()
    if (!adminUser || !['super_admin', 'admin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const supabase = await createClient()

    // Get trial statistics
    const { data: stats, error: statsError } = await supabase.rpc('get_trial_statistics', {
      p_start_date: startDate
    })

    if (statsError) throw statsError

    // Get detailed trial data
    const { data: trialDetails, error: detailsError } = await supabase
      .from('trial_analytics')
      .select(`
        *,
        profiles!inner(email, full_name, created_at)
      `)
      .gte('trial_started_at', startDate)
      .order('trial_started_at', { ascending: false })

    if (detailsError) throw detailsError

    // Get expiring trials
    const { data: expiringTrials, error: expiringError } = await supabase.rpc('get_expiring_trials', {
      p_days_ahead: 2
    })

    if (expiringError) throw expiringError

    return NextResponse.json({
      statistics: stats,
      trialDetails: trialDetails || [],
      expiringTrials: expiringTrials || []
    })

  } catch (error) {
    console.error('Trial analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}