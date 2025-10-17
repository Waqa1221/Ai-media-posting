import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function GET(req: Request) {
  try {
    // Get cookies and create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json({
        invoices: [],
        message: 'No billing history found'
      })
    }

    // Get invoices from Stripe
    if (!stripe) {
      return NextResponse.json({
        invoices: [],
        message: 'Stripe not configured'
      })
    }

    const invoices = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: 50,
      status: 'paid'
    })

    return NextResponse.json({
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created: invoice.created,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        subscription_id: invoice.subscription
      }))
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    )
  }
}