'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Grid3X3, 
  List, 
  Download, 
  Trash2,
  RefreshCw,
  Settings,
  Search
} from 'lucide-react'

interface MediaToolbarProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  selectedCount: number
  onUpload: () => void
  onDownloadSelected: () => void
  onDeleteSelected: () => void
  onRefresh: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading?: boolean
}

export function MediaToolbar({
  viewMode,
  onViewModeChange,
  selectedCount,
  onUpload,
  onDownloadSelected,
  onDeleteSelected,
  onRefresh,
  searchQuery,
  onSearchChange,
  isLoading = false
}: MediaToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Left side - Search and actions */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadSelected}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Right side - View controls and actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={onUpload}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  )
}