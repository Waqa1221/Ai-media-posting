'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AGE_RANGES } from '@/lib/constants/industries'

interface AgeRangeSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function AgeRangeSelect({ value, onValueChange, placeholder = "Select age range" }: AgeRangeSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {AGE_RANGES.map((range) => (
          <SelectItem key={range.value} value={range.value}>
            {range.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}