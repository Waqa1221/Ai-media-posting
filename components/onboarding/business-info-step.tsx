'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { businessInfoSchema, type BusinessInfo } from '@/lib/schemas/onboarding'
import { FormFieldWrapper } from './form-field-wrapper'
import { IndustrySelect } from './industry-select'
import { CompanySizeSelect } from './company-size-select'
import { Building2 } from 'lucide-react'

interface BusinessInfoStepProps {
  data?: BusinessInfo
  onSubmit: (data: BusinessInfo) => void
}

export function BusinessInfoStep({ data, onSubmit }: BusinessInfoStepProps) {
  const form = useForm<BusinessInfo>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: data || {
      industry: '',
      companyName: '',
      companySize: '1',
      website: '',
      description: ''
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Tell us about your business
        </CardTitle>
        <CardDescription>
          Help us understand your business so we can provide personalized recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormFieldWrapper label="Company Name" required>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormFieldWrapper>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormFieldWrapper label="Industry" required>
                    <IndustrySelect 
                      value={field.value} 
                      onValueChange={field.onChange} 
                    />
                  </FormFieldWrapper>
                )}
              />

              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormFieldWrapper label="Company Size" required>
                    <CompanySizeSelect 
                      value={field.value} 
                      onValueChange={field.onChange} 
                    />
                  </FormFieldWrapper>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormFieldWrapper label="Website (Optional)">
                    <Input placeholder="https://example.com" {...field} />
                  </FormFieldWrapper>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormFieldWrapper label="Business Description" required>
                  <Textarea
                    placeholder="Tell us about your business, what you do, and what makes you unique..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormFieldWrapper>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}