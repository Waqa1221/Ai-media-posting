'use client'

import { ReactNode } from 'react'
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

interface FormFieldWrapperProps {
  label: string
  children: ReactNode
  required?: boolean
}

export function FormFieldWrapper({ label, children, required = false }: FormFieldWrapperProps) {
  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
      <FormControl>
        {children}
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}