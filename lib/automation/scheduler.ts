import { createServiceRoleClient } from '@/lib/supabase/server'
import { publishToSocialPlatform } from '../social/publisher'
import { collectPlatformAnalytics } from '../analytics/collector'
import { twitterAutomation } from './twitter-automation'

export class AutomationScheduler {
  private jobs: Map<string, NodeJS.Timeout> = new Map()
  private static instance: AutomationScheduler

  static getInstance(): AutomationScheduler {
    if (!AutomationScheduler.instance) {
      AutomationScheduler.instance = new AutomationScheduler()
    }
    return AutomationScheduler.instance
  }

  async startScheduler() {
    console.log('Starting automation scheduler...')
    
    // Check for scheduled posts every minute
    setInterval(async () => {
      await this.processScheduledPosts()
    }, 60 * 1000)

    // Collect analytics every hour
    setInterval(async () => {
      await this.collectAnalytics()
    }, 60 * 60 * 1000)

    // Process automation rules every 5 minutes
    setInterval(async () => {
      await this.processAutomationRules()
    }, 5 * 60 * 1000)

    // Refresh tokens daily
    setInterval(async () => {
      await this.refreshExpiredTokens()
    }, 24 * 60 * 60 * 1000)

    // Process Twitter automation rules every minute
    setInterval(async () => {
      await this.processTwitterAutomation()
    }, 60 * 1000)
  }

  private async processScheduledPosts() {
    try {
      const supabase = createServiceRoleClient()
      const now = new Date()

      // Get posts scheduled for now or earlier
      const { data: scheduledPosts, error } = await supabase
        .from('scheduling_queue')
        .select(`
          *,
          posts (*)
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', now.toISOString())
        .limit(50)

      if (error) {
        console.error('Error fetching scheduled posts:', error)
        return
      }

      for (const scheduledPost of scheduledPosts || []) {
        try {
          console.log(`Publishing scheduled post ${scheduledPost.post_id} to ${scheduledPost.platform}`)

          const result = await publishToSocialPlatform({
            userId: scheduledPost.user_id,
            platform: scheduledPost.platform,
            content: scheduledPost.posts.content,
            mediaUrls: scheduledPost.posts.media_urls,
            postId: scheduledPost.post_id
          })

          // Update scheduling queue status
          await supabase
            .from('scheduling_queue')
            .update({
              status: result.success ? 'completed' : 'failed',
              error_message: result.error || null,
              attempts: scheduledPost.attempts + 1,
              last_attempt_at: new Date().toISOString()
            })
            .eq('id', scheduledPost.id)

          // Update post status
          if (result.success) {
            await supabase
              .from('posts')
              .update({
                status: 'published',
                published_at: new Date().toISOString()
              })
              .eq('id', scheduledPost.post_id)
          } else {
            await supabase
              .from('posts')
              .update({
                status: 'failed',
                error_message: result.error
              })
              .eq('id', scheduledPost.post_id)
          }

        } catch (error) {
          console.error(`Error publishing post ${scheduledPost.post_id}:`, error)
          
          await supabase
            .from('scheduling_queue')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              attempts: scheduledPost.attempts + 1,
              last_attempt_at: new Date().toISOString()
            })
            .eq('id', scheduledPost.id)
        }
      }
    } catch (error) {
      console.error('Error in processScheduledPosts:', error)
    }
  }

  private async collectAnalytics() {
    try {
      const supabase = createServiceRoleClient()
      
      // Get published posts from the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      const { data: recentPosts, error } = await supabase
        .from('post_publications')
        .select(`
          *,
          posts (user_id)
        `)
        .eq('status', 'published')
        .gte('published_at', yesterday.toISOString())

      if (error) {
        console.error('Error fetching recent posts:', error)
        return
      }

      for (const publication of recentPosts || []) {
        try {
          const analytics = await collectPlatformAnalytics(
            publication.posts.user_id,
            publication.platform,
            publication.platform_post_id
          )

          if (analytics && Object.keys(analytics).length > 0) {
            // Store analytics
            const analyticsRecords = Object.entries(analytics).map(([metricName, metricValue]) => ({
              user_id: publication.posts.user_id,
              post_id: publication.post_id,
              platform: publication.platform,
              metric_name: metricName,
              metric_value: metricValue as number,
              recorded_at: new Date().toISOString()
            }))

            await supabase
              .from('analytics')
              .insert(analyticsRecords)
          }
        } catch (error) {
          console.error(`Error collecting analytics for post ${publication.post_id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in collectAnalytics:', error)
    }
  }

  private async processAutomationRules() {
    try {
      const supabase = createServiceRoleClient()
      
      const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching automation rules:', error)
        return
      }

      for (const rule of rules || []) {
        try {
          await this.executeAutomationRule(rule)
        } catch (error) {
          console.error(`Error executing automation rule ${rule.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in processAutomationRules:', error)
    }
  }

  private async processTwitterAutomation() {
    try {
      const supabase = createServiceRoleClient()
      const now = new Date()
      
      // Get Twitter automation rules that should run now
      const { data: twitterRules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true)
        .eq('trigger_type', 'schedule')
        .or('last_executed_at.is.null,last_executed_at.lt.' + new Date(now.getTime() - 60 * 1000).toISOString())

      if (error) {
        console.error('Error fetching Twitter automation rules:', error)
        return
      }

      for (const rule of twitterRules || []) {
        try {
          // Check if it's time to execute this rule
          if (this.shouldExecuteRule(rule, now)) {
            await twitterAutomation.executeAutomationRule(rule.id)
          }
        } catch (error) {
          console.error(`Error executing Twitter automation rule ${rule.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in processTwitterAutomation:', error)
    }
  }

  private shouldExecuteRule(rule: any, now: Date): boolean {
    const conditions = rule.trigger_conditions || {}
    
    if (rule.trigger_type === 'schedule' && conditions.time) {
      const [hours, minutes] = conditions.time.split(':').map(Number)
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      // Execute if we're within the target minute
      return currentHour === hours && currentMinute === minutes
    }
    
    return false
  }
  private async executeAutomationRule(rule: any) {
    const supabase = createServiceRoleClient()

    switch (rule.trigger_type) {
      case 'schedule':
        await this.handleScheduleTrigger(rule)
        break
      case 'engagement_threshold':
        await this.handleEngagementTrigger(rule)
        break
      case 'hashtag_trending':
        await this.handleHashtagTrigger(rule)
        break
      case 'auto_response':
        await this.handleAutoResponseTrigger(rule)
        break
      default:
        console.warn(`Unknown trigger type: ${rule.trigger_type}`)
    }
  }

  private async handleScheduleTrigger(rule: any) {
    // Delegate to Twitter automation for Twitter-specific rules
    const actions = rule.actions || []
    
    for (const action of actions) {
      if (action.platform === 'twitter' || action.platforms?.includes('twitter')) {
        await twitterAutomation.executeAutomationRule(rule.id)
      }
    }
  }

  private async handleEngagementTrigger(rule: any) {
    // Handle engagement-based automation
    // e.g., auto-like posts that mention your brand
  }

  private async handleHashtagTrigger(rule: any) {
    // Handle hashtag-based automation
    // e.g., auto-engage with posts using specific hashtags
    await twitterAutomation.executeAutomationRule(rule.id)
  }

  private async handleAutoResponseTrigger(rule: any) {
    // Handle automatic responses to comments/mentions
    await twitterAutomation.executeAutomationRule(rule.id)
  }

  private async refreshExpiredTokens() {
    try {
      const supabase = createServiceRoleClient()
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

      const { data: expiringAccounts, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('is_active', true)
        .lt('expires_at', tomorrow.toISOString())

      if (error) {
        console.error('Error fetching expiring accounts:', error)
        return
      }

      for (const account of expiringAccounts || []) {
        try {
          const refreshed = await this.refreshAccountToken(account)
          if (refreshed) {
            console.log(`Refreshed token for ${account.platform} account ${account.id}`)
          } else {
            console.warn(`Failed to refresh token for ${account.platform} account ${account.id}`)
            
            // Deactivate account if refresh fails
            await supabase
              .from('social_accounts')
              .update({ is_active: false })
              .eq('id', account.id)
          }
        } catch (error) {
          console.error(`Error refreshing token for account ${account.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in refreshExpiredTokens:', error)
    }
  }

  private async refreshAccountToken(account: any): Promise<boolean> {
    // This would call the appropriate platform's token refresh method
    return false
  }

  scheduleCustomJob(name: string, intervalMs: number, callback: () => Promise<void>) {
    if (this.jobs.has(name)) {
      const existingJob = this.jobs.get(name)
      if (existingJob) {
        clearInterval(existingJob as any)
      }
    }

    const intervalId = setInterval(callback, intervalMs)
    this.jobs.set(name, intervalId as any)
  }

  stopJob(name: string) {
    const job = this.jobs.get(name)
    if (job) {
      clearInterval(job as any)
      this.jobs.delete(name)
    }
  }

  stopAllJobs() {
    this.jobs.forEach(job => clearInterval(job as any))
    this.jobs.clear()
  }
}

// Initialize and export scheduler
export const automationScheduler = AutomationScheduler.getInstance()