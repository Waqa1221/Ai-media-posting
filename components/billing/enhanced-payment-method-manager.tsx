'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Shield,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  is_default: boolean
}

interface EnhancedPaymentMethodManagerProps {
  paymentMethods: PaymentMethod[]
  onPaymentMethodAdded: (paymentMethodId: string) => Promise<void>
  onPaymentMethodRemoved: (paymentMethodId: string) => Promise<void>
  onDefaultPaymentMethodSet: (paymentMethodId: string) => Promise<void>
}

export function EnhancedPaymentMethodManager({
  paymentMethods,
  onPaymentMethodAdded,
  onPaymentMethodRemoved,
  onDefaultPaymentMethodSet
}: EnhancedPaymentMethodManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    try {
      setDeletingId(paymentMethodId)
      await onPaymentMethodRemoved(paymentMethodId)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setSettingDefaultId(paymentMethodId)
      await onDefaultPaymentMethodSet(paymentMethodId)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSettingDefaultId(null)
    }
  }

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      case 'discover':
        return '💳'
      default:
        return '💳'
    }
  }

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment methods and billing information
            </CardDescription>
          </div>
          <Button onClick={() => onPaymentMethodAdded('')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No payment methods
            </h3>
            <p className="text-muted-foreground mb-4">
              Add a payment method to manage your subscription
            </p>
            <Button onClick={() => onPaymentMethodAdded('')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getCardBrandIcon(method.card?.brand || 'card')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCardBrand(method.card?.brand || 'Card')} •••• {method.card?.last4}
                        </span>
                        {method.is_default && (
                          <Badge className="bg-green-100 text-green-800">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {method.card?.exp_month}/{method.card?.exp_year}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={settingDefaultId === method.id}
                      >
                        {settingDefaultId === method.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                            Setting...
                          </>
                        ) : (
                          'Set Default'
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      disabled={deletingId === method.id || method.is_default}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deletingId === method.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your payment information is securely stored by Stripe and encrypted with bank-level security.
                We never store your card details on our servers.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}