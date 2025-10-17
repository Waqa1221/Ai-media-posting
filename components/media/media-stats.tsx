'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  HardDrive, 
  Image, 
  Video, 
  File,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface MediaStatsProps {
  totalFiles: number
  totalSize: number
  storageLimit: number
  fileTypes: {
    images: number
    videos: number
    documents: number
  }
  recentUploads: number
}

export function MediaStats({
  totalFiles,
  totalSize,
  storageLimit,
  fileTypes,
  recentUploads
}: MediaStatsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const storageUsedPercent = (totalSize / storageLimit) * 100

  const getStorageColor = () => {
    if (storageUsedPercent >= 90) return 'text-red-600'
    if (storageUsedPercent >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Storage Usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="w-5 h-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatFileSize(totalSize)}</span>
              <span className="text-sm text-muted-foreground">
                of {formatFileSize(storageLimit)}
              </span>
            </div>
            <Progress value={storageUsedPercent} className="h-2" />
            <div className={`text-sm font-medium ${getStorageColor()}`}>
              {storageUsedPercent.toFixed(1)}% used
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Files */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <File className="w-5 h-5" />
            Total Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{totalFiles.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              Files in your library
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Types Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Image className="w-5 h-5" />
            File Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Images</span>
              </div>
              <span className="text-sm font-medium">{fileTypes.images}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Videos</span>
              </div>
              <span className="text-sm font-medium">{fileTypes.videos}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-green-500" />
                <span className="text-sm">Documents</span>
              </div>
              <span className="text-sm font-medium">{fileTypes.documents}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{recentUploads}</div>
            <div className="text-sm text-muted-foreground">
              Files uploaded this week
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Calendar className="w-3 h-3" />
              <span>+{Math.round(recentUploads * 0.3)} from last week</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}