'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { INDUSTRIES } from '@/lib/constants/industries'

interface IndustrySelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function IndustrySelect({ value, onValueChange, placeholder = "Select your industry" }: IndustrySelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {INDUSTRIES.map((industry) => (
          <SelectItem key={industry.value} value={industry.value}>
            {industry.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}