'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

interface PlatformSelectProps {
  value: string
  onValueChange: (value: string) => void
}

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', description: 'Longer content, community focus' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', description: 'Visual-first, aesthetic content' },
  { value: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-500', description: 'Concise, real-time updates' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', description: 'Professional, B2B content' },
]

export function PlatformSelect({ value, onValueChange }: PlatformSelectProps) {
  const selectedPlatform = PLATFORMS.find(p => p.value === value)
  const SelectedIcon = selectedPlatform?.icon

  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select platform">
          {selectedPlatform && SelectedIcon && (
            <div className="flex items-center gap-2">
              <SelectedIcon className={`w-4 h-4 ${selectedPlatform.color}`} />
              <span>{selectedPlatform.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon
          return (
            <SelectItem key={platform.value} value={platform.value}>
              <div className="flex items-center gap-3 py-1">
                <Icon className={`w-5 h-5 ${platform.color}`} />
                <div>
                  <div className="font-medium">{platform.label}</div>
                  <div className="text-xs text-muted-foreground">{platform.description}</div>
                </div>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}