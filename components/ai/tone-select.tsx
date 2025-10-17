'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ToneSelectProps {
  value: string
  onValueChange: (value: string) => void
}

const TONES = [
  { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
  { value: 'friendly', label: 'Friendly', description: 'Conversational and warm' },
  { value: 'bold', label: 'Bold', description: 'Confident and attention-grabbing' },
]

export function ToneSelect({ value, onValueChange }: ToneSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select tone" />
      </SelectTrigger>
      <SelectContent>
        {TONES.map((tone) => (
          <SelectItem key={tone.value} value={tone.value}>
            <div>
              <div className="font-medium">{tone.label}</div>
              <div className="text-sm text-muted-foreground">{tone.description}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}