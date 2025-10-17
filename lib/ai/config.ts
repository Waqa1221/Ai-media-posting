export const AI_CONFIG = {
  models: {
    primary: 'gpt-4-turbo-preview',
    fallback: 'gpt-3.5-turbo-0125',
  },
  limits: {
    maxTokens: 1000,
    temperature: 0.7,
    maxRetries: 3,
  },
  cache: {
    ttl: 3600, // 1 hour
    keyPrefix: 'ai_content:',
  },
  rateLimit: {
    requests: 100,
    window: 3600, // 1 hour
  },
  moderation: {
    enabled: true,
    threshold: 0.8,
  },
} as const

export const PLATFORM_CONFIGS = {
  facebook: {
    maxCaptionLength: 63206,
    maxHashtags: 30,
    optimalTimes: ['09:00', '13:00', '15:00', '20:00'],
    contentTypes: ['post', 'photo', 'video', 'link'],
    characteristics: 'Longer-form content, storytelling, community engagement',
    bestPractices: ['Ask questions to drive engagement', 'Use visuals', 'Post consistently', 'Respond to comments']
  },
  instagram: {
    maxCaptionLength: 2200,
    maxHashtags: 30,
    optimalTimes: ['09:00', '12:00', '17:00', '19:00'],
    contentTypes: ['image', 'carousel', 'reel', 'story'],
    characteristics: 'Visual-first, aesthetic focus, lifestyle content',
    bestPractices: ['High-quality visuals', 'Engage with first comment', 'Use Stories for behind-the-scenes', 'Mix hashtag sizes']
  },
  twitter: {
    maxCaptionLength: 280,
    maxHashtags: 3,
    optimalTimes: ['08:00', '12:00', '17:00', '21:00'],
    contentTypes: ['text', 'image', 'video', 'thread'],
    characteristics: 'Real-time updates, concise messaging, conversations',
    bestPractices: ['Be concise and punchy', 'Use threads for longer content', 'Engage in conversations', 'Tweet consistently']
  },
  linkedin: {
    maxCaptionLength: 3000,
    maxHashtags: 5,
    optimalTimes: ['08:00', '12:00', '17:00'],
    contentTypes: ['post', 'article', 'video', 'document'],
    characteristics: 'Professional tone, thought leadership, B2B focus',
    bestPractices: ['Share insights and expertise', 'Tell success stories', 'Use native video', 'Tag relevant people']
  },
} as const

export const BANNED_KEYWORDS = [
  'guaranteed',
  'free money',
  'get rich quick',
  'miracle cure',
  'lose weight fast',
  // Add more as needed
] as const

export const TONE_PROMPTS = {
  professional: 'Use formal language, industry expertise, and authoritative tone',
  friendly: 'Use conversational language, warm tone, and approachable style',
  bold: 'Use confident language, strong statements, and attention-grabbing phrases',
} as const