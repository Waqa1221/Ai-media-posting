import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    openai: !!process.env.OPENAI_API_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    redis: !!process.env.REDIS_URL || (!!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN),
    twitter: !!process.env.TWITTER_API_KEY && !!process.env.TWITTER_API_SECRET && !!process.env.TWITTER_BEARER_TOKEN,
    linkedin: !!process.env.LINKEDIN_CLIENT_ID && !!process.env.LINKEDIN_CLIENT_SECRET,
    instagram: !!process.env.INSTAGRAM_CLIENT_ID && !!process.env.INSTAGRAM_CLIENT_SECRET && 
               process.env.INSTAGRAM_CLIENT_ID !== 'your_instagram_client_id' &&
               process.env.INSTAGRAM_CLIENT_SECRET !== 'your_instagram_client_secret',
    posthog: !!process.env.NEXT_PUBLIC_POSTHOG_KEY
  }

  return NextResponse.json(checks)
}