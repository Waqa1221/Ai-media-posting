export const TRIAL_CONFIG = {
  // 7-day free trial configuration
  trialDays: 7,
  subscriptionPrice: 70, // $70 USD
  currency: 'usd',
  
  // Stripe price ID for $70/month subscription
  priceId: process.env.STRIPE_PRICE_ID || 'price_premium_70_monthly',
  
  // Trial settings
  trialSettings: {
    collectPaymentMethod: true, // Collect payment method during trial signup
    automaticTax: false,
    allowPromotionCodes: true,
    billingAddressCollection: 'auto'
  },

  // Plan features (everything included)
  features: [
    'Unlimited AI content generation',
    'Multi-platform publishing',
    'Advanced scheduling & automation',
    'Comprehensive analytics',
    'AI Marketing Agency',
    'Unlimited social accounts',
    'Team collaboration',
    'Priority support',
    'Custom integrations',
    'Advanced automation workflows',
    'Content calendar and planning',
    'Performance optimization',
    'Brand voice consistency',
    'Hashtag research and optimization',
    'Media library management',
    'Real-time notifications',
    'Export and reporting tools'
  ],

  // Usage limits (all unlimited for premium plan)
  limits: {
    posts_per_month: -1, // Unlimited
    social_accounts: -1, // Unlimited
    ai_generations_per_month: -1, // Unlimited
    storage_gb: 100,
    team_members: -1, // Unlimited
    automation_rules: -1 // Unlimited
  }
} as const

export type TrialSubscriptionTier = 'trial' | 'premium' | 'canceled'