'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PostingFrequencySelectProps {
  value: string
  onValueChange: (value: string) => void
}

const POSTING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'few-times-week', label: 'Few times a week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export function PostingFrequencySelect({ value, onValueChange }: PostingFrequencySelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder="How often do you want to post?" />
      </SelectTrigger>
      <SelectContent>
        {POSTING_FREQUENCIES.map((frequency) => (
          <SelectItem key={frequency.value} value={frequency.value}>
            {frequency.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}