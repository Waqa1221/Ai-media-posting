'use client'

import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformCardProps {
  platform: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  }
  isSelected: boolean
  onToggle: () => void
}

export function PlatformCard({ platform, isSelected, onToggle }: PlatformCardProps) {
  return (
    <div
      className={cn(
        "relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg",
          platform.color
        )}>
          {platform.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{platform.name}</h3>
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {platform.description}
          </p>
        </div>
      </div>
    </div>
  )
}