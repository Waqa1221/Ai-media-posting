'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  Receipt,
  Settings,
  AlertCircle,
  CheckCircle,
  Gift
} from 'lucide-react'
import { EnhancedSubscriptionManager } from '@/components/billing/enhanced-subscription-manager'
import { EnhancedPaymentMethodManager } from '@/components/billing/enhanced-payment-method-manager'
import { BillingHistory } from '@/components/billing/billing-history'
import { useEnhancedBilling } from '@/hooks/use-enhanced-billing'
import { Skeleton } from '@/components/ui/skeleton'

export default function EnhancedBillingPage() {
  const [activeTab, setActiveTab] = useState('subscription')
  const {
    billingData,
    isLoading,
    error,
    loadBillingData,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    createCheckoutSession,
    openCustomerPortal
  } = useEnhancedBilling()

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadBillingData}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Quick Status */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {billingData.subscription ? 'Premium Plan Active' : 'No Active Subscription'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {billingData.subscription 
                    ? `Next billing: ${new Date(billingData.subscription.current_period_end).toLocaleDateString()}`
                    : 'Start your free trial to unlock all features'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {billingData.subscription ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Button onClick={() => createCheckoutSession('price_premium')}>
                  <Gift className="w-4 h-4 mr-2" />
                  Start Free Trial
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="billing-history" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Billing History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <EnhancedSubscriptionManager
            subscriptionDetails={{
              subscription: billingData.subscription,
              trialInfo: billingData.trialInfo,
              summary: billingData.summary
            }}
            onSubscriptionChange={loadBillingData}
          />
        </TabsContent>

        <TabsContent value="payment-methods">
          <EnhancedPaymentMethodManager
            paymentMethods={billingData.paymentMethods}
            onPaymentMethodAdded={addPaymentMethod}
            onPaymentMethodRemoved={removePaymentMethod}
            onDefaultPaymentMethodSet={setDefaultPaymentMethod}
          />
        </TabsContent>

        <TabsContent value="billing-history">
          <BillingHistory 
            customerId={billingData.subscription?.stripe_customer_id}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>
                Configure your billing preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Email Receipts</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email receipts for all payments
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Billing Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified before your next billing date
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Usage Alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Notifications when approaching usage limits
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <Button onClick={openCustomerPortal} className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Open Stripe Customer Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}