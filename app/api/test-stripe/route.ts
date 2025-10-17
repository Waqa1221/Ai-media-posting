import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function GET() {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      return NextResponse.json({
        success: false,
        error: 'Stripe not initialized',
        message: 'Stripe configuration is missing or invalid. Please check your environment variables.'
      }, { status: 500 })
    }

    // Test if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Stripe secret key not configured',
        message: 'Please add your Stripe secret key to the .env.local file'
      }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Stripe publishable key not configured',
        message: 'Please add your Stripe publishable key to the .env.local file'
      }, { status: 500 })
    }

    // Test API connection by retrieving account info
    const account = await stripe.accounts.retrieve()
    
    // Test creating a test customer (will be deleted)
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      metadata: {
        test: 'true'
      }
    })

    // Delete the test customer
    await stripe.customers.del(testCustomer.id)

    return NextResponse.json({
      success: true,
      message: 'Stripe integration is working correctly!',
      details: {
        account_id: account.id,
        country: account.country,
        currency: account.default_currency,
        test_mode: !account.charges_enabled || account.id.includes('acct_test'),
        business_type: account.business_type,
        capabilities: account.capabilities
      }
    })
  } catch (error) {
    console.error('Stripe test error:', error)
    
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      message: 'Stripe API test failed. Please check your configuration.'
    }, { status: 500 })
  }
}