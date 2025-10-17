import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

// Create a singleton instance for better performance
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createClient = () =>
  supabaseInstance ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export const supabase = createClient()

// Enhanced helper function to ensure user profile exists
export async function ensureUserProfile(userId: string, email: string, fullName?: string, retries = 3): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('Error checking existing profile:', checkError)
    }
    
    if (existingProfile) {
      console.log('Profile already exists for user:', userId)
      return true
    }
    
    // Try to use the database function first
    try {
      const { data, error } = await supabase.rpc('create_user_profile', {
        p_user_id: userId,
        p_email: email,
        p_full_name: fullName || null,
        p_company_name: null
      })
      
      if (!error) {
        console.log('User profile created successfully via function:', data)
        return true
      } else {
        console.warn('Database function failed, trying direct insert:', error)
      }
    } catch (funcError) {
      console.warn('Database function not available, trying direct insert:', funcError)
    }
    
    // Fallback to direct insert if function fails
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || null,
        subscription_tier: 'premium',
        subscription_status: 'active',
        email_verified: false,
        onboarding_completed: false,
        has_agency_setup: false,
        timezone: 'UTC',
        language: 'en'
      })
      .select()
      .single()
    
    if (insertError) {
      console.warn('Failed to create user profile via direct insert:', insertError)
      
      // Retry on transient errors
      if (retries > 0 && (insertError.code === '08000' || insertError.code === '08003' || insertError.code === '23505' || insertError.code === '42P01')) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return ensureUserProfile(userId, email, fullName, retries - 1)
      }
      
      return false
    }
    
    console.log('User profile created successfully via direct insert:', insertData)
    return true
  } catch (error) {
    console.warn('Error in ensureUserProfile:', error)
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return ensureUserProfile(userId, email, fullName, retries - 1)
    }
    return false
  }
}

// Enhanced function to get social account connection status
export async function getSocialAccountStatus(userId: string, platform: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .maybeSingle()
    
    if (error) {
      console.error('Error checking social account status:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getSocialAccountStatus:', error)
    return null
  }
}

// Function to handle social account connection errors
export async function handleSocialAccountError(accountId: string, errorMessage: string, shouldDeactivate = false) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.rpc('handle_social_account_error', {
      p_account_id: accountId,
      p_error_message: errorMessage,
      p_should_deactivate: shouldDeactivate
    })
    
    if (error) {
      console.error('Error handling social account error:', error)
    }
  } catch (error) {
    console.error('Error in handleSocialAccountError:', error)
  }
}
// Helper function to check user permissions
export async function checkUserPermissions(userId: string, permission: string) {
  const supabase = createClient()
  
  try {
    // Use the database function to check usage limits
    const { data: hasAccess, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: userId,
      p_limit_type: permission
    })
    
    if (error) {
      console.error('Error checking user permissions:', error)
      return false
    }
    
    return hasAccess
  } catch (error) {
    console.error('Error checking user permissions:', error)
    return false
  }
}

// Helper function to get user usage limits
export async function getUserUsageLimits(userId: string) {
  const supabase = createClient()
  
  try {
    const { data: limits } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId)
    
    return limits || []
  } catch (error) {
    console.error('Error getting usage limits:', error)
    return []
  }
}