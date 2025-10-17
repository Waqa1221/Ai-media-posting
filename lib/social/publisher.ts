import { createServiceRoleClient } from '@/lib/supabase/server'
import { PlatformFactory } from './platform-factory'
import type { SocialAccount, PublishResult, PostData } from './types'

interface PublishOptions {
  userId: string
  platform: string
  content: string
  mediaUrls?: string[]
  postId?: string
}

interface TokenRefreshResult {
  access_token: string
  refresh_token?: string
  expires_at: string
}

export async function publishToSocialPlatform(options: PublishOptions): Promise<PublishResult> {
  const { userId, platform, content, mediaUrls, postId } = options

  try {
    const supabase = createServiceRoleClient()
    
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single()

    if (error || !account) {
      throw new Error(`No active ${platform} account found for user`)
    }

    // Validate content for platform
    const requirements = PlatformFactory.getPlatformRequirements(platform)
    if (requirements) {
      if (requirements.requiresMedia && (!mediaUrls || mediaUrls.length === 0)) {
        throw new Error(`${platform} requires at least one media file`)
      }
      
      if (content.length > requirements.maxTextLength) {
        throw new Error(`Content exceeds ${platform} character limit of ${requirements.maxTextLength}`)
      }
      
      if (mediaUrls && mediaUrls.length > requirements.maxMediaCount) {
        throw new Error(`Too many media files. ${platform} supports maximum ${requirements.maxMediaCount}`)
      }
    }

    // Create platform instance and publish
    const platformInstance = PlatformFactory.createPlatform(account)
    const result = await platformInstance.publishPost(content, mediaUrls)

    // Store the result in database
    if (postId) {
      try {
        await supabase
          .from('post_publications')
          .insert({
            post_id: postId,
            platform: platform,
            platform_post_id: result.platformPostId || null,
            platform_url: result.url || null,
            published_at: result.success ? new Date().toISOString() : null,
            status: result.success ? 'published' : 'failed',
            error_message: result.error || null
          })
      } catch (dbError) {
        console.error('Failed to save publication record:', dbError)
      }
    }

    return result
  } catch (error) {
    console.error(`Error publishing to ${platform}:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Try to save failed publication record
    if (postId) {
      try {
        const supabase = createServiceRoleClient()
        await supabase
          .from('post_publications')
          .insert({
            post_id: postId,
            platform: platform,
            status: 'failed',
            error_message: errorMessage,
            created_at: new Date().toISOString()
          })
      } catch (dbError) {
        console.error('Failed to save failed publication record:', dbError)
      }
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

export async function refreshAccountToken(accountId: string): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient()
    
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error || !account) {
      throw new Error('Account not found')
    }

    // Platform-specific token refresh logic
    let newTokens: TokenRefreshResult | null = null
    
    switch (account.platform) {
      case 'twitter':
        // Twitter OAuth 2.0 refresh
        newTokens = await refreshTwitterToken(account.refresh_token)
        break
      case 'linkedin':
        // LinkedIn token refresh
        newTokens = await refreshLinkedInToken(account.refresh_token)
        break
      case 'instagram':
        // Instagram token refresh
        newTokens = await refreshInstagramToken(account.access_token)
        break
      default:
        throw new Error(`Token refresh not supported for ${account.platform}`)
    }

    if (newTokens) {
      await supabase
        .from('social_accounts')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || account.refresh_token,
          expires_at: newTokens.expires_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)

      return true
    }

    return false
  } catch (error) {
    console.error('Token refresh error:', error)
    return false
  }
}

async function refreshTwitterToken(refreshToken: string): Promise<TokenRefreshResult | null> {
  // Implement Twitter OAuth 2.0 token refresh
  return null
}

async function refreshLinkedInToken(refreshToken: string): Promise<TokenRefreshResult | null> {
  // Implement LinkedIn token refresh
  return null
}

async function refreshInstagramToken(accessToken: string): Promise<TokenRefreshResult | null> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
    )
    
    const data = await response.json()
    
    if (data.access_token) {
      return {
        access_token: data.access_token,
        refresh_token: accessToken, // Instagram uses the same token for refresh
        expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString()
      }
    }
    
    return null
  } catch (error) {
    console.error('Instagram token refresh error:', error)
    return null
  }
}