'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

const CONTENT_TYPES = [
  { id: 'educational', label: 'Educational', description: 'How-to guides, tips, tutorials' },
  { id: 'promotional', label: 'Promotional', description: 'Product features, offers, announcements' },
  { id: 'behind-the-scenes', label: 'Behind the Scenes', description: 'Company culture, team stories' },
  { id: 'user-generated', label: 'User Generated', description: 'Customer stories, testimonials' },
  { id: 'news-updates', label: 'News & Updates', description: 'Industry news, company updates' },
  { id: 'inspirational', label: 'Inspirational', description: 'Motivational quotes, success stories' },
  { id: 'entertaining', label: 'Entertaining', description: 'Memes, fun facts, light content' },
  { id: 'how-to', label: 'How-to', description: 'Step-by-step guides, tutorials' }
] as const

interface ContentTypeSelectorProps {
  selectedTypes: string[]
  onTypesChange: (types: string[]) => void
  minRequired?: number
}

export function ContentTypeSelector({ 
  selectedTypes, 
  onTypesChange, 
  minRequired = 2 
}: ContentTypeSelectorProps) {
  const handleTypeToggle = (typeId: string) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter(t => t !== typeId)
      : [...selectedTypes, typeId]
    
    onTypesChange(newTypes)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTENT_TYPES.map((type) => (
          <div
            key={type.id}
            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => handleTypeToggle(type.id)}
          >
            <Checkbox
              id={type.id}
              checked={selectedTypes.includes(type.id)}
              onCheckedChange={() => handleTypeToggle(type.id)}
            />
            <div className="flex-1">
              <label
                htmlFor={type.id}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {type.label}
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {type.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTypes.map((typeId) => {
            const type = CONTENT_TYPES.find(t => t.id === typeId)
            return type ? (
              <Badge key={typeId} variant="secondary">
                {type.label}
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}