'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CompanySizeSelectProps {
  value: string
  onValueChange: (value: string) => void
}

const COMPANY_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-10', label: '2-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
]

export function CompanySizeSelect({ value, onValueChange }: CompanySizeSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select company size" />
      </SelectTrigger>
      <SelectContent>
        {COMPANY_SIZES.map((size) => (
          <SelectItem key={size.value} value={size.value}>
            {size.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}