import axios from 'axios'
import type { PublishResult } from '../types'

export class InstagramPlatform {
  private accessToken: string
  private userId: string

  constructor(accessToken: string, userId: string) {
    this.accessToken = accessToken
    this.userId = userId
  }

  async publishPost(content: string, mediaUrls?: string[]): Promise<PublishResult> {
    try {
      if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('Instagram posts require at least one image or video')
      }

      let creationId: string

      if (mediaUrls.length === 1) {
        // Single media post
        const mediaType = this.getMediaType(mediaUrls[0])
        const mediaResponse = await axios.post(
          `https://graph.facebook.com/v18.0/${this.userId}/media`,
          {
            [mediaType === 'video' ? 'video_url' : 'image_url']: mediaUrls[0],
            caption: content,
            access_token: this.accessToken
          }
        )
        creationId = mediaResponse.data.id
      } else {
        // Carousel post (multiple media)
        const mediaContainers = []
        
        for (const mediaUrl of mediaUrls.slice(0, 10)) { // Instagram allows max 10 items
          const mediaType = this.getMediaType(mediaUrl)
          const containerResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${this.userId}/media`,
            {
              [mediaType === 'video' ? 'video_url' : 'image_url']: mediaUrl,
              is_carousel_item: true,
              access_token: this.accessToken
            }
          )
          mediaContainers.push(containerResponse.data.id)
        }

        // Create carousel container
        const carouselResponse = await axios.post(
          `https://graph.facebook.com/v18.0/${this.userId}/media`,
          {
            media_type: 'CAROUSEL',
            children: mediaContainers.join(','),
            caption: content,
            access_token: this.accessToken
          }
        )
        creationId = carouselResponse.data.id
      }

      // Publish the media container
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.userId}/media_publish`,
        {
          creation_id: creationId,
          access_token: this.accessToken
        }
      )

      const postId = publishResponse.data.id

      return {
        success: true,
        platformPostId: postId,
        url: `https://www.instagram.com/p/${postId}`,
        metadata: {
          media_count: mediaUrls.length,
          post_type: mediaUrls.length > 1 ? 'carousel' : 'single'
        }
      }
    } catch (error: any) {
      console.error('Instagram publish error:', error)
      
      // Handle specific Instagram API errors
      if (error.response?.data?.error) {
        const instagramError = error.response.data.error
        if (instagramError.code === 100) {
          return {
            success: false,
            error: 'Invalid media URL or unsupported media format'
          }
        }
        if (instagramError.code === 190) {
          return {
            success: false,
            error: 'Instagram access token expired. Please reconnect your account.'
          }
        }
        return {
          success: false,
          error: instagramError.message || 'Instagram API error'
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to Instagram'
      }
    }
  }

  private getMediaType(url: string): 'image' | 'video' {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv']
    const urlLower = url.toLowerCase()
    return videoExtensions.some(ext => urlLower.includes(ext)) ? 'video' : 'image'
  }

  async getProfile() {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me`,
        {
          params: {
            fields: 'id,username,account_type,media_count',
            access_token: this.accessToken
          }
        }
      )

      return {
        id: response.data.id,
        username: response.data.username,
        displayName: response.data.username,
        accountType: response.data.account_type,
        mediaCount: response.data.media_count || 0
      }
    } catch (error) {
      console.error('Instagram profile error:', error)
      throw error
    }
  }

  async getAnalytics(postId: string) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/${postId}/insights`,
        {
          params: {
            metric: 'impressions,reach,likes,comments,saves,shares',
            access_token: this.accessToken
          }
        }
      )

      const metrics: Record<string, number> = {}
      response.data.data.forEach((metric: any) => {
        metrics[metric.name] = metric.values[0]?.value || 0
      })

      return {
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        saves: metrics.saves || 0,
        shares: metrics.shares || 0,
        impressions: metrics.impressions || 0,
        reach: metrics.reach || 0
      }
    } catch (error) {
      console.error('Instagram analytics error:', error)
      return {
        likes: 0,
        comments: 0,
        saves: 0,
        shares: 0,
        impressions: 0,
        reach: 0
      }
    }
  }

  async getAccountInsights(timeframe: string = '7d') {
    try {
      const since = new Date()
      const until = new Date()
      
      switch (timeframe) {
        case '7d':
          since.setDate(since.getDate() - 7)
          break
        case '30d':
          since.setDate(since.getDate() - 30)
          break
        default:
          since.setDate(since.getDate() - 7)
      }

      const response = await axios.get(
        `https://graph.instagram.com/${this.userId}/insights`,
        {
          params: {
            metric: 'impressions,reach,profile_views,website_clicks',
            period: 'day',
            since: since.toISOString().split('T')[0],
            until: until.toISOString().split('T')[0],
            access_token: this.accessToken
          }
        }
      )

      const insights: Record<string, number> = {}
      response.data.data.forEach((metric: any) => {
        insights[metric.name] = metric.values.reduce((sum: number, value: any) => sum + (value.value || 0), 0)
      })

      // Get follower count
      const profileResponse = await axios.get(
        `https://graph.instagram.com/${this.userId}`,
        {
          params: {
            fields: 'followers_count',
            access_token: this.accessToken
          }
        }
      )

      return {
        impressions: insights.impressions || 0,
        reach: insights.reach || 0,
        profile_views: insights.profile_views || 0,
        website_clicks: insights.website_clicks || 0,
        follower_count: profileResponse.data.followers_count || 0
      }
    } catch (error) {
      console.error('Instagram account insights error:', error)
      return {
        impressions: 0,
        reach: 0,
        profile_views: 0,
        website_clicks: 0,
        follower_count: 0
      }
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/refresh_access_token`,
        {
          params: {
            grant_type: 'ig_refresh_token',
            access_token: this.accessToken
          }
        }
      )

      return response.data.access_token
    } catch (error) {
      console.error('Instagram token refresh error:', error)
      return null
    }
  }
}