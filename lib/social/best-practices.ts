import type { SocialAccount } from './types'

export interface PlatformBestPractices {
  platform: string
  contentGuidelines: {
    maxLength: number
    optimalLength: number
    hashtagLimit: number
    optimalHashtags: number
    mediaRequired: boolean
    mediaLimit: number
  }
  postingSchedule: {
    optimalTimes: string[]
    frequency: {
      min: number
      max: number
      recommended: number
    }
    timezone: string
  }
  contentTypes: {
    type: string
    description: string
    performance: 'high' | 'medium' | 'low'
  }[]
  engagementTips: string[]
  commonMistakes: string[]
}

export const PLATFORM_BEST_PRACTICES: Record<string, PlatformBestPractices> = {
  instagram: {
    platform: 'Instagram',
    contentGuidelines: {
      maxLength: 2200,
      optimalLength: 125,
      hashtagLimit: 30,
      optimalHashtags: 8,
      mediaRequired: true,
      mediaLimit: 10
    },
    postingSchedule: {
      optimalTimes: ['11:00', '13:00', '19:00', '21:00'],
      frequency: {
        min: 3,
        max: 14,
        recommended: 7
      },
      timezone: 'user_timezone'
    },
    contentTypes: [
      { type: 'Photo Posts', description: 'High-quality images with engaging captions', performance: 'high' },
      { type: 'Carousel Posts', description: 'Multiple images or videos in one post', performance: 'high' },
      { type: 'Reels', description: 'Short-form vertical videos', performance: 'high' },
      { type: 'Stories', description: 'Temporary content for behind-the-scenes', performance: 'medium' },
      { type: 'IGTV', description: 'Longer-form video content', performance: 'medium' }
    ],
    engagementTips: [
      'Use high-quality, visually appealing images',
      'Include 5-11 relevant hashtags for optimal reach',
      'Post consistently (1-2 times daily)',
      'Engage with comments within the first hour',
      'Use Instagram Stories for behind-the-scenes content',
      'Add location tags when relevant',
      'Create content that encourages saves and shares',
      'Use trending audio in Reels'
    ],
    commonMistakes: [
      'Using too many hashtags (over 11)',
      'Posting low-quality or blurry images',
      'Ignoring Instagram Stories',
      'Not engaging with followers',
      'Over-promoting products',
      'Inconsistent posting schedule',
      'Not using Instagram-specific features'
    ]
  },

  linkedin: {
    platform: 'LinkedIn',
    contentGuidelines: {
      maxLength: 3000,
      optimalLength: 1300,
      hashtagLimit: 5,
      optimalHashtags: 3,
      mediaRequired: false,
      mediaLimit: 9
    },
    postingSchedule: {
      optimalTimes: ['08:00', '12:00', '17:00'],
      frequency: {
        min: 2,
        max: 10,
        recommended: 5
      },
      timezone: 'business_hours'
    },
    contentTypes: [
      { type: 'Professional Updates', description: 'Industry insights and professional achievements', performance: 'high' },
      { type: 'Thought Leadership', description: 'Expert opinions and industry analysis', performance: 'high' },
      { type: 'Company News', description: 'Business updates and announcements', performance: 'medium' },
      { type: 'Educational Content', description: 'How-to guides and tutorials', performance: 'high' },
      { type: 'Personal Stories', description: 'Professional journey and experiences', performance: 'medium' }
    ],
    engagementTips: [
      'Write longer, more detailed posts (1,300+ characters)',
      'Share professional insights and experiences',
      'Use 3-5 relevant hashtags maximum',
      'Post during business hours (8 AM - 6 PM)',
      'Engage with industry leaders and peers',
      'Share behind-the-scenes professional content',
      'Ask questions to encourage discussion',
      'Use LinkedIn native video when possible'
    ],
    commonMistakes: [
      'Using too many hashtags (over 5)',
      'Posting overly casual content',
      'Ignoring comments and engagement',
      'Over-promoting without providing value',
      'Posting at non-business hours',
      'Not leveraging LinkedIn articles',
      'Failing to build professional relationships'
    ]
  },

  twitter: {
    platform: 'Twitter/X',
    contentGuidelines: {
      maxLength: 280,
      optimalLength: 100,
      hashtagLimit: 2,
      optimalHashtags: 1,
      mediaRequired: false,
      mediaLimit: 4
    },
    postingSchedule: {
      optimalTimes: ['09:00', '12:00', '15:00', '18:00'],
      frequency: {
        min: 3,
        max: 15,
        recommended: 5
      },
      timezone: 'user_timezone'
    },
    contentTypes: [
      { type: 'Quick Updates', description: 'Brief thoughts and observations', performance: 'high' },
      { type: 'News Commentary', description: 'Reactions to current events', performance: 'high' },
      { type: 'Threads', description: 'Multi-tweet stories or explanations', performance: 'medium' },
      { type: 'Polls', description: 'Interactive questions for engagement', performance: 'high' },
      { type: 'Retweets with Commentary', description: 'Adding value to others\' content', performance: 'medium' }
    ],
    engagementTips: [
      'Keep tweets concise and punchy',
      'Use 1-2 hashtags maximum',
      'Engage in real-time conversations',
      'Tweet 3-5 times daily',
      'Use Twitter threads for longer content',
      'Retweet and engage with industry leaders',
      'Participate in Twitter chats',
      'Use polls to increase engagement'
    ],
    commonMistakes: [
      'Using too many hashtags',
      'Tweeting too frequently (spam)',
      'Ignoring mentions and replies',
      'Only posting promotional content',
      'Not engaging with the community',
      'Poor timing of tweets',
      'Not using Twitter-specific features'
    ]
  },

  facebook: {
    platform: 'Facebook',
    contentGuidelines: {
      maxLength: 63206,
      optimalLength: 80,
      hashtagLimit: 5,
      optimalHashtags: 2,
      mediaRequired: false,
      mediaLimit: 10
    },
    postingSchedule: {
      optimalTimes: ['13:00', '15:00', '19:00'],
      frequency: {
        min: 3,
        max: 10,
        recommended: 5
      },
      timezone: 'user_timezone'
    },
    contentTypes: [
      { type: 'Community Posts', description: 'Content that builds community engagement', performance: 'high' },
      { type: 'Live Videos', description: 'Real-time interaction with audience', performance: 'high' },
      { type: 'Photo Albums', description: 'Multiple related images', performance: 'medium' },
      { type: 'Events', description: 'Promoting and organizing events', performance: 'medium' },
      { type: 'User-Generated Content', description: 'Sharing customer content', performance: 'high' }
    ],
    engagementTips: [
      'Use native video content when possible',
      'Encourage comments and discussions',
      'Share user-generated content',
      'Post during peak engagement hours',
      'Use Facebook Live for real-time engagement',
      'Create Facebook Events for promotions',
      'Respond to comments promptly',
      'Use Facebook Groups for community building'
    ],
    commonMistakes: [
      'Cross-posting identical content from other platforms',
      'Not optimizing for Facebook\'s algorithm',
      'Ignoring Facebook-specific features',
      'Poor video quality or format',
      'Not engaging with community',
      'Over-posting promotional content',
      'Neglecting Facebook Stories'
    ]
  },

  tiktok: {
    platform: 'TikTok',
    contentGuidelines: {
      maxLength: 150,
      optimalLength: 100,
      hashtagLimit: 100,
      optimalHashtags: 5,
      mediaRequired: true,
      mediaLimit: 1
    },
    postingSchedule: {
      optimalTimes: ['06:00', '10:00', '19:00', '21:00'],
      frequency: {
        min: 3,
        max: 21,
        recommended: 7
      },
      timezone: 'user_timezone'
    },
    contentTypes: [
      { type: 'Trending Challenges', description: 'Participating in viral challenges', performance: 'high' },
      { type: 'Educational Content', description: 'Quick tips and tutorials', performance: 'high' },
      { type: 'Behind-the-Scenes', description: 'Authentic, unpolished content', performance: 'high' },
      { type: 'Duets and Stitches', description: 'Collaborating with other creators', performance: 'medium' },
      { type: 'Trending Sounds', description: 'Using popular audio clips', performance: 'high' }
    ],
    engagementTips: [
      'Use trending sounds and effects',
      'Jump on trending challenges quickly',
      'Keep videos authentic and unpolished',
      'Hook viewers in the first 3 seconds',
      'Use relevant hashtags and trending topics',
      'Post consistently (1-3 times daily)',
      'Engage with comments and other creators',
      'Create content that encourages shares'
    ],
    commonMistakes: [
      'Using copyrighted music without permission',
      'Creating overly polished content',
      'Ignoring trending topics and challenges',
      'Poor video quality or lighting',
      'Not engaging with the TikTok community',
      'Using irrelevant hashtags',
      'Posting inconsistently'
    ]
  }
}

export class SocialMediaBestPractices {
  static getPlatformGuidelines(platform: string): PlatformBestPractices | null {
    return PLATFORM_BEST_PRACTICES[platform] || null
  }

  static validateContent(platform: string, content: string, hashtags: string[] = [], mediaCount: number = 0): {
    isValid: boolean
    warnings: string[]
    errors: string[]
    suggestions: string[]
  } {
    const guidelines = this.getPlatformGuidelines(platform)
    if (!guidelines) {
      return { isValid: false, warnings: [], errors: ['Unsupported platform'], suggestions: [] }
    }

    const warnings: string[] = []
    const errors: string[] = []
    const suggestions: string[] = []

    // Content length validation
    if (content.length > guidelines.contentGuidelines.maxLength) {
      errors.push(`Content exceeds ${platform} limit of ${guidelines.contentGuidelines.maxLength} characters`)
    } else if (content.length > guidelines.contentGuidelines.optimalLength * 2) {
      warnings.push(`Content is longer than optimal for ${platform} (${guidelines.contentGuidelines.optimalLength} characters recommended)`)
    } else if (content.length < guidelines.contentGuidelines.optimalLength / 2) {
      suggestions.push(`Consider adding more detail. ${platform} posts perform better with ${guidelines.contentGuidelines.optimalLength}+ characters`)
    }

    // Hashtag validation
    if (hashtags.length > guidelines.contentGuidelines.hashtagLimit) {
      errors.push(`Too many hashtags. ${platform} allows maximum ${guidelines.contentGuidelines.hashtagLimit}`)
    } else if (hashtags.length > guidelines.contentGuidelines.optimalHashtags * 2) {
      warnings.push(`Consider using fewer hashtags. ${guidelines.contentGuidelines.optimalHashtags} hashtags are optimal for ${platform}`)
    } else if (hashtags.length < guidelines.contentGuidelines.optimalHashtags) {
      suggestions.push(`Add more hashtags for better reach. ${guidelines.contentGuidelines.optimalHashtags} hashtags recommended for ${platform}`)
    }

    // Media validation
    if (guidelines.contentGuidelines.mediaRequired && mediaCount === 0) {
      errors.push(`${platform} requires at least one image or video`)
    } else if (mediaCount > guidelines.contentGuidelines.mediaLimit) {
      errors.push(`Too many media files. ${platform} supports maximum ${guidelines.contentGuidelines.mediaLimit}`)
    }

    // Platform-specific suggestions
    if (platform === 'instagram' && !content.includes('?') && !this.hasCallToAction(content)) {
      suggestions.push('Add a question or call-to-action to boost engagement')
    }

    if (platform === 'linkedin' && content.length < 500) {
      suggestions.push('LinkedIn posts perform better with more detailed, professional content')
    }

    if (platform === 'twitter' && content.length > 200) {
      suggestions.push('Consider breaking long content into a Twitter thread')
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      suggestions
    }
  }

  static getOptimalPostingTime(platform: string, userTimezone: string = 'UTC'): string {
    const guidelines = this.getPlatformGuidelines(platform)
    if (!guidelines) return '09:00'

    // Return the first optimal time for the platform
    return guidelines.postingSchedule.optimalTimes[0] || '09:00'
  }

  static generateHashtagSuggestions(platform: string, content: string, industry: string): string[] {
    const guidelines = this.getPlatformGuidelines(platform)
    if (!guidelines) return []

    // Extract keywords from content
    const words = content.toLowerCase().match(/\b\w+\b/g) || []
    const keywords = words.filter(word => word.length > 3)

    // Industry-specific hashtags
    const industryHashtags = this.getIndustryHashtags(industry)
    
    // Platform-specific hashtags
    const platformHashtags = this.getPlatformHashtags(platform)

    // Combine and limit to optimal count
    const suggestions = [
      ...industryHashtags.slice(0, 3),
      ...platformHashtags.slice(0, 2),
      ...keywords.slice(0, 3)
    ].slice(0, guidelines.contentGuidelines.optimalHashtags)

    return suggestions
  }

  static getContentScore(platform: string, content: string, hashtags: string[] = [], mediaCount: number = 0): {
    score: number
    breakdown: Record<string, number>
    recommendations: string[]
  } {
    const guidelines = this.getPlatformGuidelines(platform)
    if (!guidelines) return { score: 0, breakdown: {}, recommendations: [] }

    let score = 0
    const breakdown: Record<string, number> = {}
    const recommendations: string[] = []

    // Content length score (25 points)
    const lengthRatio = content.length / guidelines.contentGuidelines.optimalLength
    if (lengthRatio >= 0.5 && lengthRatio <= 2) {
      breakdown.contentLength = 25
      score += 25
    } else if (lengthRatio >= 0.3 && lengthRatio <= 3) {
      breakdown.contentLength = 15
      score += 15
      recommendations.push(`Adjust content length closer to ${guidelines.contentGuidelines.optimalLength} characters for optimal performance`)
    } else {
      breakdown.contentLength = 5
      score += 5
      recommendations.push(`Content length is not optimal for ${platform}`)
    }

    // Hashtag score (20 points)
    const hashtagRatio = hashtags.length / guidelines.contentGuidelines.optimalHashtags
    if (hashtagRatio >= 0.7 && hashtagRatio <= 1.5) {
      breakdown.hashtags = 20
      score += 20
    } else if (hashtagRatio >= 0.3 && hashtagRatio <= 2) {
      breakdown.hashtags = 12
      score += 12
      recommendations.push(`Use ${guidelines.contentGuidelines.optimalHashtags} hashtags for optimal reach`)
    } else {
      breakdown.hashtags = 5
      score += 5
      recommendations.push(`Add more relevant hashtags (${guidelines.contentGuidelines.optimalHashtags} recommended)`)
    }

    // Media score (20 points)
    if (guidelines.contentGuidelines.mediaRequired) {
      if (mediaCount > 0) {
        breakdown.media = 20
        score += 20
      } else {
        breakdown.media = 0
        recommendations.push(`${platform} requires visual content for better performance`)
      }
    } else {
      if (mediaCount > 0) {
        breakdown.media = 20
        score += 20
      } else {
        breakdown.media = 10
        score += 10
        recommendations.push('Adding visual content would improve engagement')
      }
    }

    // Engagement elements score (20 points)
    let engagementScore = 0
    if (this.hasQuestion(content)) {
      engagementScore += 7
    } else {
      recommendations.push('Add a question to encourage comments')
    }
    
    if (this.hasCallToAction(content)) {
      engagementScore += 7
    } else {
      recommendations.push('Include a call-to-action to drive engagement')
    }
    
    if (this.hasEmojis(content)) {
      engagementScore += 6
    } else {
      recommendations.push('Add relevant emojis to make content more engaging')
    }

    breakdown.engagement = engagementScore
    score += engagementScore

    // Platform-specific bonus (15 points)
    let platformScore = 0
    if (platform === 'instagram' && this.hasInstagramFeatures(content)) {
      platformScore = 15
    } else if (platform === 'linkedin' && this.hasLinkedInFeatures(content)) {
      platformScore = 15
    } else if (platform === 'twitter' && this.hasTwitterFeatures(content)) {
      platformScore = 15
    } else {
      platformScore = 8
      recommendations.push(`Optimize content for ${platform}-specific features`)
    }

    breakdown.platformOptimization = platformScore
    score += platformScore

    return {
      score: Math.min(score, 100),
      breakdown,
      recommendations
    }
  }

  static getEngagementPrediction(platform: string, content: string, hashtags: string[], postingTime: string): {
    predictedEngagement: number
    confidence: number
    factors: string[]
  } {
    const guidelines = this.getPlatformGuidelines(platform)
    if (!guidelines) return { predictedEngagement: 0, confidence: 0, factors: [] }

    let baseEngagement = 50 // Base engagement score
    const factors: string[] = []

    // Time factor
    if (guidelines.postingSchedule.optimalTimes.includes(postingTime)) {
      baseEngagement += 20
      factors.push('Optimal posting time')
    } else {
      baseEngagement -= 10
      factors.push('Non-optimal posting time')
    }

    // Content quality factor
    const contentScore = this.getContentScore(platform, content, hashtags, 1)
    const qualityMultiplier = contentScore.score / 100
    baseEngagement *= qualityMultiplier

    if (contentScore.score > 80) {
      factors.push('High-quality content')
    } else if (contentScore.score < 50) {
      factors.push('Content needs improvement')
    }

    // Platform-specific factors
    if (platform === 'instagram' && hashtags.length >= 5) {
      baseEngagement += 15
      factors.push('Good hashtag usage')
    }

    if (platform === 'linkedin' && content.length > 1000) {
      baseEngagement += 10
      factors.push('Detailed professional content')
    }

    const confidence = Math.min(95, Math.max(60, baseEngagement))

    return {
      predictedEngagement: Math.round(Math.max(0, Math.min(100, baseEngagement))),
      confidence,
      factors
    }
  }

  private static hasQuestion(content: string): boolean {
    return /\?/.test(content)
  }

  private static hasCallToAction(content: string): boolean {
    const ctaPatterns = /\b(click|visit|check|try|download|sign up|learn more|comment|share|like|follow|subscribe|buy|shop|order|contact|call|email|dm|message)\b/i
    return ctaPatterns.test(content)
  }

  private static hasEmojis(content: string): boolean {
  
  const emojiPattern = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\u3000-\u303F]|[\u1F000-\u1F9FF]/g
  return emojiPattern.test(content)
}
  private static hasInstagramFeatures(content: string): boolean {
    // Check for Instagram-specific elements
    return this.hasEmojis(content) && (this.hasQuestion(content) || this.hasCallToAction(content))
  }

  private static hasLinkedInFeatures(content: string): boolean {
    // Check for professional language and insights
    const professionalTerms = /\b(insight|strategy|professional|business|industry|experience|leadership|growth|innovation|success)\b/i
    return professionalTerms.test(content) && content.length > 500
  }

  private static hasTwitterFeatures(content: string): boolean {
    // Check for Twitter-specific elements
    return content.length <= 200 && (content.includes('@') || content.includes('#') || this.hasQuestion(content))
  }

  private static getIndustryHashtags(industry: string): string[] {
    const industryHashtags: Record<string, string[]> = {
      technology: ['tech', 'innovation', 'digital', 'startup', 'AI', 'software'],
      healthcare: ['health', 'wellness', 'medical', 'healthcare', 'fitness', 'nutrition'],
      finance: ['finance', 'investing', 'money', 'business', 'fintech', 'economy'],
      retail: ['retail', 'shopping', 'ecommerce', 'fashion', 'style', 'trends'],
      education: ['education', 'learning', 'teaching', 'students', 'knowledge', 'skills'],
      'food-beverage': ['food', 'cooking', 'recipe', 'restaurant', 'chef', 'foodie'],
      'fitness-wellness': ['fitness', 'workout', 'health', 'wellness', 'nutrition', 'lifestyle']
    }

    return industryHashtags[industry] || ['business', 'growth', 'success']
  }

  private static getPlatformHashtags(platform: string): string[] {
    const platformHashtags: Record<string, string[]> = {
      instagram: ['instagood', 'photooftheday', 'instadaily', 'picoftheday'],
      linkedin: ['linkedin', 'professional', 'networking', 'career'],
      twitter: ['twitter', 'socialmedia', 'trending', 'news'],
      facebook: ['facebook', 'community', 'social', 'connect'],
      tiktok: ['tiktok', 'viral', 'trending', 'fyp']
    }

    return platformHashtags[platform] || []
  }

  static getPostingCalendar(platforms: string[], frequency: number = 7): {
    platform: string
    day: string
    time: string
    contentType: string
  }[] {
    const calendar: any[] = []
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    platforms.forEach(platform => {
      const guidelines = this.getPlatformGuidelines(platform)
      if (!guidelines) return

      const postsPerWeek = Math.min(frequency, guidelines.postingSchedule.frequency.recommended)
      const optimalTimes = guidelines.postingSchedule.optimalTimes

      for (let i = 0; i < postsPerWeek; i++) {
        const dayIndex = Math.floor((i * 7) / postsPerWeek)
        const timeIndex = i % optimalTimes.length
        
        calendar.push({
          platform,
          day: days[dayIndex],
          time: optimalTimes[timeIndex],
          contentType: guidelines.contentTypes[i % guidelines.contentTypes.length].type
        })
      }
    })

    return calendar.sort((a, b) => {
      const dayOrder = days.indexOf(a.day) - days.indexOf(b.day)
      if (dayOrder !== 0) return dayOrder
      return a.time.localeCompare(b.time)
    })
  }

  static getContentMix(platform: string): {
    type: string
    percentage: number
    description: string
  }[] {
    const guidelines = this.getPlatformGuidelines(platform)
    if (!guidelines) return []

    // Apply 70/20/10 rule with platform-specific adjustments
    const baseMix = [
      { type: 'Educational/Value', percentage: 70, description: 'Tips, insights, and valuable information' },
      { type: 'Personal/Behind-the-scenes', percentage: 20, description: 'Company culture and personal stories' },
      { type: 'Promotional', percentage: 10, description: 'Product features and offers' }
    ]

    // Adjust for platform
    if (platform === 'linkedin') {
      baseMix[0].percentage = 80 // More professional content
      baseMix[1].percentage = 15
      baseMix[2].percentage = 5
    } else if (platform === 'tiktok') {
      baseMix[0].percentage = 60 // More entertainment
      baseMix[1].percentage = 30
      baseMix[2].percentage = 10
    }

    return baseMix
  }
}

export const socialMediaBestPractices = SocialMediaBestPractices