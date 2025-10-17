'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { INTERESTS } from '@/lib/constants/industries'

interface InterestsSelectorProps {
  selectedInterests: string[]
  onInterestsChange: (interests: string[]) => void
  minRequired?: number
}

export function InterestsSelector({ 
  selectedInterests, 
  onInterestsChange, 
  minRequired = 3 
}: InterestsSelectorProps) {
  const handleInterestToggle = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest]
    
    onInterestsChange(newInterests)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {INTERESTS.map((interest) => (
          <div key={interest} className="flex items-center space-x-2">
            <Checkbox
              id={interest}
              checked={selectedInterests.includes(interest)}
              onCheckedChange={() => handleInterestToggle(interest)}
            />
            <label
              htmlFor={interest}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {interest}
            </label>
          </div>
        ))}
      </div>
      
      {selectedInterests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedInterests.map((interest) => (
            <Badge key={interest} variant="secondary">
              {interest}
            </Badge>
          ))}
        </div>
      )}
      
      <p className="text-sm text-muted-foreground">
        Selected {selectedInterests.length} of {minRequired} minimum required
      </p>
    </div>
  )
}