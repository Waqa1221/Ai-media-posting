'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Image, Video, File, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface MediaFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

interface MediaUploadZoneProps {
  onUploadComplete: (files: any[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function MediaUploadZone({
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ['image/*', 'video/*']
}: MediaUploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    const newFiles: MediaFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading'
    }))

    setUploadingFiles(newFiles)

    try {
      const uploadedFiles = []
      
      for (const mediaFile of newFiles) {
        try {
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))
            setUploadingFiles(prev => 
              prev.map(f => 
                f.id === mediaFile.id 
                  ? { ...f, progress }
                  : f
              )
            )
          }

          // Mock upload to storage (replace with actual upload logic)
          const uploadedFile = {
            id: mediaFile.id,
            name: mediaFile.file.name,
            size: mediaFile.file.size,
            type: mediaFile.file.type,
            url: mediaFile.preview, // In real app, this would be the uploaded URL
            thumbnail: mediaFile.preview,
            uploaded_at: new Date().toISOString()
          }

          uploadedFiles.push(uploadedFile)
          
          setUploadingFiles(prev => 
            prev.map(f => 
              f.id === mediaFile.id 
                ? { ...f, status: 'completed' }
                : f
            )
          )
        } catch (error) {
          setUploadingFiles(prev => 
            prev.map(f => 
              f.id === mediaFile.id 
                ? { ...f, status: 'error', error: 'Upload failed' }
                : f
            )
          )
        }
      }

      onUploadComplete(uploadedFiles)
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)
      
      // Clear uploading files after a delay
      setTimeout(() => {
        setUploadingFiles([])
      }, 2000)
      
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    disabled: isUploading
  })

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for images and videos up to {maxSize}MB each
                </p>
                <Button variant="outline" disabled={isUploading}>
                  Choose Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name}>
                  <strong>{file.name}</strong>: {errors.map(e => e.message).join(', ')}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {(file.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        {file.status === 'uploading' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadingFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {file.progress}% uploaded
                        </p>
                      </div>
                    )}
                    
                    {file.status === 'completed' && (
                      <p className="text-xs text-green-600">Upload completed</p>
                    )}
                    
                    {file.status === 'error' && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}