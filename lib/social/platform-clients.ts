import { createClient } from '@/lib/supabase/server'

export interface SocialProfile {
  platformUserId: string
  username?: string
  displayName?: string
  email?: string
  avatarUrl?: string
  profileUrl?: string
  followerCount?: number
  followingCount?: number
  postsCount?: number
  accountType?: string
  isVerified?: boolean
  platformData?: Record<string, any>
}

export interface PublishResult {
  success: boolean
  platformPostId?: string
  platformPostUrl?: string
  error?: string
  metadata?: Record<string, any>
}

export interface AnalyticsData {
  impressions?: number
  reach?: number
  likes?: number
  comments?: number
  shares?: number
  clicks?: number
  saves?: number
  engagementRate?: number
}

export abstract class BasePlatformClient {
  protected accessToken: string
  protected platform: string
  protected supabase = createClient()

  constructor(accessToken: string, platform: string) {
    this.accessToken = accessToken
    this.platform = platform
  }

  abstract getProfile(): Promise<SocialProfile>
  abstract publishPost(content: string, mediaUrls?: string[], metadata?: Record<string, any>): Promise<PublishResult>
  abstract getAnalytics(postId: string): Promise<AnalyticsData>
  abstract refreshToken?(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>
}

// Instagram Platform Client
export class InstagramClient extends BasePlatformClient {
  constructor(accessToken: string) {
    super(accessToken, 'instagram')
  }

  async getProfile(): Promise<SocialProfile> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      )

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        platformUserId: data.id,
        username: data.username,
        displayName: data.username,
        postsCount: data.media_count || 0,
        accountType: data.account_type,
        profileUrl: `https://instagram.com/${data.username}`,
        platformData: {
          account_type: data.account_type,
          media_count: data.media_count
        }
      }
    } catch (error) {
      console.error('Instagram profile fetch error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to fetch Instagram profile: ${errorMessage}`)
    }
  }

  async publishPost(content: string, mediaUrls?: string[]): Promise<PublishResult> {
    try {
      if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('Instagram posts require at least one media file')
      }

      // For Instagram, we need to create media containers first
      const mediaContainers = []
      
      for (const mediaUrl of mediaUrls) {
        const containerResponse = await fetch(
          `https://graph.instagram.com/me/media`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image_url: mediaUrl,
              caption: content,
              access_token: this.accessToken
            })
          }
        )

        if (!containerResponse.ok) {
          throw new Error(`Failed to create media container: ${containerResponse.status}`)
        }

        const containerData = await containerResponse.json()
        mediaContainers.push(containerData.id)
      }

      // Publish the media container
      const publishResponse = await fetch(
        `https://graph.instagram.com/me/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            creation_id: mediaContainers[0],
            access_token: this.accessToken
          })
        }
      )

      if (!publishResponse.ok) {
        throw new Error(`Failed to publish Instagram post: ${publishResponse.status}`)
      }

      const publishData = await publishResponse.json()

      return {
        success: true,
        platformPostId: publishData.id,
        platformPostUrl: `https://instagram.com/p/${publishData.id}`,
        metadata: {
          mediaContainers,
          mediaCount: mediaUrls.length
        }
      }
    } catch (error) {
      console.error('Instagram publish error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/${postId}/insights?metric=impressions,reach,likes,comments,saves,shares&access_token=${this.accessToken}`
      )

      if (!response.ok) {
        throw new Error(`Instagram analytics error: ${response.status}`)
      }

      const data = await response.json()
      const metrics: AnalyticsData = {}

      data.data?.forEach((metric: any) => {
        const value = metric.values?.[0]?.value || 0
        switch (metric.name) {
          case 'impressions':
            metrics.impressions = value
            break
          case 'reach':
            metrics.reach = value
            break
          case 'likes':
            metrics.likes = value
            break
          case 'comments':
            metrics.comments = value
            break
          case 'saves':
            metrics.saves = value
            break
          case 'shares':
            metrics.shares = value
            break
        }
      })

      // Calculate engagement rate
      if (metrics.impressions && metrics.impressions > 0) {
        const totalEngagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0) + (metrics.saves || 0)
        metrics.engagementRate = (totalEngagement / metrics.impressions) * 100
      }

      return metrics
    } catch (error) {
      console.error('Instagram analytics error:', error)
      return {}
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${refreshToken}`
      )

      if (!response.ok) {
        throw new Error(`Instagram token refresh error: ${response.status}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined
      }
    } catch (error) {
      console.error('Instagram token refresh error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to refresh Instagram token: ${errorMessage}`)
    }
  }
}

// LinkedIn Platform Client
export class LinkedInClient extends BasePlatformClient {
  private platformUserId: string = ''

  constructor(accessToken: string) {
    super(accessToken, 'linkedin')
  }

  async getProfile(): Promise<SocialProfile> {
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/people/(id:~)?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`)
      }

      const data = await response.json()
      const displayName = `${data.localizedFirstName} ${data.localizedLastName}`
      const profileImageUrl = data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
      
      // Store platformUserId for use in publishPost
      this.platformUserId = data.id

      return {
        platformUserId: data.id,
        displayName,
        avatarUrl: profileImageUrl,
        profileUrl: `https://linkedin.com/in/${data.id}`,
        platformData: {
          firstName: data.localizedFirstName,
          lastName: data.localizedLastName
        }
      }
    } catch (error) {
      console.error('LinkedIn profile fetch error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to fetch LinkedIn profile: ${errorMessage}`)
    }
  }

  async publishPost(content: string, mediaUrls?: string[]): Promise<PublishResult> {
    try {
      const postData: any = {
        author: `urn:li:person:${this.platformUserId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: mediaUrls && mediaUrls.length > 0 ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }

      const response = await fetch(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      )

      if (!response.ok) {
        throw new Error(`LinkedIn publish error: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        platformPostId: data.id,
        platformPostUrl: `https://linkedin.com/feed/update/${data.id}`,
        metadata: {
          mediaCount: mediaUrls?.length || 0
        }
      }
    } catch (error) {
      console.error('LinkedIn publish error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    try {
      const response = await fetch(
        `https://api.linkedin.com/v2/socialActions/${postId}/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`LinkedIn analytics error: ${response.status}`)
      }

      const data = await response.json()

      return {
        likes: data.numLikes || 0,
        comments: data.numComments || 0,
        shares: data.numShares || 0,
        impressions: data.numViews || 0
      }
    } catch (error) {
      console.error('LinkedIn analytics error:', error)
      return {}
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
    // LinkedIn doesn't have a standard token refresh endpoint like other platforms
    // In a real implementation, you would need to re-authenticate the user
    throw new Error('LinkedIn token refresh requires re-authentication')
  }
}

// Facebook Platform Client
export class FacebookClient extends BasePlatformClient {
  constructor(accessToken: string) {
    super(accessToken, 'facebook')
  }

  async getProfile(): Promise<SocialProfile> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${this.accessToken}`
      )

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        platformUserId: data.id,
        displayName: data.name,
        email: data.email,
        avatarUrl: data.picture?.data?.url,
        profileUrl: `https://facebook.com/${data.id}`,
        platformData: data
      }
    } catch (error) {
      console.error('Facebook profile fetch error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to fetch Facebook profile: ${errorMessage}`)
    }
  }

  async publishPost(content: string, mediaUrls?: string[]): Promise<PublishResult> {
    try {
      const postData: any = {
        message: content,
        access_token: this.accessToken
      }

      if (mediaUrls && mediaUrls.length > 0) {
        postData.link = mediaUrls[0] // Facebook supports link previews
      }

      const response = await fetch(
        'https://graph.facebook.com/me/feed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      )

      if (!response.ok) {
        throw new Error(`Facebook publish error: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        platformPostId: data.id,
        platformPostUrl: `https://facebook.com/${data.id}`,
        metadata: {
          mediaCount: mediaUrls?.length || 0
        }
      }
    } catch (error) {
      console.error('Facebook publish error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${postId}/insights?metric=post_impressions,post_engaged_users&access_token=${this.accessToken}`
      )

      if (!response.ok) {
        throw new Error(`Facebook analytics error: ${response.status}`)
      }

      const data = await response.json()
      const metrics: AnalyticsData = {}

      data.data?.forEach((metric: any) => {
        const value = metric.values?.[0]?.value || 0
        switch (metric.name) {
          case 'post_impressions':
            metrics.impressions = value
            break
          case 'post_engaged_users':
            metrics.reach = value
            break
        }
      })

      return metrics
    } catch (error) {
      console.error('Facebook analytics error:', error)
      return {}
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${refreshToken}`
      )

      if (!response.ok) {
        throw new Error(`Facebook token refresh error: ${response.status}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        refreshToken: data.access_token, // Facebook returns same token
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined
      }
    } catch (error) {
      console.error('Facebook token refresh error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to refresh Facebook token: ${errorMessage}`)
    }
  }
}

// Platform Client Factory
export class PlatformClientFactory {
  static createClient(platform: string, accessToken: string): BasePlatformClient {
    switch (platform) {
      case 'instagram':
        return new InstagramClient(accessToken)
      case 'linkedin':
        return new LinkedInClient(accessToken)
      case 'facebook':
        return new FacebookClient(accessToken)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  static getSupportedPlatforms(): string[] {
    return ['instagram', 'linkedin', 'facebook', 'tiktok', 'youtube', 'pinterest']
  }

  static getPlatformRequirements(platform: string) {
    const requirements: Record<string, any> = {
      instagram: {
        requiresMedia: true,
        maxTextLength: 2200,
        supportedMediaTypes: ['image', 'video'],
        maxMediaCount: 10
      },
      linkedin: {
        requiresMedia: false,
        maxTextLength: 3000,
        supportedMediaTypes: ['image', 'video'],
        maxMediaCount: 9
      },
      facebook: {
        requiresMedia: false,
        maxTextLength: 63206,
        supportedMediaTypes: ['image', 'video'],
        maxMediaCount: 10
      },
      tiktok: {
        requiresMedia: true,
        maxTextLength: 150,
        supportedMediaTypes: ['video'],
        maxMediaCount: 1
      },
      youtube: {
        requiresMedia: true,
        maxTextLength: 5000,
        supportedMediaTypes: ['video'],
        maxMediaCount: 1
      },
      pinterest: {
        requiresMedia: true,
        maxTextLength: 500,
        supportedMediaTypes: ['image'],
        maxMediaCount: 1
      }
    }

    return requirements[platform] || null
  }
}