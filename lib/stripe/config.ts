export const SUBSCRIPTION_PLAN = {
  name: 'SocialAI Premium',
  description: 'Complete AI-powered social media management',
  price: 70,
  priceId: process.env.STRIPE_PRICE_ID || 'price_premium_70_monthly',
  features: [
    'Unlimited AI content generation',
    'Multi-platform publishing (Instagram, LinkedIn, Twitter, Facebook, TikTok)',
    'Advanced scheduling with optimal timing',
    'Comprehensive analytics and insights',
    'AI Marketing Agency automation',
    'Unlimited social media accounts',
    'Team collaboration tools',
    'Priority customer support',
    'Custom integrations and API access',
    'Advanced automation workflows',
    'Content calendar and planning',
    'Performance optimization',
    'Brand voice consistency',
    'Hashtag research and optimization',
    'Media library management',
    'Real-time notifications',
    'Export and reporting tools'
  ],
  limits: {
    posts_per_month: -1, // Unlimited
    social_accounts: -1, // Unlimited
    ai_generations_per_month: -1, // Unlimited
    storage_gb: 100,
    team_members: -1, // Unlimited
    automation_rules: -1 // Unlimited
  },
  trial: {
    days: 7,
    description: '7-day free trial, then $70/month'
  }
} as const

export type SubscriptionTier = 'trial' | 'premium' | 'canceled'

// Legacy support for existing code
export const SUBSCRIPTION_PLANS = {
  premium: SUBSCRIPTION_PLAN
} as const