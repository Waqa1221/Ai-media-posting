'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Edit, 
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Video,
  File
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface MediaItem {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnail?: string
  uploaded_at: string
  tags?: string[]
  alt_text?: string
}

interface MediaGridProps {
  items: MediaItem[]
  selectedItems: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onDelete: (itemIds: string[]) => void
  onEdit: (item: MediaItem) => void
  viewMode: 'grid' | 'list'
}

export function MediaGrid({
  items,
  selectedItems,
  onSelectionChange,
  onDelete,
  onEdit,
  viewMode
}: MediaGridProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const toggleSelection = (itemId: string) => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId]
    onSelectionChange(newSelection)
  }

  const selectAll = () => {
    onSelectionChange(items.map(item => item.id))
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const downloadFile = (item: MediaItem) => {
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileType = (type: string) => {
    if (type.startsWith('image/')) return 'Image'
    if (type.startsWith('video/')) return 'Video'
    return 'File'
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No media files yet
          </h3>
          <p className="text-muted-foreground">
            Upload your first media file to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {/* Selection Controls */}
        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(selectedItems)}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* List View */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelection(item.id)}
                  />
                  
                  <div className="flex-shrink-0">
                    {item.type.startsWith('image/') ? (
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.alt_text || item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(item.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{getFileType(item.type)}</span>
                      <span>{formatFileSize(item.size)}</span>
                      <span>{format(new Date(item.uploaded_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyUrl(item.url)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadFile(item)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete([item.id])}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.length === items.length}
            onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.length > 0 
              ? `${selectedItems.length} selected`
              : 'Select all'
            }
          </span>
        </div>
        
        {selectedItems.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(selectedItems)}
          >
            Delete Selected ({selectedItems.length})
          </Button>
        )}
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`group cursor-pointer transition-all hover:shadow-md ${
              selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
            }`}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square">
                {item.type.startsWith('image/') ? (
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.alt_text || item.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-t-lg flex items-center justify-center">
                    {getFileIcon(item.type)}
                    <span className="ml-2 text-sm font-medium">
                      {getFileType(item.type)}
                    </span>
                  </div>
                )}
                
                {/* Overlay */}
                <div className={`absolute inset-0 bg-black/50 rounded-t-lg transition-opacity ${
                  hoveredItem === item.id || selectedItems.includes(item.id)
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}>
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelection(item.id)}
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyUrl(item.url)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadFile(item)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete([item.id])}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <h4 className="font-medium text-sm truncate mb-1">
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{format(new Date(item.uploaded_at), 'MMM dd')}</span>
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}