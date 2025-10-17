'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Sparkles, CreditCard, Link, ArrowRight } from 'lucide-react'
import { SOCIAL_PLATFORMS } from '@/lib/constants/industries'
import type { OnboardingData } from '@/hooks/use-onboarding'

interface CompletionStepProps {
  data: OnboardingData
  onStartSubscription: () => void
  onGenerateSampleContent: () => void
  onConnectPlatforms: () => void
  isGenerating?: boolean
}

export function CompletionStep({
  data,
  onStartSubscription,
  onGenerateSampleContent,
  onConnectPlatforms,
  isGenerating = false
}: CompletionStepProps) {
  const selectedPlatforms = data.platforms?.selectedPlatforms || []

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Welcome to your social media journey!
              </h3>
              <p className="text-green-700">
                Your profile is set up and ready. Let's get you started with some next steps.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Summary</CardTitle>
          <CardDescription>
            Here's what we learned about your business and goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Company</h4>
              <p className="font-medium">{data.businessInfo?.companyName}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Industry</h4>
              <p className="font-medium capitalize">
                {data.businessInfo?.industry?.replace('-', ' ')}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Target Audience</h4>
              <p className="font-medium">{data.audience?.primaryAgeRange} in {data.audience?.location}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Posting Frequency</h4>
              <p className="font-medium capitalize">
                {data.brandVoice?.postingFrequency?.replace('-', ' ')}
              </p>
            </div>
          </div>

          {selectedPlatforms.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Selected Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlatforms.map((platformId) => {
                  const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId)
                  return platform ? (
                    <Badge key={platformId} variant="secondary" className="flex items-center gap-1">
                      <span>{platform.icon}</span>
                      {platform.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subscription */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-5 h-5 text-primary" />
              Choose Your Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Unlock advanced features and higher limits with a subscription plan.
            </p>
            <Button onClick={onStartSubscription} className="w-full">
              View Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* AI Content */}
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generate Sample Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Let AI create personalized content based on your brand voice and audience.
            </p>
            <Button 
              onClick={onGenerateSampleContent} 
              variant="outline" 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Connect Platforms */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="w-5 h-5 text-blue-600" />
              Connect Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your social media accounts to start publishing content.
            </p>
            <Button onClick={onConnectPlatforms} variant="outline" className="w-full">
              Connect Accounts
              <Link className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}