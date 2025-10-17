'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Facebook, Instagram, Twitter, Linkedin, MessageSquare, Hash, Clock, Lightbulb } from 'lucide-react'
import { PLATFORM_CONFIGS } from '@/lib/ai/config'

interface PlatformInfoCardProps {
  platform: string
}

const PLATFORM_ICONS = {
  facebook: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  twitter: { icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50' },
  linkedin: { icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
}

export function PlatformInfoCard({ platform }: PlatformInfoCardProps) {
  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]
  const platformIcon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]

  if (!config || !platformIcon) return null

  const Icon = platformIcon.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${platformIcon.color}`} />
          {platform.charAt(0).toUpperCase() + platform.slice(1)} Insights
        </CardTitle>
        <CardDescription>
          Platform-specific guidelines for optimal engagement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Characteristics */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Characteristics</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {config.characteristics}
          </p>
        </div>

        {/* Platform Constraints */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${platformIcon.bg}`}>
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className={`w-3 h-3 ${platformIcon.color}`} />
              <span className="text-xs font-medium">Max Length</span>
            </div>
            <div className={`text-sm font-bold ${platformIcon.color}`}>
              {config.maxCaptionLength > 1000
                ? `${Math.floor(config.maxCaptionLength / 1000)}k+ chars`
                : `${config.maxCaptionLength} chars`}
            </div>
          </div>

          <div className={`p-3 rounded-lg ${platformIcon.bg}`}>
            <div className="flex items-center gap-1 mb-1">
              <Hash className={`w-3 h-3 ${platformIcon.color}`} />
              <span className="text-xs font-medium">Hashtags</span>
            </div>
            <div className={`text-sm font-bold ${platformIcon.color}`}>
              Max {config.maxHashtags}
            </div>
          </div>
        </div>

        {/* Optimal Times */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Best Times to Post</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.optimalTimes.map((time) => (
              <Badge key={time} variant="secondary" className="text-xs">
                {time}
              </Badge>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Best Practices</span>
          </div>
          <ul className="space-y-1">
            {config.bestPractices.map((practice, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className={`mt-1 w-1 h-1 rounded-full ${platformIcon.bg} flex-shrink-0`}></span>
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Types */}
        <div>
          <div className="text-xs font-medium mb-2 text-muted-foreground">Supported Content Types</div>
          <div className="flex flex-wrap gap-1">
            {config.contentTypes.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
