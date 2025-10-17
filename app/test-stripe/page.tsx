'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react'

export default function TestStripePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testStripe = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-stripe')
      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Test failed')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const testCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_test_123' 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // In test mode, just show success instead of redirecting
        setResult({ 
          success: true, 
          message: 'Checkout session created successfully!',
          checkoutUrl: data.url 
        })
      } else {
        setError(data.error || 'Checkout creation failed')
      }
    } catch (err) {
      setError('Failed to create checkout session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          Stripe Integration Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your Stripe configuration and verify the integration is working
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>API Connection Test</CardTitle>
            <CardDescription>
              Test your Stripe API key configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testStripe} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Stripe API'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                  <br />
                  <br />
                  <strong>Common solutions:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Check your Stripe API keys in .env.local</li>
                    <li>Ensure you're in the correct mode (test/live)</li>
                    <li>Verify your Stripe account is active</li>
                    <li>Check that your API keys have correct permissions</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {result && result.success && !result.checkoutUrl && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success!</strong> Stripe API is working correctly.
                  <br />
                  <br />
                  <strong>Test Results:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>API Connection: ✅ Working</li>
                    <li>Account Status: ✅ Active</li>
                    <li>Test Mode: ✅ Enabled</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Checkout Test */}
        <Card>
          <CardHeader>
            <CardTitle>Checkout Test</CardTitle>
            <CardDescription>
              Test the subscription checkout process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testCheckout} 
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Checkout...
                </>
              ) : (
                'Test Checkout Session'
              )}
            </Button>

            {result && result.checkoutUrl && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Checkout Session Created!</strong>
                  <br />
                  <br />
                  <a 
                    href={result.checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open Checkout Page →
                  </a>
                  <br />
                  <br />
                  <strong>Test Cards:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Success: 4242 4242 4242 4242</li>
                    <li>Decline: 4000 0000 0000 0002</li>
                    <li>3D Secure: 4000 0025 0000 3155</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to complete your Stripe integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">1. Stripe Account Setup</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Create account at <a href="https://stripe.com" target="_blank" className="text-blue-600 hover:underline">stripe.com</a></li>
                  <li>Complete business verification</li>
                  <li>Get API keys from Dashboard → Developers</li>
                  <li>Add keys to your .env.local file</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">2. Create Products & Prices</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Go to Stripe Dashboard → Products</li>
                  <li>Create products for each subscription tier</li>
                  <li>Add monthly recurring prices</li>
                  <li>Copy price IDs to environment variables</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">3. Configure Webhooks</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Dashboard → Developers → Webhooks</li>
                  <li>Add endpoint: /api/webhooks/stripe</li>
                  <li>Select subscription events</li>
                  <li>Copy webhook secret to .env.local</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">4. Test Integration</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Use test API keys and cards</li>
                  <li>Test subscription creation</li>
                  <li>Verify webhook processing</li>
                  <li>Test customer portal access</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Environment Variables Needed:</h4>
              <pre className="text-sm text-blue-800 bg-blue-100 p-3 rounded overflow-x-auto">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}