import { TwitterPlatform } from './platforms/twitter'
import { LinkedInPlatform } from './platforms/linkedin'
import { InstagramPlatform } from './platforms/instagram'
import type { SocialAccount } from './types'

export class PlatformFactory {
  static createPlatform(account: SocialAccount) {
    switch (account.platform) {
      case 'twitter':
        return new TwitterPlatform(
          account.access_token,
          account.refresh_token || ''
        )
      
      case 'linkedin':
        return new LinkedInPlatform(
          account.access_token,
          account.platform_user_id
        )
      
      case 'instagram':
        return new InstagramPlatform(
          account.access_token,
          account.platform_user_id
        )
      
      default:
        throw new Error(`Unsupported platform: ${account.platform}`)
    }
  }

  static getSupportedPlatforms() {
    return ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok']
  }

  static getPlatformRequirements(platform: string) {
    const requirements: Record<string, any> = {
      twitter: {
        requiresMedia: false,
        maxTextLength: 280,
        supportedMediaTypes: ['image', 'video', 'gif'],
        maxMediaCount: 4
      },
      linkedin: {
        requiresMedia: false,
        maxTextLength: 3000,
        supportedMediaTypes: ['image', 'video'],
        maxMediaCount: 9
      },
      instagram: {
        requiresMedia: true,
        maxTextLength: 2200,
        supportedMediaTypes: ['image', 'video'],
        maxMediaCount: 10
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
      }
    }

    return requirements[platform] || null
  }
}