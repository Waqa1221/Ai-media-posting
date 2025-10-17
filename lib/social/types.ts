export interface SocialAccount {
  id: string
  platform: string
  platform_user_id: string
  username: string
  display_name: string
  avatar_url?: string
  access_token: string
  refresh_token?: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PublishResult {
  success: boolean
  platformPostId?: string
  url?: string
  error?: string
  metadata?: Record<string, any>
}

export interface PlatformAnalytics {
  likes: number
  comments: number
  shares: number
  impressions: number
  reach?: number
}

export interface PostData {
  content: string
  mediaUrls?: string[]
  scheduledFor?: string
}

export interface AutomationRule {
  id: string
  name: string
  trigger: 'schedule' | 'engagement' | 'hashtag' | 'mention'
  conditions: Record<string, any>
  actions: AutomationAction[]
  isActive: boolean
}

export interface AutomationAction {
  type: 'post' | 'like' | 'comment' | 'follow' | 'repost'
  platform: string
  content?: string
  delay?: number
}