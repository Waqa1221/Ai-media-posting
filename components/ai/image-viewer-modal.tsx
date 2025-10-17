'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageViewerModalProps {
  images: string[]
  selectedIndex: number
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string, index: number) => void
  selectedImage?: string
}

export function ImageViewerModal({
  images,
  selectedIndex,
  isOpen,
  onClose,
  onSelect,
  selectedImage
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    setCurrentIndex(selectedIndex)
  }, [selectedIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Enter':
        case ' ':
          handleSelect()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
    setIsZoomed(false)
  }

  const handleNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
    setIsZoomed(false)
  }

  const handleSelect = () => {
    onSelect(images[currentIndex], currentIndex)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex])
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-generated-image-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const currentImage = images[currentIndex]
  const isSelected = selectedImage === currentImage

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="relative w-full h-full bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {currentIndex + 1} of {images.length}
                </Badge>
                {isSelected && (
                  <Badge className="bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-white hover:bg-white/20"
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={`AI Generated Image ${currentIndex + 1}`}
              className={cn(
                "max-w-full max-h-full object-contain transition-transform duration-300 cursor-pointer",
                isZoomed ? "scale-150" : "scale-100"
              )}
              onClick={() => setIsZoomed(!isZoomed)}
            />
            
            {/* Loading overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-black/60 rounded-lg p-2">
                <Maximize2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* Thumbnail Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-md">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      index === currentIndex 
                        ? "border-white scale-110" 
                        : "border-white/30 hover:border-white/60"
                    )}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  className={cn(
                    "transition-all",
                    isSelected 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select This Image'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="absolute top-20 right-4 bg-black/60 rounded-lg p-3 text-white text-xs space-y-1 opacity-60 hover:opacity-100 transition-opacity">
            <div>← → Navigate</div>
            <div>Space/Enter Select</div>
            <div>Esc Close</div>
            <div>Click Zoom</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}