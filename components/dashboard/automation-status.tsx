'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface AutomationStatusProps {
  automations: Array<{
    id: string
    name: string
    status: 'active' | 'paused' | 'error'
    lastRun: Date
    nextRun: Date | null
  }>
}

export function AutomationStatus({ automations }: AutomationStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleAutomation = (automationId: string, currentStatus: string) => {
    // This would integrate with your automation system
    console.log(`Toggling automation ${automationId} from ${currentStatus}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Automation Status
            </CardTitle>
            <CardDescription>
              Manage your automated workflows
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/automations">
              <Plus className="w-4 h-4 mr-2" />
              New Automation
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {automations.length === 0 ? (
          <div className="text-center py-6">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No automations set up</p>
            <p className="text-sm text-gray-400 mb-4">
              Create automated workflows to save time
            </p>
            <Button asChild>
              <Link href="/dashboard/automations">
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {automations.map((automation) => (
              <div key={automation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(automation.status)}
                      <h4 className="font-medium text-gray-900">
                        {automation.name}
                      </h4>
                      <Badge className={getStatusColor(automation.status)}>
                        {automation.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        Last run: {formatDistanceToNow(automation.lastRun, { addSuffix: true })}
                      </div>
                      {automation.nextRun && (
                        <div>
                          Next run: {format(automation.nextRun, 'MMM dd, h:mm a')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.status === 'active'}
                      onCheckedChange={() => toggleAutomation(automation.id, automation.status)}
                    />
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {automation.status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Automation failed. Check configuration.</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Automation Templates */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Quick Setup Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Daily Content
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Zap className="w-4 h-4 mr-2" />
              Auto Responses
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <CheckCircle className="w-4 h-4 mr-2" />
              Weekly Reports
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Play className="w-4 h-4 mr-2" />
              Engagement Boost
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}