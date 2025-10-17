import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { refreshAccountToken } from '@/lib/social/publisher'

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json()
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const refreshed = await refreshAccountToken(accountId)

    if (refreshed) {
      return NextResponse.json({ 
        success: true, 
        message: 'Account token refreshed successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to refresh account token' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Account refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh account' },
      { status: 500 }
    )
  }
}