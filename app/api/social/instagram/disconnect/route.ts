import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deactivate Instagram account
    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('platform', 'instagram')

    if (updateError) {
      throw updateError
    }

    // Cancel any pending Instagram posts
    await supabase
      .from('scheduling_queue')
      .update({ 
        status: 'cancelled',
        error_message: 'Instagram account disconnected'
      })
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .eq('status', 'pending')

    return NextResponse.json({
      success: true,
      message: 'Instagram account disconnected successfully'
    })

  } catch (error) {
    console.error('Instagram disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram account' },
      { status: 500 }
    )
  }
}