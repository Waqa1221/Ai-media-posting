import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { automationScheduler } from '@/lib/automation/scheduler'

export async function GET(req: Request) {
  try {
    // Get cookies and create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rules, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Get automation rules error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automation rules' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const ruleData = await req.json()
    
    // Get cookies and create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rule, error } = await supabase
      .from('automation_rules')
      .insert({
        user_id: user.id,
        name: ruleData.name,
        description: ruleData.description,
        trigger_type: ruleData.trigger_type,
        trigger_conditions: ruleData.trigger_conditions,
        actions: ruleData.actions,
        is_active: ruleData.is_active || true,
        schedule_expression: ruleData.schedule_expression
      })
      .select()
      .single()

    if (error) throw error

    // If it's a scheduled rule, add it to the scheduler
    if (rule.trigger_type === 'schedule' && rule.schedule_expression) {
      automationScheduler.scheduleCustomJob(
        `rule_${rule.id}`,
        rule.schedule_expression,
        async () => {
          await executeRule(rule)
        }
      )
    }

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('Create automation rule error:', error)
    return NextResponse.json(
      { error: 'Failed to create automation rule' },
      { status: 500 }
    )
  }
}

async function executeRule(rule: any) {
  // Implementation for executing automation rules
  console.log(`Executing automation rule: ${rule.name}`)
}