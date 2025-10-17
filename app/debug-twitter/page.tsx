'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader as Loader2, Twitter, Bug, Settings, Network, Database, Key, ExternalLink } from 'lucide-react'

export default function TwitterDebugPage() {
  const [debugResults, setDebugResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>({})

  const runFullDiagnostic = async () => {
    setIsLoading(true)
    setDebugResults(null)

    try {
      const response = await fetch('/api/debug/twitter-connection')
      const data = await response.json()
      setDebugResults(data)
    } catch (err) {
      setDebugResults({
        success: false,
        error: 'Failed to run diagnostic',
        debugInfo: { errors: ['Network error occurred'] }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runSpecificTest = async (testType: string) => {
    setTestResults((prev: any) => ({ ...prev, [testType]: { loading: true } }))

    try {
      const response = await fetch('/api/debug/twitter-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType })
      })

      const data = await response.json()
      setTestResults((prev: any) => ({ ...prev, [testType]: data }))
    } catch (error) {
      setTestResults((prev: any) => ({ 
        ...prev, 
        [testType]: { 
          success: false, 
          error: 'Test failed' 
        } 
      }))
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getCheckStatus = (check: any) => {
    if (typeof check === 'boolean') return check
    if (typeof check === 'object') {
      return check.success || check.connected || check.accessible || check.present
    }
    return false
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bug className="w-8 h-8" />
          Twitter API Debug Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive debugging tools for Twitter API authentication issues
        </p>
      </div>

      {/* Quick Diagnostic */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Full System Diagnostic</CardTitle>
          <CardDescription>
            Run a comprehensive check of your Twitter integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runFullDiagnostic}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostic...
              </>
            ) : (
              <>
                <Bug className="w-4 h-4 mr-2" />
                Run Full Diagnostic
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Diagnostic Results */}
      {debugResults && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="recommendations">Fixes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(debugResults.success)}
                  Diagnostic Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {debugResults.summary?.totalChecks || 0}
                    </div>
                    <div className="text-sm text-blue-600">Total Checks</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {debugResults.summary?.passedChecks || 0}
                    </div>
                    <div className="text-sm text-green-600">Passed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {debugResults.summary?.errorCount || 0}
                    </div>
                    <div className="text-sm text-red-600">Errors</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {debugResults.summary?.recommendationCount || 0}
                    </div>
                    <div className="text-sm text-yellow-600">Recommendations</div>
                  </div>
                </div>

                {debugResults.debugInfo?.errors?.length > 0 && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Critical Issues Found:</div>
                        {debugResults.debugInfo.errors.map((error: string, index: number) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Tests</CardTitle>
                <CardDescription>
                  Test specific components of your Twitter integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => runSpecificTest('profile_fetch')}
                    disabled={testResults.profile_fetch?.loading}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    {testResults.profile_fetch?.loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : testResults.profile_fetch?.success ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : testResults.profile_fetch ? (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <Twitter className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium">Test Profile Fetch</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => runSpecificTest('token_validation')}
                    disabled={testResults.token_validation?.loading}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    {testResults.token_validation?.loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : testResults.token_validation?.success ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : testResults.token_validation ? (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <Key className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium">Validate Tokens</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => runSpecificTest('api_permissions')}
                    disabled={testResults.api_permissions?.loading}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    {testResults.api_permissions?.loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : testResults.api_permissions?.success ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : testResults.api_permissions ? (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <Settings className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium">Check Permissions</span>
                  </Button>
                </div>

                {/* Test Results */}
                {Object.entries(testResults).map(([testType, result]: [string, any]) => (
                  result && !result.loading && (
                    <Alert key={testType} className={`mt-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      {getStatusIcon(result.success)}
                      <AlertDescription>
                        <div className="font-medium capitalize">{testType.replace('_', ' ')} Test:</div>
                        <div className="text-sm mt-1">
                          {result.success ? result.message : result.error}
                        </div>
                        {result.recommendation && (
                          <div className="text-sm mt-2 font-medium">
                            Recommendation: {result.recommendation}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Environment Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugResults.debugInfo?.checks?.environmentVariables && (
                  <div className="space-y-4">
                    {Object.entries(debugResults.debugInfo.checks.environmentVariables).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{key}</div>
                          <div className="text-sm text-muted-foreground">
                            {value.isPlaceholder ? 'Using placeholder value' : 
                             value.present ? `${value.length} characters` : 'Not set'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(value.present && !value.isPlaceholder)}
                          {value.isPlaceholder && (
                            <Badge variant="destructive">Placeholder</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connectivity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  API Connectivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debugResults.debugInfo?.checks?.apiConnectivity && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Twitter API Connection</div>
                          <div className="text-sm text-muted-foreground">
                            {debugResults.debugInfo.checks.apiConnectivity.message || debugResults.debugInfo.checks.apiConnectivity.error}
                          </div>
                        </div>
                        {getStatusIcon(debugResults.debugInfo.checks.apiConnectivity.success)}
                      </div>
                    </div>
                  )}

                  {debugResults.debugInfo?.checks?.sslConfiguration && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">SSL/HTTPS Configuration</div>
                          <div className="text-sm text-muted-foreground">
                            {debugResults.debugInfo.checks.sslConfiguration.canConnectToTwitter 
                              ? 'Can connect to Twitter API' 
                              : debugResults.debugInfo.checks.sslConfiguration.error}
                          </div>
                        </div>
                        {getStatusIcon(debugResults.debugInfo.checks.sslConfiguration.canConnectToTwitter)}
                      </div>
                    </div>
                  )}

                  {debugResults.debugInfo?.checks?.callbackUrl && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Callback URL Configuration</div>
                          <div className="text-sm text-muted-foreground">
                            {debugResults.debugInfo.checks.callbackUrl.expected}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            HTTPS: {debugResults.debugInfo.checks.callbackUrl.isHttps ? '✅' : '❌'} | 
                            Production: {debugResults.debugInfo.checks.callbackUrl.isProduction ? '✅' : '❌'}
                          </div>
                        </div>
                        {getStatusIcon(debugResults.debugInfo.checks.callbackUrl.isHttps)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Connectivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debugResults.debugInfo?.checks?.database && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Supabase Connection</div>
                          <div className="text-sm text-muted-foreground">
                            User authenticated: {debugResults.debugInfo.checks.database.hasUser ? 'Yes' : 'No'}
                          </div>
                        </div>
                        {getStatusIcon(debugResults.debugInfo.checks.database.connected)}
                      </div>
                    </div>
                  )}

                  {debugResults.debugInfo?.checks?.socialAccountsTable && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Social Accounts Table</div>
                          <div className="text-sm text-muted-foreground">
                            {debugResults.debugInfo.checks.socialAccountsTable.accessible 
                              ? `${debugResults.debugInfo.checks.socialAccountsTable.accountCount} accounts found`
                              : debugResults.debugInfo.checks.socialAccountsTable.error}
                          </div>
                        </div>
                        {getStatusIcon(debugResults.debugInfo.checks.socialAccountsTable.accessible)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Fixes</CardTitle>
                <CardDescription>
                  Step-by-step solutions for identified issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugResults.debugInfo?.recommendations?.length > 0 ? (
                  <div className="space-y-4">
                    {debugResults.debugInfo.recommendations.map((rec: string, index: number) => (
                      <Alert key={index}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">Fix #{index + 1}</div>
                          <div className="text-sm mt-1">{rec}</div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      No Issues Found
                    </h3>
                    <p className="text-green-700">
                      Your Twitter integration appears to be configured correctly.
                    </p>
                  </div>
                )}

                {/* Production-Specific Checklist */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-4">Production Deployment Checklist</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Environment variables set in production</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Callback URL updated in Twitter Developer Console</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>HTTPS enabled for production domain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Server can make outbound HTTPS requests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Twitter app permissions set to "Read and Write"</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Twitter Developer Console
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://developer.twitter.com/en/docs/authentication/oauth-1-0a" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                OAuth 1.0a Documentation
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/test-twitter" target="_blank">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter Integration Test
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/social-accounts">
                <Settings className="w-4 h-4 mr-2" />
                Social Accounts
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}