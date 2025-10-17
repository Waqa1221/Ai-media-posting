'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Save, X, Plus } from 'lucide-react'
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

interface MediaEditDialogProps {
  item: MediaItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (item: MediaItem) => void
}

export function MediaEditDialog({
  item,
  isOpen,
  onClose,
  onSave
}: MediaEditDialogProps) {
  const [editedItem, setEditedItem] = useState<MediaItem | null>(null)
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setEditedItem({ ...item })
    }
  }, [item])

  const handleSave = async () => {
    if (!editedItem) return

    try {
      setIsSaving(true)
      
      // Validate required fields
      if (!editedItem.name.trim()) {
        toast.error('File name is required')
        return
      }

      await onSave(editedItem)
      toast.success('Media file updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update media file')
    } finally {
      setIsSaving(false)
    }
  }

  const addTag = () => {
    if (!editedItem || !newTag.trim()) return
    
    const tag = newTag.trim().toLowerCase()
    if (!editedItem.tags?.includes(tag)) {
      setEditedItem({
        ...editedItem,
        tags: [...(editedItem.tags || []), tag]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (!editedItem) return
    
    setEditedItem({
      ...editedItem,
      tags: editedItem.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  const updateField = (field: keyof MediaItem, value: any) => {
    if (!editedItem) return
    
    setEditedItem({
      ...editedItem,
      [field]: value
    })
  }

  if (!editedItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Media File</DialogTitle>
          <DialogDescription>
            Update the details and metadata for this media file
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {editedItem.type.startsWith('image/') ? (
                <img
                  src={editedItem.thumbnail || editedItem.url}
                  alt={editedItem.alt_text || editedItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {editedItem.type.startsWith('video/') ? '🎥' : '📄'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {editedItem.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Size:</strong> {(editedItem.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {editedItem.type}</p>
              <p><strong>Uploaded:</strong> {new Date(editedItem.uploaded_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">File Name</Label>
              <Input
                id="name"
                value={editedItem.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter file name"
              />
            </div>

            <div>
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                value={editedItem.alt_text || ''}
                onChange={(e) => updateField('alt_text', e.target.value)}
                placeholder="Describe this image for accessibility"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedItem.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Add a description for this file"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {editedItem.tags && editedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {editedItem.tags.map((tag) => (
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
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}