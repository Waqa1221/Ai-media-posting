'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  X,
  SlidersHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface MediaFilters {
  search: string
  type: string
  dateRange: {
    from: Date | null
    to: Date | null
  }
  tags: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface MediaFiltersProps {
  filters: MediaFilters
  onFiltersChange: (filters: MediaFilters) => void
  availableTags: string[]
  totalItems: number
  filteredItems: number
}

export function MediaFilters({
  filters,
  onFiltersChange,
  availableTags,
  totalItems,
  filteredItems
}: MediaFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof MediaFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag))
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      dateRange: { from: null, to: null },
      tags: [],
      sortBy: 'uploaded_at',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = 
    filters.search || 
    filters.type !== 'all' || 
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.tags.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>
              {filteredItems} of {totalItems} files
              {hasActiveFilters && ' (filtered)'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search files by name..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={`${filters.sortBy}-${filters.sortOrder}`} 
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-')
              updateFilter('sortBy', sortBy)
              updateFilter('sortOrder', sortOrder)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uploaded_at-desc">Newest First</SelectItem>
              <SelectItem value="uploaded_at-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="size-desc">Largest First</SelectItem>
              <SelectItem value="size-asc">Smallest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Upload Date</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "PPP")
                      ) : (
                        "From date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => updateFilter('dateRange', { 
                        ...filters.dateRange, 
                        from: date || null 
                      })}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "PPP")
                      ) : (
                        "To date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => updateFilter('dateRange', { 
                        ...filters.dateRange, 
                        to: date || null 
                      })}
                      disabled={(date) => {
                        // Ensure we only return boolean values
                        const isAfterToday = date > new Date();
                        const isBeforeFromDate = filters.dateRange.from 
                          ? date < filters.dateRange.from 
                          : false;
                        return isAfterToday || isBeforeFromDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="space-y-2">
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {availableTags
                    .filter(tag => !filters.tags.includes(tag))
                    .slice(0, 10)
                    .map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        className="h-7 text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}