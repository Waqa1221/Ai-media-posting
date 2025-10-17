import { createServiceRoleClient } from '@/lib/supabase/server'
import { TwitterPlatform } from '@/lib/social/platforms/twitter'
import { aiContentGenerator } from '@/lib/ai/generator'
import type { ContentBrief } from '@/lib/ai/types'

export class TwitterAutomation {
  private static instance: TwitterAutomation

  static getInstance(): TwitterAutomation {
    if (!TwitterAutomation.instance) {
      TwitterAutomation.instance = new TwitterAutomation()
    }
    return TwitterAutomation.instance
  }

  async executeAutomationRule(ruleId: string): Promise<void> {
    const supabase = createServiceRoleClient()

    try {
      // Get automation rule
      const { data: rule, error: ruleError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', ruleId)
        .eq('is_active', true)
        .single()

      if (ruleError || !rule) {
        throw new Error('Automation rule not found or inactive')
      }

      // Get user's Twitter account
      const { data: twitterAccount, error: accountError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', rule.user_id)
        .eq('platform', 'twitter')
        .eq('is_active', true)
        .single()

      if (accountError || !twitterAccount) {
        throw new Error('No active Twitter account found')
      }

      // Execute based on trigger type
      switch (rule.trigger_type) {
        case 'schedule':
          await this.handleScheduledPost(rule, twitterAccount)
          break
        case 'hashtag_trending':
          await this.handleTrendingHashtag(rule, twitterAccount)
          break
        case 'engagement_threshold':
          await this.handleEngagementThreshold(rule, twitterAccount)
          break
        case 'auto_response':
          await this.handleAutoResponse(rule, twitterAccount)
          break
        default:
          console.warn(`Unknown trigger type: ${rule.trigger_type}`)
      }

      // Update rule execution stats
      await supabase.rpc('update_automation_rule_stats', {
        rule_id: ruleId,
        success: true
      })

    } catch (error) {
      console.error(`Error executing automation rule ${ruleId}:`, error)
      
      // Update rule execution stats with failure
      await supabase.rpc('update_automation_rule_stats', {
        rule_id: ruleId,
        success: false
      })
    }
  }

  private async handleScheduledPost(rule: any, twitterAccount: any): Promise<void> {
    const supabase = createServiceRoleClient()

    try {
      // Generate AI content for scheduled post
      const brief: ContentBrief = {
        industry: rule.trigger_conditions.industry || 'general',
        tone: rule.trigger_conditions.tone || 'friendly',
        keywords: rule.trigger_conditions.keywords || ['update', 'news'],
        platform: 'twitter',
        targetAudience: rule.trigger_conditions.target_audience,
        brandVoice: rule.trigger_conditions.brand_voice
      }

      const aiResult = await aiContentGenerator.generateContent({
        brief,
        userId: rule.user_id,
        model: 'gpt-3.5-turbo',
        useCache: false,
        supabase
      })

      // Ensure content fits Twitter's character limit
      let content = aiResult.content.caption
      if (content.length > 280) {
        content = content.substring(0, 277) + '...'
      }

      // Create Twitter platform instance
      const twitter = new TwitterPlatform(
        twitterAccount.access_token,
        twitterAccount.refresh_token || ''
      )

      // Publish to Twitter
      const result = await twitter.publishPost(content)

      if (result.success) {
        // Save post record
        await supabase
          .from('posts')
          .insert({
            user_id: rule.user_id,
            title: 'Automated Twitter Post',
            content: content,
            platforms: ['twitter'],
            hashtags: aiResult.content.hashtags || [],
            status: 'published',
            published_at: new Date().toISOString(),
            ai_generated: true,
            ai_prompt: JSON.stringify(brief)
          })

        // Log interaction
        await supabase
          .from('engagement_interactions')
          .insert({
            user_id: rule.user_id,
            automation_rule_id: rule.id,
            platform: 'twitter',
            interaction_type: 'post',
            target_post_id: result.platformPostId,
            content: content,
            status: 'completed'
          })

        console.log(`Successfully posted automated tweet: ${result.platformPostId}`)
      } else {
        throw new Error(result.error || 'Failed to publish tweet')
      }

    } catch (error) {
      console.error('Error in scheduled Twitter post:', error)
      throw error
    }
  }

  private async handleTrendingHashtag(rule: any, twitterAccount: any): Promise<void> {
    // Implementation for trending hashtag automation
    console.log('Handling trending hashtag automation for Twitter')
    
    const hashtags = rule.trigger_conditions.hashtags || []
    if (hashtags.length === 0) return

    // Check if any hashtags are trending (this would integrate with Twitter API trends)
    // For now, we'll simulate this
    const trendingHashtag = hashtags[0] // Simplified for demo

    // Generate content about the trending hashtag
    const brief: ContentBrief = {
      industry: rule.trigger_conditions.industry || 'general',
      tone: 'friendly',
      keywords: [trendingHashtag, 'trending', 'discussion'],
      platform: 'twitter',
      targetAudience: rule.trigger_conditions.target_audience
    }

    const aiResult = await aiContentGenerator.generateContent({
      brief,
      userId: rule.user_id,
      model: 'gpt-3.5-turbo',
      useCache: false
    })

    // Add the trending hashtag to the content
    let content = aiResult.content.caption
    if (!content.includes(`#${trendingHashtag}`)) {
      content += ` #${trendingHashtag}`
    }

    if (content.length > 280) {
      content = content.substring(0, 277) + '...'
    }

    const twitter = new TwitterPlatform(
      twitterAccount.access_token,
      twitterAccount.refresh_token || ''
    )

    const result = await twitter.publishPost(content)

    if (result.success) {
      const supabase = createServiceRoleClient()
      
      await supabase
        .from('engagement_interactions')
        .insert({
          user_id: rule.user_id,
          automation_rule_id: rule.id,
          platform: 'twitter',
          interaction_type: 'post',
          target_post_id: result.platformPostId,
          content: content,
          status: 'completed'
        })
    }
  }

  private async handleEngagementThreshold(rule: any, twitterAccount: any): Promise<void> {
    // Implementation for engagement threshold automation
    console.log('Handling engagement threshold automation for Twitter')
    
    // This would check recent posts and their engagement levels
    // If a post exceeds the threshold, take action (like promoting it)
  }

  private async handleAutoResponse(rule: any, twitterAccount: any): Promise<void> {
    // Implementation for auto-response automation
    console.log('Handling auto-response automation for Twitter')
    
    // This would monitor mentions and replies, then respond automatically
    // Based on the rule conditions
  }

  async createDailyMotivationRule(userId: string): Promise<string> {
    const supabase = createServiceRoleClient()

    const { data: rule, error } = await supabase
      .from('automation_rules')
      .insert({
        user_id: userId,
        name: 'Daily Motivation Posts',
        description: 'Post motivational content every morning at 9 AM',
        trigger_type: 'schedule',
        trigger_conditions: {
          time: '09:00',
          timezone: 'UTC',
          industry: 'general',
          tone: 'friendly',
          keywords: ['motivation', 'inspiration', 'success'],
          target_audience: 'professionals and entrepreneurs'
        },
        actions: [{ type: 'generate_and_post', platform: 'twitter' }],
        schedule_expression: '0 9 * * *', // Daily at 9 AM
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return rule.id
  }

  async createEngagementBoosterRule(userId: string, hashtags: string[]): Promise<string> {
    const supabase = createServiceRoleClient()

    const { data: rule, error } = await supabase
      .from('automation_rules')
      .insert({
        user_id: userId,
        name: 'Engagement Booster',
        description: 'Auto-engage with posts using specified hashtags',
        trigger_type: 'hashtag_trending',
        trigger_conditions: {
          hashtags: hashtags,
          max_interactions_per_hour: 10,
          interaction_types: ['like', 'retweet']
        },
        actions: [{ type: 'auto_engage', platforms: ['twitter'] }],
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return rule.id
  }
}

export const twitterAutomation = TwitterAutomation.getInstance()