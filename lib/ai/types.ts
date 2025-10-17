import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

export const contentBriefSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  tone: z.enum(['professional', 'friendly', 'bold']),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']),
  targetAudience: z.string().optional(),
  contentType: z.enum(['post', 'story', 'reel', 'article']).optional(),
  brandVoice: z.string().optional(),
})

export const generatedContentSchema = z.object({
  caption: z.string().min(1),
  hashtags: z.array(z.string()).max(30),
  image_prompt: z.string(),
  generated_images: z.array(z.string()).optional(),
  selected_image: z.string().optional(),
  optimal_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  cta: z.enum(['Learn more', 'Shop now', 'Sign up', 'Contact us']).nullable(),
  engagement_hooks: z.array(z.string()).optional(),
  content_pillars: z.array(z.string()).optional(),
})

export type ContentBrief = z.infer<typeof contentBriefSchema>
export type GeneratedContent = z.infer<typeof generatedContentSchema>

export interface GenerationResult {
  content: GeneratedContent
  tokensUsed: number
  model: string
  cached: boolean
  generationId: string
}
export interface AIGenerationRequest {
  brief: ContentBrief
  userId: string
  model?: string
  useCache?: boolean
  supabase?: SupabaseClient
}

export interface AIGenerationResponse {
  content: GeneratedContent
  tokensUsed: number
  model: string
  cached: boolean
  generationId: string
}

export interface ModerationResult {
  flagged: boolean
  categories: string[]
  confidence: number
}