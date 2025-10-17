import { nanoid } from 'nanoid'
import { openaiClient } from './openai-client'
import { aiCache } from './cache'
import { aiRateLimiter } from './rate-limiter'
import { contentModerator } from './moderation'
import { promptBuilder } from './prompt-builder'
import { retryHandler } from './retry-logic'
import { AI_CONFIG } from './config'
import { generatedContentSchema } from './types'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { 
  AIGenerationRequest, 
  AIGenerationResponse, 
  ContentBrief, 
  GeneratedContent 
} from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

class AIContentGenerator {
  private static instance: AIContentGenerator

  static getInstance(): AIContentGenerator {
    if (!AIContentGenerator.instance) {
      AIContentGenerator.instance = new AIContentGenerator()
    }
    return AIContentGenerator.instance
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const { brief, userId, model = AI_CONFIG.models.primary, useCache = true, supabase } = request
    const generationId = nanoid()

    try {
      // Check rate limits
      const rateLimitResult = await aiRateLimiter.checkLimit(userId)
      if (!rateLimitResult.success) {
        throw new Error(`Rate limit exceeded. Try again after ${rateLimitResult.reset.toISOString()}`)
      }

      // Check cache first
      if (useCache) {
        const cachedContent = await aiCache.get(brief)
        if (cachedContent) {
          await aiCache.incrementHits()
          return {
            content: cachedContent,
            tokensUsed: 0,
            model: 'cached',
            cached: true,
            generationId,
          }
        }
        await aiCache.incrementMisses()
      }

      // Generate content with retry logic
      const content = await retryHandler.withFallback(
        () => this.generateWithModel(brief, model),
        () => this.generateWithModel(brief, AI_CONFIG.models.fallback)
      )

      // Moderate content
      const moderationResult = await contentModerator.moderateContent(content.content.caption)
      if (moderationResult.flagged) {
        throw new Error(`Content flagged for: ${moderationResult.categories.join(', ')}`)
      }

      // Cache the result
      if (useCache) {
        await aiCache.set(brief, content.content)
      }

      // Store generation record
      await this.storeGenerationRecord({
        supabase,
        userId,
        generationId,
        brief,
        content: content.content,
        tokensUsed: content.tokensUsed,
        model: content.model,
      })

      return {
        content: content.content,
        tokensUsed: content.tokensUsed,
        model: content.model,
        cached: false,
        generationId,
      }
    } catch (error) {
      console.error('AI content generation error:', error)
      
      // Store failed generation record
      await this.storeGenerationRecord({
        supabase,
        userId,
        generationId,
        brief,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }

  private async generateWithModel(
    brief: ContentBrief, 
    model: string
  ): Promise<{ content: GeneratedContent; tokensUsed: number; model: string }> {
    const prompt = promptBuilder.buildPrompt(brief)
    
    const response = await openaiClient.generateContent(prompt, model)
    
    let parsedContent: any
    try {
      parsedContent = JSON.parse(response.content)
    } catch (error) {
      throw new Error('Invalid JSON response from AI model')
    }

    // Pre-validation cleanup to ensure content meets schema requirements
    if (parsedContent.hashtags && Array.isArray(parsedContent.hashtags)) {
      // Truncate hashtags array to maximum of 30 elements
      parsedContent.hashtags = parsedContent.hashtags.slice(0, 30)
    }

    // Validate and fix CTA field
    const validCTAs = ['Learn more', 'Shop now', 'Sign up', 'Contact us']
    if (parsedContent.cta && !validCTAs.includes(parsedContent.cta)) {
      // Map common variations to valid CTAs or set to null
      const ctaMapping: Record<string, string> = {
        'Order Now': 'Shop now',
        'Buy Now': 'Shop now',
        'Purchase': 'Shop now',
        'Get Started': 'Sign up',
        'Join Now': 'Sign up',
        'Register': 'Sign up',
        'Discover More': 'Learn more',
        'Find Out More': 'Learn more',
        'Read More': 'Learn more',
        'Get in Touch': 'Contact us',
        'Reach Out': 'Contact us'
      }
      
      parsedContent.cta = ctaMapping[parsedContent.cta] || null
    }

    // Generate images based on the image prompt
    let generatedImages: string[] = []
    try {
      if (parsedContent.image_prompt) {
        generatedImages = await openaiClient.generateImages(parsedContent.image_prompt, 2)
        parsedContent.generated_images = generatedImages
      }
    } catch (error) {
      console.warn('Image generation failed, using fallback images:', error)
      // Use fallback images if generation fails
      parsedContent.generated_images = [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop'
      ]
    }
    // Validate with Zod
    const validatedContent = generatedContentSchema.parse(parsedContent)

    return {
      content: validatedContent,
      tokensUsed: response.tokensUsed,
      model: response.model,
    }
  }

  private async storeGenerationRecord(data: {
    supabase?: SupabaseClient
    userId: string
    generationId: string
    brief: ContentBrief
    content?: GeneratedContent
    tokensUsed?: number
    model?: string
    error?: string
  }) {
    try {
      const supabaseClient = data.supabase || createServiceRoleClient()
      
      await supabaseClient.from('ai_generations').insert({
        id: data.generationId,
        user_id: data.userId,
        type: 'text',
        prompt: JSON.stringify(data.brief),
        result: data.content ? JSON.stringify(data.content) : null,
        tokens_used: data.tokensUsed || 0,
        cost_cents: this.calculateCost(data.tokensUsed || 0, data.model),
        model_used: data.model || null,
        error_message: data.error || null,
      })

      // Update usage limits
      if (!data.error) {
        await supabaseClient.rpc('increment_usage', {
          p_user_id: data.userId,
          p_limit_type: 'ai_generations_per_month'
        })
      }
    } catch (error) {
      console.error('Failed to store generation record:', error)
    }
  }

  private calculateCost(tokens: number, model?: string): number {
    // Cost calculation based on model and tokens
    const rates = {
      'gpt-4-turbo-preview': 0.01, // $0.01 per 1K tokens
      'gpt-3.5-turbo': 0.002, // $0.002 per 1K tokens
    }
    
    const rate = rates[model as keyof typeof rates] || rates['gpt-3.5-turbo']
    return Math.ceil((tokens / 1000) * rate * 100) // Convert to cents
  }

  async getGenerationHistory(userId: string, limit = 50) {
    try {
      const supabase = createServiceRoleClient()
      const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get generation history:', error)
      return []
    }
  }

  async getUsageStats(userId: string) {
    try {
      const supabase = createServiceRoleClient()
      const { data, error } = await supabase
        .from('ai_generations')
        .select('tokens_used, cost_cents')
        .eq('user_id', userId)

      if (error) throw error

      const totalTokens = data?.reduce((sum, item) => sum + (item.tokens_used || 0), 0) || 0
      const totalCost = data?.reduce((sum, item) => sum + (item.cost_cents || 0), 0) || 0
      const generationsCount = data?.length || 0
      const averageTokensPerGeneration = generationsCount > 0 ? totalTokens / generationsCount : 0

      return {
        totalTokens,
        totalCost,
        generationsCount,
        averageTokensPerGeneration,
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return {
        totalTokens: 0,
        totalCost: 0,
        generationsCount: 0,
        averageTokensPerGeneration: 0,
      }
    }
  }
}

export const aiContentGenerator = AIContentGenerator.getInstance()