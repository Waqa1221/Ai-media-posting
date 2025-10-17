'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, AlertCircle, Loader2, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface TestResult {
  success: boolean
  message?: string
  error?: string
  details?: any
  instructions?: string[]
}

export default function TestSocialPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const testPlatform = async (platform: string) => {
    setIsLoading(prev => ({ ...prev, [platform]: true }))
    setResults(prev => ({ ...prev, [platform]: { success: false } }))

    try {
      const response = await fetch(`/api/health/${platform}`)
      const data = await response.json()

      setResults(prev => ({
        ...prev,
        [platform]: {
          success: data.success,
          message: data.message,
          error: data.error,
          details: data.details,
          instructions: data.instructions
        }
      }))
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [platform]: {
          success: false,
          error: 'Network error occurred',
          message: 'Failed to connect to test endpoint'
        }
      }))
    } finally {
      setIsLoading(prev => ({ ...prev, [platform]: false }))
    }
  }

  const testAllPlatforms = async () => {
    const platforms = ['twitter', 'linkedin', 'instagram', 'facebook']
    for (const platform of platforms) {
      await testPlatform(platform)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      color: 'bg-gray-100 text-gray-800',
      description: 'Real-time social networking',
      setupGuide: '/docs/social-media-api-keys-guide.md#twitterx-api-setup'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-100 text-blue-800',
      description: 'Professional networking',
      setupGuide: '/docs/social-media-api-keys-guide.md#linkedin-api-setup'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'bg-pink-100 text-pink-800',
      description: 'Visual storytelling',
      setupGuide: '/docs/instagram-integration-guide.md'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-100 text-blue-800',
      description: 'Community building',
      setupGuide: '/docs/social-media-api-keys-guide.md#facebook-api-setup'
    }
  ]

  const getResultIcon = (platform: string) => {
    const result = results[platform]
    const loading = isLoading[platform]

    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
    if (!result) return null
    if (result.success) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <AlertCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Social Media Integration Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your social media API configurations and verify integrations are working
        </p>
      </div>

      {/* Quick Test All */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Test All Platforms</CardTitle>
          <CardDescription>
            Test all social media integrations at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAllPlatforms}
            disabled={Object.values(isLoading).some(loading => loading)}
            className="w-full"
          >
            {Object.values(isLoading).some(loading => loading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing All Platforms...
              </>
            ) : (
              'Test All Social Media APIs'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Individual Platform Tests */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((platform) => {
              const result = results[platform.id]
              const loading = isLoading[platform.id]

              return (
                <Card key={platform.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${platform.color}`}>
                          {platform.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <CardDescription>{platform.description}</CardDescription>
                        </div>
                      </div>
                      {getResultIcon(platform.id)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => testPlatform(platform.id)}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        `Test ${platform.name} API`
                      )}
                    </Button>

                    {result && (
                      <div className="space-y-2">
                        {result.success ? (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              <strong>Success!</strong> {result.message}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Error:</strong> {result.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    <Button variant="link" size="sm" asChild className="w-full">
                      <Link href={platform.setupGuide}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Setup Guide
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Individual Platform Tabs */}
        {platforms.map((platform) => (
          <TabsContent key={platform.id} value={platform.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{platform.icon}</span>
                  {platform.name} Integration Test
                </CardTitle>
                <CardDescription>
                  Test your {platform.name} API configuration and connectivity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => testPlatform(platform.id)}
                  disabled={isLoading[platform.id]}
                  className="w-full"
                >
                  {isLoading[platform.id] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing {platform.name} Connection...
                    </>
                  ) : (
                    `Test ${platform.name} API`
                  )}
                </Button>

                {results[platform.id] && (
                  <div className="space-y-4">
                    {results[platform.id].success ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Success!</strong> {results[platform.id].message}
                          {results[platform.id].details && (
                            <div className="mt-2">
                              <strong>Details:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {Object.entries(results[platform.id].details).map(([key, value]) => (
                                  <li key={key}>
                                    {key.replace(/_/g, ' ')}: {value ? '✅' : '❌'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Error:</strong> {results[platform.id].error}
                          {results[platform.id].instructions && (
                            <div className="mt-3">
                              <strong>Solutions:</strong>
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                {results[platform.id].instructions?.map((instruction, index) => (
  <li key={index}>{instruction}</li>
))}
                              </ul>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Platform-specific setup instructions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">{platform.name} Setup Instructions:</h3>
                  {platform.id === 'twitter' && (
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Apply for Twitter Developer account at <a href="https://developer.twitter.com" target="_blank" className="text-blue-600 hover:underline">developer.twitter.com</a></li>
                      <li>Create a new app and get API keys</li>
                      <li>Add keys to .env.local: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_BEARER_TOKEN</li>
                      <li>Set app permissions to "Read and Write"</li>
                      <li>Apply for Elevated access if needed</li>
                    </ol>
                  )}
                  {platform.id === 'linkedin' && (
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Create LinkedIn app at <a href="https://developer.linkedin.com" target="_blank" className="text-blue-600 hover:underline">developer.linkedin.com</a></li>
                      <li>Add your company's LinkedIn page</li>
                      <li>Get Client ID and Client Secret</li>
                      <li>Add to .env.local: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET</li>
                      <li>Request Marketing Developer Platform access</li>
                    </ol>
                  )}
                  {platform.id === 'instagram' && (
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Create Facebook app at <a href="https://developers.facebook.com" target="_blank" className="text-blue-600 hover:underline">developers.facebook.com</a></li>
                      <li>Add Instagram Basic Display product</li>
                      <li>Get App ID and App Secret</li>
                      <li>Add to .env.local: INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET</li>
                      <li>Convert Instagram to Business account</li>
                      <li>Connect Instagram to Facebook Page</li>
                    </ol>
                  )}
                  {platform.id === 'facebook' && (
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Use same Facebook app as Instagram</li>
                      <li>Add Facebook Login product</li>
                      <li>Add Pages API product</li>
                      <li>Same credentials: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET</li>
                      <li>Create Facebook Business Page</li>
                    </ol>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Environment Variables Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Variables Setup</CardTitle>
          <CardDescription>
            Required environment variables for social media integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm">
              <pre>{`# Social Media API Configuration

# Twitter/X Configuration
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# LinkedIn Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

# Instagram Configuration (via Facebook App)
INSTAGRAM_CLIENT_ID=your_facebook_app_id_here
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret_here

# Facebook Configuration (same as Instagram)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# TikTok Configuration (Optional)
TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here

# Site URL for OAuth callbacks
NEXT_PUBLIC_SITE_URL=https://yourdomain.com`}</pre>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> After adding environment variables, restart your development server 
                for changes to take effect.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Links & Resources</CardTitle>
          <CardDescription>
            Helpful links for setting up social media integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">Developer Portals</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Twitter Developer Portal
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://developer.linkedin.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    LinkedIn Developer Portal
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Facebook Developer Portal
                  </a>
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Documentation</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/docs/social-media-api-keys-guide.md">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Complete API Keys Guide
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/docs/instagram-integration-guide.md">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Instagram Integration Guide
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/docs/troubleshooting/common-issues.md">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Troubleshooting Guide
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}