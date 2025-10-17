'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Twitter, Zap, Clock, Hash, Heart, MessageSquare, Settings, Play, Pause, Plus, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TwitterAccount {
  id: string
  username: string
  display_name: string
  is_active: boolean
}

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger_type: string
  is_active: boolean
  execution_count: number
  success_count: number
  last_executed_at: string | null
}

export default function TwitterAutomationPage() {
  const [twitterAccount, setTwitterAccount] = useState<TwitterAccount | null>(null)
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isCreatingRule, setIsCreatingRule] = useState(false)
  const [testContent, setTestContent] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadTwitterData()
  }, [])

  const loadTwitterData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load Twitter account
      const { data: account, error: accountError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'twitter')
        .eq('is_active', true)
        .single()

      if (!accountError && account) {
        setTwitterAccount(account)
      }

      // Load automation rules
      const { data: rules, error: rulesError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!rulesError && rules) {
        setAutomationRules(rules)
      }

    } catch (error) {
      console.error('Error loading Twitter data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testTwitterConnection = async () => {
    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/automation/twitter/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: testContent })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Twitter connection test successful!')
      } else {
        toast.error(result.error || 'Twitter connection test failed')
      }
    } catch (error) {
      toast.error('Failed to test Twitter connection')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const createAutomationRule = async (ruleType: string, settings: any = {}) => {
    setIsCreatingRule(true)
    try {
      const response = await fetch('/api/automation/twitter/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleType, settings })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Automation rule created successfully!')
        loadTwitterData()
      } else {
        toast.error(result.error || 'Failed to create automation rule')
      }
    } catch (error) {
      toast.error('Failed to create automation rule')
    } finally {
      setIsCreatingRule(false)
    }
  }

  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId)

      if (error) throw error

      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: isActive } : rule
        )
      )

      toast.success(`Automation rule ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update automation rule')
    }
  }

  const getSuccessRate = (rule: AutomationRule) => {
    if (rule.execution_count === 0) return 0
    return Math.round((rule.success_count / rule.execution_count) * 100)
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Twitter automation...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Twitter className="w-8 h-8" />
          Twitter Automation
        </h1>
        <p className="text-muted-foreground mt-2">
          Automate your Twitter presence with AI-powered content and engagement
        </p>
      </div>

      {/* Twitter Account Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="w-5 h-5" />
            Twitter Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!twitterAccount ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No Twitter account connected. Please connect your Twitter account first to enable automation.
                <Button variant="link" className="p-0 h-auto ml-2" asChild>
                  <a href="/dashboard/social-accounts">Connect Twitter Account</a>
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">@{twitterAccount.username}</div>
                    <div className="text-sm text-muted-foreground">{twitterAccount.display_name}</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>

              {/* Connection Test */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Test Connection</h4>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter test tweet content (optional)"
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    maxLength={280}
                    className="flex-1"
                  />
                  <Button 
                    onClick={testTwitterConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {testContent.length}/280 characters
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Rules */}
      {twitterAccount && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automation Rules</CardTitle>
                  <CardDescription>
                    Manage your Twitter automation workflows
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => createAutomationRule('daily_motivation')}
                  disabled={isCreatingRule}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {automationRules.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No automation rules yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first automation rule to start saving time
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => createAutomationRule('daily_motivation')}
                      disabled={isCreatingRule}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Daily Posts
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => createAutomationRule('engagement_booster', { 
                        hashtags: ['#marketing', '#business'] 
                      })}
                      disabled={isCreatingRule}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Auto Engage
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {rule.trigger_type === 'schedule' && <Clock className="w-5 h-5 text-blue-500" />}
                            {rule.trigger_type === 'hashtag_trending' && <Hash className="w-5 h-5 text-green-500" />}
                            {rule.trigger_type === 'auto_response' && <MessageSquare className="w-5 h-5 text-purple-500" />}
                            
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{rule.description}</p>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Executions:</span>
                              <div className="text-gray-600">{rule.execution_count}</div>
                            </div>
                            <div>
                              <span className="font-medium">Success Rate:</span>
                              <div className="text-gray-600">{getSuccessRate(rule)}%</div>
                            </div>
                            <div>
                              <span className="font-medium">Last Run:</span>
                              <div className="text-gray-600">
                                {rule.last_executed_at 
                                  ? new Date(rule.last_executed_at).toLocaleDateString()
                                  : 'Never'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => toggleAutomationRule(rule.id, checked)}
                          />
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Setup Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Setup Templates</CardTitle>
              <CardDescription>
                Pre-configured automation templates for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <h4 className="font-medium">Daily Motivation</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Post motivational content every morning at 9 AM
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => createAutomationRule('daily_motivation')}
                    disabled={isCreatingRule}
                  >
                    Setup Rule
                  </Button>
                </div>

                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-6 h-6 text-red-500" />
                    <h4 className="font-medium">Engagement Booster</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Auto-like and retweet posts with your industry hashtags
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => createAutomationRule('engagement_booster', { 
                      hashtags: ['#marketing', '#business', '#entrepreneur'] 
                    })}
                    disabled={isCreatingRule}
                  >
                    Setup Rule
                  </Button>
                </div>

                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow opacity-60">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-6 h-6 text-green-500" />
                    <h4 className="font-medium">Auto Responder</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatically respond to mentions and replies
                  </p>
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}