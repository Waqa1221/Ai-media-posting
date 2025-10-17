'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  Clock, 
  Hash, 
  Image,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Calendar
} from 'lucide-react'
import { socialMediaBestPractices } from '@/lib/social/best-practices'

interface PlatformBestPracticesWidgetProps {
  selectedPlatforms: string[]
  content?: string
  hashtags?: string[]
  mediaCount?: number
}

export function PlatformBestPracticesWidget({
  selectedPlatforms,
  content = '',
  hashtags = [],
  mediaCount = 0
}: PlatformBestPracticesWidgetProps) {
  const [activeTab, setActiveTab] = useState(selectedPlatforms[0] || 'instagram')

  const getValidationResults = (platform: string) => {
    return socialMediaBestPractices.validateContent(platform, content, hashtags, mediaCount)
  }

  const getContentScore = (platform: string) => {
    return socialMediaBestPractices.getContentScore(platform, content, hashtags, mediaCount)
  }

 const getPlatformIcon = (platform: string) => {
  const icons: { [key: string]: string } = {
    instagram: '📸',
    linkedin: '💼',
    twitter: '🐦',
    facebook: '📘',
    tiktok: '🎵',
    youtube: '📺',
    pinterest: '📌'
  }
  return icons[platform] || '📱'
}

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  if (selectedPlatforms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Platform Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select platforms to see best practices</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Platform Best Practices
        </CardTitle>
        <CardDescription>
          Optimize your content for each platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-auto">
            {selectedPlatforms.map((platform) => (
              <TabsTrigger key={platform} value={platform} className="flex items-center gap-2">
                <span>{getPlatformIcon(platform)}</span>
                <span className="capitalize">{platform}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {selectedPlatforms.map((platform) => {
            const guidelines = socialMediaBestPractices.getPlatformGuidelines(platform)
            const validation = getValidationResults(platform)
            const scoreData = getContentScore(platform)

            if (!guidelines) return null

            return (
              <TabsContent key={platform} value={platform} className="space-y-6">
                {/* Content Score */}
                {content && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className={`text-3xl font-bold ${getScoreColor(scoreData.score)} mb-1`}>
                        {scoreData.score}/100
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getScoreLabel(scoreData.score)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Score Breakdown</h4>
                      {Object.entries(scoreData.breakdown).map(([category, score]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-medium">{score}/25</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Results */}
                {content && (
                  <div className="space-y-3">
                    {validation.errors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {validation.errors.map((error, index) => (
                              <div key={index}>• {error}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.warnings.length > 0 && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <div className="space-y-1">
                            {validation.warnings.map((warning, index) => (
                              <div key={index}>• {warning}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.suggestions.length > 0 && (
                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <div className="font-medium">Suggestions to improve:</div>
                            {validation.suggestions.map((suggestion, index) => (
                              <div key={index}>• {suggestion}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Platform Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Content Guidelines */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Content Guidelines
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Character Limit</span>
                        <Badge variant="outline">
                          {guidelines.contentGuidelines.maxLength.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Optimal Length</span>
                        <Badge variant="outline">
                          {guidelines.contentGuidelines.optimalLength}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hashtag Limit</span>
                        <Badge variant="outline">
                          {guidelines.contentGuidelines.hashtagLimit}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Optimal Hashtags</span>
                        <Badge variant="outline">
                          {guidelines.contentGuidelines.optimalHashtags}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Media Required</span>
                        <Badge className={guidelines.contentGuidelines.mediaRequired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {guidelines.contentGuidelines.mediaRequired ? 'Yes' : 'Optional'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Posting Schedule */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Posting Schedule
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Optimal Times</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {guidelines.postingSchedule.optimalTimes.map((time) => (
                            <Badge key={time} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Recommended Frequency</span>
                        <Badge variant="outline">
                          {guidelines.postingSchedule.frequency.recommended}/week
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Frequency Range</span>
                        <Badge variant="outline">
                          {guidelines.postingSchedule.frequency.min}-{guidelines.postingSchedule.frequency.max}/week
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Types */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Content Types Performance
                  </h4>
                  <div className="space-y-3">
                    {guidelines.contentTypes.map((contentType, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{contentType.type}</div>
                          <div className="text-xs text-muted-foreground">{contentType.description}</div>
                        </div>
                        <Badge className={
                          contentType.performance === 'high' ? 'bg-green-100 text-green-800' :
                          contentType.performance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {contentType.performance}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engagement Tips */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Engagement Tips
                  </h4>
                  <div className="space-y-2">
                    {guidelines.engagementTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Common Mistakes to Avoid
                  </h4>
                  <div className="space-y-2">
                    {guidelines.commonMistakes.map((mistake, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}