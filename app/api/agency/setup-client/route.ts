import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { aiMarketingAgency } from '@/lib/ai/agency-automation'

export async function POST(req: Request) {
  try {
    const setupData = await req.json()
    
    // Get cookies and create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create the client project
    const project = await aiMarketingAgency.createClientProject({
      user_id: user.id,
      business_name: setupData.businessName,
      industry: setupData.industry,
      target_audience: setupData.targetAudience,
      brand_voice: setupData.brandVoice,
      content_pillars: setupData.contentPillars,
      posting_frequency: setupData.postingFrequency,
      platforms: setupData.platforms,
      use_media_library: setupData.useMediaLibrary,
      use_ai_images: setupData.useAIImages,
      content_themes: setupData.contentThemes,
      optimal_times: setupData.optimalTimes || {}
    })

    // Update user profile to indicate they have an agency setup
    await supabase
      .from('profiles')
      .update({
        has_agency_setup: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      project,
      message: 'AI Marketing Agency setup completed successfully'
    })

  } catch (error) {
    console.error('Agency setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup AI Marketing Agency' },
      { status: 500 }
    )
  }
}