'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Loader2, CreditCard, Gift } from 'lucide-react'

export default function TestStripeTrialPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testStripeConnection = async () => {
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

  const testTrialCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-trial-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ 
          success: true, 
          message: 'Trial checkout session created successfully!',
          checkoutUrl: data.url,
          sessionId: data.sessionId
        })
      } else {
        setError(data.error || 'Trial checkout creation failed')
      }
    } catch (err) {
      setError('Failed to create trial checkout session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="w-8 h-8" />
          Stripe Trial Integration Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your Stripe trial configuration and verify the 7-day free trial system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Stripe API Connection</CardTitle>
            <CardDescription>
              Test your Stripe API key configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testStripeConnection} 
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
                </AlertDescription>
              </Alert>
            )}

            {result && result.success && !result.checkoutUrl && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success!</strong> Stripe API is working correctly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Trial Checkout Test */}
        <Card>
          <CardHeader>
            <CardTitle>Trial Checkout Test</CardTitle>
            <CardDescription>
              Test the 7-day free trial checkout process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testTrialCheckout} 
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Trial...
                </>
              ) : (
                'Test Trial Checkout'
              )}
            </Button>

            {result && result.checkoutUrl && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Trial Checkout Created!</strong>
                  <br />
                  <br />
                  <a 
                    href={result.checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open Trial Checkout Page →
                  </a>
                  <br />
                  <br />
                  <strong>Test Cards for Trial:</strong>
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

      {/* Configuration Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Trial Configuration Guide</CardTitle>
          <CardDescription>
            How to set up your Stripe trial integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">1. Create Stripe Product & Price</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm mb-2">In your Stripe Dashboard:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Go to Products → Add product</li>
                  <li>Name: "SocialAI Premium Plan"</li>
                  <li>Price: $70.00 USD, Monthly recurring</li>
                  <li>Copy the Price ID (starts with price_)</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">2. Environment Variables</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm">
                <pre>{`# Add to your .env.local file
STRIPE_TRIAL_PRICE_ID=price_your_70_dollar_price_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">3. Webhook Configuration</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm mb-2">Set up webhook endpoint in Stripe:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  <li>Endpoint URL: <code>/api/webhooks/stripe-trial</code></li>
                  <li>Events: customer.subscription.*, invoice.payment_*</li>
                  <li>Copy webhook signing secret to environment</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">4. Trial Flow</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  <span>User clicks "Start Free Trial"</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  <span>Stripe Checkout with 7-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  <span>Payment method collected (not charged)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  <span>Trial period begins immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">5</Badge>
                  <span>After 7 days: automatic $70 charge</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}