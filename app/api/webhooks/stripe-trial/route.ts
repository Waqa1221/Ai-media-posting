import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe, handleTrialWebhookEvent } from '@/lib/stripe/trial-server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    console.log(`Processing webhook event: ${event.type}`)
    await handleTrialWebhookEvent(event)
    
    return NextResponse.json({ 
      received: true,
      eventType: event.type 
    })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}