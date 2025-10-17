'use client'

import { useState, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface KeywordInputProps {
  value: string[]
  onChange: (keywords: string[]) => void
  placeholder?: string
  maxKeywords?: number
}

export function KeywordInput({ 
  value, 
  onChange, 
  placeholder = "Type keywords and press Enter",
  maxKeywords = 10 
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim()
    if (trimmed && !value.includes(trimmed) && value.length < maxKeywords) {
      onChange([...value, trimmed])
      setInputValue('')
    }
  }

  const removeKeyword = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeKeyword(value.length - 1)
    }
  }

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={value.length >= maxKeywords}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        {value.length}/{maxKeywords} keywords
      </div>
    </div>
  )
}