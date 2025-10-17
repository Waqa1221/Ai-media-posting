'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Download, 
  ExternalLink,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface Invoice {
  id: string
  amount_paid: number
  currency: string
  status: string
  created: number
  hosted_invoice_url: string
  invoice_pdf: string
  period_start: number
  period_end: number
  subscription_id: string
}

interface BillingHistoryProps {
  customerId?: string
}

export function BillingHistory({ customerId }: BillingHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (customerId) {
      loadInvoices()
    } else {
      setIsLoading(false)
    }
  }, [customerId])

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/billing/invoices')
      const data = await response.json()

      if (response.ok) {
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'void':
      case 'uncollectible':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'open':
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Billing History
        </CardTitle>
        <CardDescription>
          View and download your invoices and payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No billing history yet
            </h3>
            <p className="text-muted-foreground">
              Your invoices and payment history will appear here once you have an active subscription.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </Badge>
                      <span className="text-lg font-semibold">
                        {formatAmount(invoice.amount_paid, invoice.currency)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        Invoice #{invoice.id.slice(-8).toUpperCase()}
                      </div>
                      <div>
                        Billing period: {format(new Date(invoice.period_start * 1000), 'MMM dd, yyyy')} - {format(new Date(invoice.period_end * 1000), 'MMM dd, yyyy')}
                      </div>
                      <div>
                        Date: {format(new Date(invoice.created * 1000), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={invoice.hosted_invoice_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={invoice.invoice_pdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}