'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MediaUploadZone } from '@/components/media/media-upload-zone'
import { MediaGrid } from '@/components/media/media-grid'
import { MediaFilters } from '@/components/media/media-filters'
import { MediaEditDialog } from '@/components/media/media-edit-dialog'
import { MediaStats } from '@/components/media/media-stats'
import { MediaToolbar } from '@/components/media/media-toolbar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Image as ImageIcon, CircleAlert as AlertCircle } from 'lucide-react'
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
  description?: string
}

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

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [filters, setFilters] = useState<MediaFilters>({
    search: '',
    type: 'all',
    dateRange: { from: null, to: null },
    tags: [],
    sortBy: 'uploaded_at',
    sortOrder: 'desc'
  })

  const supabase = createClient()

  // Load media items
  const loadMediaItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mock data for demonstration
      const mockMediaItems: MediaItem[] = [
        {
          id: '1',
          name: 'product-hero-image.jpg',
          type: 'image/jpeg',
          size: 2048576,
          url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=300&fit=crop',
          uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['product', 'hero', 'marketing'],
          alt_text: 'Product hero image showing main features',
          description: 'Main hero image for product landing page'
        },
        {
          id: '2',
          name: 'team-photo.jpg',
          type: 'image/jpeg',
          size: 1536000,
          url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=300&fit=crop',
          uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['team', 'about', 'people'],
          alt_text: 'Team photo in office environment',
          description: 'Company team photo for about page'
        },
        {
          id: '3',
          name: 'demo-video.mp4',
          type: 'video/mp4',
          size: 15728640,
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['demo', 'video', 'tutorial'],
          description: 'Product demonstration video'
        },
        {
          id: '4',
          name: 'social-media-template.png',
          type: 'image/png',
          size: 512000,
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
          uploaded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['social', 'template', 'design'],
          alt_text: 'Social media post template',
          description: 'Template for social media posts'
        },
        {
          id: '5',
          name: 'brand-guidelines.pdf',
          type: 'application/pdf',
          size: 3072000,
          url: '#',
          uploaded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['brand', 'guidelines', 'document'],
          description: 'Company brand guidelines document'
        }
      ]

      setMediaItems(mockMediaItems)
    } catch (error) {
      console.error('Error loading media items:', error)
      toast.error('Failed to load media files')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadMediaItems()
  }, [loadMediaItems])

  // Filter and sort media items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...mediaItems]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => {
        switch (filters.type) {
          case 'image':
            return item.type.startsWith('image/')
          case 'video':
            return item.type.startsWith('video/')
          case 'document':
            return !item.type.startsWith('image/') && !item.type.startsWith('video/')
          default:
            return true
        }
      })
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.uploaded_at)
        const fromDate = filters.dateRange.from
        const toDate = filters.dateRange.to

        if (fromDate && itemDate < fromDate) return false
        if (toDate && itemDate > toDate) return false
        return true
      })
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(item =>
        filters.tags.some(tag => item.tags?.includes(tag))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'uploaded_at':
        default:
          aValue = new Date(a.uploaded_at)
          bValue = new Date(b.uploaded_at)
          break
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [mediaItems, filters])

  // Get available tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    mediaItems.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [mediaItems])

  // Calculate stats
  const stats = useMemo(() => {
    const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0)
    const storageLimit = 1024 * 1024 * 1024 * 5 // 5GB limit
    
    const fileTypes = {
      images: mediaItems.filter(item => item.type.startsWith('image/')).length,
      videos: mediaItems.filter(item => item.type.startsWith('video/')).length,
      documents: mediaItems.filter(item => 
        !item.type.startsWith('image/') && !item.type.startsWith('video/')
      ).length
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentUploads = mediaItems.filter(item => 
      new Date(item.uploaded_at) > weekAgo
    ).length

    return {
      totalFiles: mediaItems.length,
      totalSize,
      storageLimit,
      fileTypes,
      recentUploads
    }
  }, [mediaItems])

  const handleUploadComplete = (uploadedFiles: any[]) => {
    const newMediaItems = uploadedFiles.map(file => ({
      ...file,
      tags: [],
      alt_text: '',
      description: ''
    }))
    
    setMediaItems(prev => [...newMediaItems, ...prev])
    setIsUploadDialogOpen(false)
  }

  const handleDelete = async (itemIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${itemIds.length} file(s)?`)) {
      return
    }

    try {
      // In a real app, you would delete from storage and database
      setMediaItems(prev => prev.filter(item => !itemIds.includes(item.id)))
      setSelectedItems([])
      toast.success(`${itemIds.length} file(s) deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete files')
    }
  }

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item)
  }

  const handleSaveEdit = (updatedItem: MediaItem) => {
    setMediaItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    )
    setEditingItem(null)
  }

  const handleDownloadSelected = () => {
    selectedItems.forEach(itemId => {
      const item = mediaItems.find(i => i.id === itemId)
      if (item) {
        const link = document.createElement('a')
        link.href = item.url
        link.download = item.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
    toast.success(`${selectedItems.length} file(s) downloaded`)
  }

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading media library...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            Media Library
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your images, videos, and documents
          </p>
        </div>
      </div>

      {/* Stats */}
      <MediaStats {...stats} />

      {/* Toolbar */}
      <MediaToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedItems.length}
        onUpload={() => setIsUploadDialogOpen(true)}
        onDownloadSelected={handleDownloadSelected}
        onDeleteSelected={() => handleDelete(selectedItems)}
        onRefresh={loadMediaItems}
        searchQuery={filters.search}
        onSearchChange={(search) => setFilters(prev => ({ ...prev, search }))}
        isLoading={isLoading}
      />

      {/* Filters */}
      <MediaFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
        totalItems={mediaItems.length}
        filteredItems={filteredAndSortedItems.length}
      />

      {/* No results */}
      {filteredAndSortedItems.length === 0 && mediaItems.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No files match your current filters. Try adjusting your search criteria.
          </AlertDescription>
        </Alert>
      )}

      {/* Media Grid */}
      <MediaGrid
        items={filteredAndSortedItems}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onDelete={handleDelete}
        onEdit={handleEdit}
        viewMode={viewMode}
      />

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media Files</DialogTitle>
            <DialogDescription>
              Upload images, videos, and documents to your media library
            </DialogDescription>
          </DialogHeader>
          <MediaUploadZone
            onUploadComplete={handleUploadComplete}
            maxFiles={10}
            maxSize={50}
            acceptedTypes={['image/*', 'video/*', 'application/pdf']}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <MediaEditDialog
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </div>
  )
}