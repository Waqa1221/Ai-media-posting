'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageViewerModal } from './image-viewer-modal'
import { 
  Sparkles, 
  RefreshCw, 
  Save, 
  Calendar,
  Copy,
  Edit,
  Image as ImageIcon,
  Clock,
  Hash,
  Target,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedContentDisplayProps {
  result: {
    caption: string
    hashtags: string[]
    image_prompt: string
    generated_images?: string[]
    selected_image?: string
    optimal_time: string
    cta: string | null
    engagement_hooks?: string[]
    content_pillars?: string[]
  }
  onRegenerate: () => void
  onSave: (content: any) => void
  isRegenerating?: boolean
}

export default function GeneratedContentDisplay({
  result,
  onRegenerate,
  onSave,
  isRegenerating = false
}: GeneratedContentDisplayProps) {
  const [editedCaption, setEditedCaption] = useState(result.caption)
  const [editedHashtags, setEditedHashtags] = useState(result.hashtags)
  const [selectedImage, setSelectedImage] = useState(result.selected_image || result.generated_images?.[0] || '')
  const [scheduleForOptimalTime, setScheduleForOptimalTime] = useState(false)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(editedCaption)
      toast.success('Caption copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy caption')
    }
  }

  const handleCopyHashtags = async () => {
    try {
      const hashtagText = editedHashtags.map(tag => `#${tag}`).join(' ')
      await navigator.clipboard.writeText(hashtagText)
      toast.success('Hashtags copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy hashtags')
    }
  }

  const handleImageSelect = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl)
    setSelectedImageIndex(index)
    setIsImageViewerOpen(false)
  }

  const handleSave = () => {
    const contentToSave = {
      caption: editedCaption,
      hashtags: editedHashtags,
      image_prompt: result.image_prompt,
      generated_images: result.generated_images,
      selected_image: selectedImage,
      optimal_time: result.optimal_time,
      cta: result.cta,
      engagement_hooks: result.engagement_hooks,
      content_pillars: result.content_pillars,
      schedule_for_optimal_time: scheduleForOptimalTime
    }
    
    onSave(contentToSave)
  }

  const handleSchedulePost = () => {
    const contentToSchedule = {
      caption: editedCaption,
      hashtags: editedHashtags,
      image_prompt: result.image_prompt,
      generated_images: result.generated_images,
      selected_image: selectedImage,
      optimal_time: result.optimal_time,
      cta: result.cta,
      engagement_hooks: result.engagement_hooks,
      content_pillars: result.content_pillars
    }
    
    // Redirect to scheduler with AI content
    const encodedContent = encodeURIComponent(JSON.stringify(contentToSchedule))
    window.location.href = `/dashboard/scheduler?ai-content=${encodedContent}`
  }

  const removeHashtag = (index: number) => {
    setEditedHashtags(prev => prev.filter((_, i) => i !== index))
  }

  const addHashtag = (tag: string) => {
    if (tag.trim() && !editedHashtags.includes(tag.trim())) {
      setEditedHashtags(prev => [...prev, tag.trim()])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Generated Content
              </CardTitle>
              <CardDescription>
                AI-generated content ready for your review and customization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Preview/Edit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Post Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Caption</label>
                <Textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="min-h-[120px]"
                  placeholder="Edit your caption..."
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">
                    {editedCaption.length} characters
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleCopyCaption}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">
                {editedCaption}
              </p>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleCopyCaption}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Caption
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Hashtags ({editedHashtags.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {editedHashtags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-1 text-blue-600 bg-blue-50"
                >
                  #{tag}
                  {isEditing && (
                    <button
                      onClick={() => removeHashtag(index)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleCopyHashtags}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Hashtags
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Images */}
      {result.generated_images && result.generated_images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Generated Images
            </CardTitle>
            <CardDescription>
              AI-generated images based on your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {result.generated_images.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:shadow-md ${
                    selectedImage === imageUrl ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  onClick={() => {
                    setSelectedImageIndex(index)
                    setIsImageViewerOpen(true)
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === imageUrl && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground">
                        Selected
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Image Prompt:</strong> {result.image_prompt}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Optimization Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Optimal Posting Time</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {result.optimal_time}
                </Badge>
              </div>
              
              {result.cta && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Call to Action</span>
                  <Badge variant="outline">{result.cta}</Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Length</span>
                <Badge variant="outline">{editedCaption.length} chars</Badge>
              </div>
            </div>

            {result.engagement_hooks && result.engagement_hooks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Engagement Hooks</h4>
                <div className="space-y-1">
                  {result.engagement_hooks.map((hook, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {hook}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Publishing Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={scheduleForOptimalTime}
                onCheckedChange={setScheduleForOptimalTime}
              />
              <label className="text-sm font-medium">
                Schedule for optimal time ({result.optimal_time})
              </label>
            </div>
            
            {scheduleForOptimalTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Your post will be scheduled for {result.optimal_time} for maximum engagement
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSchedulePost}
          variant="outline"
          className="flex-1"
          disabled={isRegenerating}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
        
        <Button
          onClick={handleSave}
          className="flex-1"
          disabled={isRegenerating}
        >
          <Save className="w-4 h-4 mr-2" />
          {scheduleForOptimalTime ? 'Schedule Post' : 'Save as Draft'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            const content = `${editedCaption}\n\n${editedHashtags.map(tag => `#${tag}`).join(' ')}`
            navigator.clipboard.writeText(content)
            toast.success('Full content copied to clipboard!')
          }}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy All
        </Button>
      </div>

      {/* Image Viewer Modal */}
      {result.generated_images && (
        <ImageViewerModal
          images={result.generated_images}
          selectedIndex={selectedImageIndex}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          onSelect={handleImageSelect}
          selectedImage={selectedImage}
        />
      )}
    </div>
  )
}