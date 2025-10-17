'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AudienceSizeSelectProps {
  value: string
  onValueChange: (value: string) => void
}

const AUDIENCE_SIZES = [
  { value: 'local', label: 'Local (City/Region)' },
  { value: 'regional', label: 'Regional (State/Province)' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' }
]

export function AudienceSizeSelect({ value, onValueChange }: AudienceSizeSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select audience reach" />
      </SelectTrigger>
      <SelectContent>
        {AUDIENCE_SIZES.map((size) => (
          <SelectItem key={size.value} value={size.value}>
            {size.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}