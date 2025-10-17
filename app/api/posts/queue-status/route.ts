import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('scheduling_queue')
      .select(`
        *,
        posts!inner(title, content, user_id)
      `)
      .eq('posts.user_id', user.id)
      .order('scheduled_for', { ascending: true })

    if (postId) {
      query = query.eq('post_id', postId)
    }

    const { data: queueItems, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch queue status' },
        { status: 500 }
      )
    }

    // Get queue statistics
    const stats = {
      total: queueItems?.length || 0,
      pending: queueItems?.filter(item => item.status === 'pending').length || 0,
      completed: queueItems?.filter(item => item.status === 'completed').length || 0,
      failed: queueItems?.filter(item => item.status === 'failed').length || 0,
      nextScheduled: queueItems?.find(item => 
        item.status === 'pending' && 
        new Date(item.scheduled_for) > new Date()
      )
    }

    return NextResponse.json({
      queueItems: queueItems || [],
      stats
    })

  } catch (error) {
    console.error('Queue status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { postId, platform } = await req.json()
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Remove from scheduling queue
    let query = supabase
      .from('scheduling_queue')
      .delete()
      .eq('user_id', user.id)

    if (postId) {
      query = query.eq('post_id', postId)
    }

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove from queue' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from scheduling queue'
    })

  } catch (error) {
    console.error('Remove from queue API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}