'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Zap, Plus, Settings, Trash2, Clock, Target, MessageSquare, Heart, Hash, Users, Play, Pause, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger_type: string
  trigger_conditions: any
  actions: any[]
  is_active: boolean
  schedule_expression?: string
  execution_count: number
  success_count: number
  last_executed_at?: string
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<AutomationRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadAutomations()
  }, [])

  const loadAutomations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mock data for now since automation functionality isn't fully implemented
      const mockAutomations: AutomationRule[] = [
        {
          id: '1',
          name: 'Daily Motivation Posts',
          description: 'Generate and post motivational content every morning',
          trigger_type: 'schedule',
          trigger_conditions: { time: '09:00', timezone: 'UTC' },
          actions: [{ type: 'generate_post', platform: 'instagram' }],
          is_active: true,
          schedule_expression: '0 9 * * *',
          execution_count: 45,
          success_count: 43,
          last_executed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Engagement Booster',
          description: 'Auto-like posts from industry influencers',
          trigger_type: 'hashtag_trending',
          trigger_conditions: { hashtags: ['#marketing', '#business'] },
          actions: [{ type: 'like', limit: 10 }],
          is_active: true,
          execution_count: 120,
          success_count: 115,
          last_executed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          name: 'Comment Responder',
          description: 'Automatically thank users for comments',
          trigger_type: 'auto_response',
          trigger_conditions: { event: 'new_comment' },
          actions: [{ type: 'comment', template: 'Thanks for engaging! 🙏' }],
          is_active: false,
          execution_count: 78,
          success_count: 76,
          last_executed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      setAutomations(mockAutomations)
    } catch (error) {
      console.error('Error loading automations:', error)
      toast.error('Failed to load automations')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      setAutomations(prev => 
        prev.map(automation => 
          automation.id === automationId 
            ? { ...automation, is_active: isActive }
            : automation
        )
      )
      
      toast.success(`Automation ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling automation:', error)
      toast.error('Failed to update automation')
    }
  }

  const deleteAutomation = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return

    try {
      setAutomations(prev => prev.filter(automation => automation.id !== automationId))
      toast.success('Automation deleted successfully')
    } catch (error) {
      console.error('Error deleting automation:', error)
      toast.error('Failed to delete automation')
    }
  }

  const createAutomation = async () => {
    setIsCreating(true)
    try {
      // This would integrate with your automation creation flow
      toast.success('Automation creation flow would open here')
    } catch (error) {
      toast.error('Failed to create automation')
    } finally {
      setIsCreating(false)
    }
  }

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'schedule': return Clock
      case 'engagement_threshold': return Target
      case 'hashtag_trending': return Hash
      case 'auto_response': return MessageSquare
      case 'content_performance': return Heart
      default: return Zap
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getSuccessRate = (automation: AutomationRule) => {
    if (automation.execution_count === 0) return 0
    return Math.round((automation.success_count / automation.execution_count) * 100)
  }

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading automations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8" />
            Automation Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Set up automated workflows to save time and improve engagement
          </p>
        </div>
        <Button onClick={createAutomation} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{automations.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{automations.filter(a => a.is_active).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">
                  {automations.reduce((sum, a) => sum + a.execution_count, 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {automations.length > 0 
                    ? Math.round(
                        automations.reduce((sum, a) => sum + getSuccessRate(a), 0) / automations.length
                      )
                    : 0
                  }%
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      {automations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No automations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first automation to start saving time and improving engagement
            </p>
            <Button onClick={createAutomation} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Automation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => {
            const TriggerIcon = getTriggerIcon(automation.trigger_type)
            const successRate = getSuccessRate(automation)
            
            return (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <TriggerIcon className="w-6 h-6 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {automation.name}
                          </h3>
                          <p className="text-sm text-gray-600">{automation.description}</p>
                        </div>
                        <Badge className={getStatusColor(automation.is_active)}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Trigger:</span>
                          <div className="text-gray-600 capitalize">
                            {automation.trigger_type.replace('_', ' ')}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Executions:</span>
                          <div className="text-gray-600">{automation.execution_count}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Success Rate:</span>
                          <div className="text-gray-600">{successRate}%</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Last Run:</span>
                          <div className="text-gray-600">
                            {automation.last_executed_at 
                              ? formatDistanceToNow(new Date(automation.last_executed_at), { addSuffix: true })
                              : 'Never'
                            }
                          </div>
                        </div>
                      </div>

                      {automation.schedule_expression && (
                        <div className="mt-3 text-sm text-gray-500">
                          Schedule: {automation.schedule_expression}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                      />
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAutomation(automation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Automation Templates */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Automation Templates</CardTitle>
          <CardDescription>
            Quick start templates for common automation workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Daily Content Generator',
                description: 'Generate and post AI content daily at optimal times',
                trigger: 'schedule',
                icon: MessageSquare,
                color: 'text-blue-600'
              },
              {
                name: 'Engagement Booster',
                description: 'Auto-like posts from your industry influencers',
                trigger: 'hashtag_trending',
                icon: Heart,
                color: 'text-red-600'
              },
              {
                name: 'Comment Responder',
                description: 'Automatically respond to comments with thank you messages',
                trigger: 'auto_response',
                icon: MessageSquare,
                color: 'text-green-600'
              },
              {
                name: 'Trending Hashtag Poster',
                description: 'Create posts when hashtags in your niche start trending',
                trigger: 'hashtag_trending',
                icon: Hash,
                color: 'text-purple-600'
              },
              {
                name: 'High Performance Amplifier',
                description: 'Boost posts that are performing well with additional promotion',
                trigger: 'content_performance',
                icon: Target,
                color: 'text-orange-600'
              },
              {
                name: 'Community Builder',
                description: 'Follow back users who engage with your content',
                trigger: 'engagement_threshold',
                icon: Users,
                color: 'text-teal-600'
              }
            ].map((template, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <template.icon className={`w-5 h-5 ${template.color}`} />
                  </div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={createAutomation}
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      {automations.length === 0 && (
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Getting Started:</strong> Automations help you save time by handling repetitive tasks. 
            Start with a simple template like "Daily Content Generator\" to see how it works.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}