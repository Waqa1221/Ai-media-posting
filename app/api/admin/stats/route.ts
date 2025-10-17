import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser, logAdminAction } from '@/lib/admin/auth'

export async function GET(req: Request) {
  try {
    const adminUser = await getAdminUser()
    if (!adminUser || adminUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30d'

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get platform statistics
    const { data: stats, error: statsError } = await supabase.rpc('get_platform_stats')
    if (statsError) throw statsError

    // Get historical data for charts
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const { data: historicalStats, error: histError } = await supabase
      .from('platform_statistics')
      .select('*')
      .gte('date', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (histError) throw histError

    // Get recent admin activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('admin_audit_logs')
      .select(`
        *,
        admin_users!inner(
          profiles!inner(full_name, email)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (activityError) throw activityError

    // Get pending reports count
    const { count: pendingReports, error: reportsError } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (reportsError) throw reportsError

    await logAdminAction('view_dashboard_stats', 'dashboard', undefined, undefined, { period })

    return NextResponse.json({
      stats: {
        ...stats,
        pending_reports: pendingReports || 0
      },
      historical: historicalStats || [],
      recent_activity: recentActivity || []
    })
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}