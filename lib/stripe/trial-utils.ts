import { createClient } from '@/lib/supabase/client'
import { TRIAL_CONFIG } from './trial-config'

/**
 * Utility functions for trial management
 */

export interface TrialStatus {
  hasTrialAccess: boolean
  isInTrial: boolean
  trialEndsAt: Date | null
  daysRemaining: number
  subscriptionStatus: string
  canStartTrial: boolean
}

/**
 * Get comprehensive trial status for a user
 */
export async function getComprehensiveTrialStatus(): Promise<TrialStatus> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        hasTrialAccess: false,
        isInTrial: false,
        trialEndsAt: null,
        daysRemaining: 0,
        subscriptionStatus: 'none',
        canStartTrial: false
      }
    }

    // Get profile data with comprehensive error handling
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, created_at, trial_ends_at, trial_started_at, subscription_ends_at, email_verified, account_status')
      .eq('id', user.id)
      .maybeSingle()

    // If profile doesn't exist, try to create it
    if (profileError || !profile) {
      console.warn('Profile not found, attempting to create:', { userId: user.id, email: user.email })
      
      try {
        // Use the helper function to ensure profile exists
        const { ensureUserProfile } = await import('@/lib/supabase/client')
        const profileCreated = await ensureUserProfile(
          user.id, 
          user.email || '', 
          user.user_metadata?.full_name
        )
        
        if (profileCreated) {
          // Try to fetch the profile again
          const { data: newProfile, error: newProfileError } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status, created_at, trial_ends_at, trial_started_at, subscription_ends_at, email_verified, account_status')
            .eq('id', user.id)
            .maybeSingle()
          
          if (newProfileError || !newProfile) {
            console.error('Failed to create or fetch profile after creation attempt')
            return {
              hasTrialAccess: false,
              isInTrial: false,
              trialEndsAt: null,
              daysRemaining: 0,
              subscriptionStatus: 'none',
              canStartTrial: false
            }
          }
          
          // Use the newly created profile
          profile = newProfile
        } else {
          console.error('Failed to create user profile')
          return {
            hasTrialAccess: false,
            isInTrial: false,
            trialEndsAt: null,
            daysRemaining: 0,
            subscriptionStatus: 'none',
            canStartTrial: false
          }
        }
      } catch (createError) {
        console.error('Error creating profile:', createError)
        return {
          hasTrialAccess: false,
          isInTrial: false,
          trialEndsAt: null,
          daysRemaining: 0,
          subscriptionStatus: 'none',
          canStartTrial: false
        }
      }
    }

    const isInTrial = profile.subscription_tier === 'trial' || profile.account_status === 'trial'
    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : 
      (isInTrial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null) // Default to 7 days from now if in trial
    const daysRemaining = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
    
    // Simplified: user can start trial if they're not already in trial or premium
    const canStartTrial = !isInTrial && profile.subscription_tier !== 'premium'

    return {
      hasTrialAccess: isInTrial || profile.subscription_tier === 'premium',
      isInTrial,
      trialEndsAt,
      daysRemaining,
      subscriptionStatus: profile.subscription_status || 'none',
      canStartTrial: canStartTrial && profile.subscription_tier !== 'premium'
    }
  } catch (error) {
    console.warn('Error getting trial status, returning safe defaults:', error)
    
    // Return safe defaults if there's an error
    return {
      hasTrialAccess: false,
      isInTrial: false,
      trialEndsAt: null,
      daysRemaining: 0,
      subscriptionStatus: 'none',
      canStartTrial: false
    }
  }
}

/**
 * Check if user has access to premium features
 */
export async function hasFeatureAccess(feature: string): Promise<boolean> {
  const trialStatus = await getComprehensiveTrialStatus()
  
  // During trial or active subscription, user has access to all features
  if (trialStatus.hasTrialAccess) {
    return true
  }

  // Define free tier features
  const freeTierFeatures = [
    'basic_posting',
    'limited_ai_generation', // e.g., 5 per month
    'basic_analytics'
  ]

  return freeTierFeatures.includes(feature)
}

/**
 * Get usage limits based on subscription status
 */
export async function getUsageLimits() {
  const trialStatus = await getComprehensiveTrialStatus()
  
  if (trialStatus.hasTrialAccess) {
    // Unlimited access during trial and premium subscription
    return {
      posts_per_month: -1, // Unlimited
      ai_generations_per_month: -1, // Unlimited
      social_accounts: -1, // Unlimited
      storage_gb: 100
    }
  }

  // Default limits for users without access
  return {
    posts_per_month: 0,
    ai_generations_per_month: 0,
    social_accounts: 0,
    storage_gb: 1
  }
}

/**
 * Format trial status for display
 */
export function formatTrialStatus(trialStatus: TrialStatus): string {
  if (trialStatus.isInTrial) {
    if (trialStatus.daysRemaining === 0) {
      return 'Trial expires today'
    } else if (trialStatus.daysRemaining === 1) {
      return 'Trial expires tomorrow'
    } else {
      return `${trialStatus.daysRemaining} days left in trial`
    }
  }

  switch (trialStatus.subscriptionStatus) {
    case 'active':
      return 'Subscription active'
    case 'past_due':
      return 'Payment overdue'
    case 'canceled':
      return 'Subscription canceled'
    default:
      return 'No active subscription'
  }
}

/**
 * Calculate trial progress percentage
 */
export function getTrialProgress(trialStatus: TrialStatus): number {
  if (!trialStatus.isInTrial || !trialStatus.trialEndsAt) {
    return 0
  }

  const totalTrialDays = TRIAL_CONFIG.trialDays
  const daysUsed = totalTrialDays - trialStatus.daysRemaining
  return Math.max(0, Math.min(100, (daysUsed / totalTrialDays) * 100))
}

/**
 * Get trial urgency level for UI styling
 */
export function getTrialUrgency(daysRemaining: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysRemaining <= 0) return 'critical'
  if (daysRemaining <= 1) return 'high'
  if (daysRemaining <= 3) return 'medium'
  return 'low'
}

/**
 * Format currency amount
 */
export function formatCurrency(amountCents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100)
}

/**
 * Validate trial eligibility
 */
export async function validateTrialEligibility(): Promise<{
  eligible: boolean
  reason?: string
}> {
  const trialStatus = await getComprehensiveTrialStatus()
  
  if (trialStatus.isInTrial) {
    return {
      eligible: false,
      reason: 'Already in trial period'
    }
  }

  if (trialStatus.subscriptionStatus === 'active') {
    return {
      eligible: false,
      reason: 'Already has active subscription'
    }
  }

  if (!trialStatus.canStartTrial) {
    return {
      eligible: false,
      reason: 'Trial already used'
    }
  }

  return {
    eligible: true
  }
}

/**
 * Get trial CTA text based on status
 */
export function getTrialCTAText(trialStatus: TrialStatus): string {
  if (trialStatus.canStartTrial) {
    return 'Start 7-Day Free Trial'
  }

  if (trialStatus.isInTrial) {
    return `${trialStatus.daysRemaining} Days Left`
  }

  if (trialStatus.subscriptionStatus === 'active') {
    return 'Subscription Active'
  }

  return 'Upgrade Now'
}