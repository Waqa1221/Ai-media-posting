import { z } from 'zod'

export const businessInfoSchema = z.object({
  industry: z.string().min(1, 'Please select your industry'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companySize: z.enum(['1', '2-10', '11-50', '51-200', '201-1000', '1000+'], {
    required_error: 'Please select your company size'
  }),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Please provide a brief description (at least 10 characters)')
})

export const audienceSchema = z.object({
  primaryAgeRange: z.string().min(1, 'Please select primary age range'),
  secondaryAgeRanges: z.array(z.string()).optional(),
  interests: z.array(z.string()).min(3, 'Please select at least 3 interests'),
  location: z.string().min(1, 'Please specify your target location'),
  audienceSize: z.enum(['local', 'regional', 'national', 'international'], {
    required_error: 'Please select your audience size'
  })
})

export const brandVoiceSchema = z.object({
  tone: z.number().min(0).max(100), // 0 = formal, 100 = casual
  personality: z.number().min(0).max(100), // 0 = serious, 100 = humorous
  expertise: z.number().min(0).max(100), // 0 = approachable, 100 = authoritative
  contentTypes: z.array(z.enum([
    'educational', 'promotional', 'behind-the-scenes', 'user-generated',
    'news-updates', 'inspirational', 'entertaining', 'how-to'
  ])).min(2, 'Please select at least 2 content types'),
  postingFrequency: z.enum(['daily', 'few-times-week', 'weekly', 'bi-weekly', 'monthly'])
})

export const platformsSchema = z.object({
  selectedPlatforms: z.array(z.string()).min(1, 'Please select at least one platform'),
  priorities: z.record(z.string(), z.number().min(1).max(5)).optional(),
  goals: z.array(z.enum([
    'brand-awareness', 'lead-generation', 'customer-engagement',
    'sales', 'community-building', 'thought-leadership'
  ])).min(1, 'Please select at least one goal')
})

export const completeOnboardingSchema = businessInfoSchema
  .merge(audienceSchema)
  .merge(brandVoiceSchema)
  .merge(platformsSchema)

export type BusinessInfo = z.infer<typeof businessInfoSchema>
export type Audience = z.infer<typeof audienceSchema>
export type BrandVoice = z.infer<typeof brandVoiceSchema>
export type Platforms = z.infer<typeof platformsSchema>
export type CompleteOnboarding = z.infer<typeof completeOnboardingSchema>