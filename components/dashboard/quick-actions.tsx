'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Plus,
  Image,
  Hash,
  Users,
  ExternalLink,
  Settings,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const primaryActions = [
    {
      id: 'ai-generator',
      title: 'Generate AI Content',
      description: 'Create engaging posts with AI',
      icon: Sparkles,
      href: '/dashboard/ai-generator',
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      textColor: 'text-white',
      badge: 'Popular'
    },
    {
      id: 'scheduler',
      title: 'Schedule Post',
      description: 'Plan your content calendar',
      icon: Calendar,
      href: '/dashboard/scheduler',
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      textColor: 'text-white',
      badge: 'Enhanced'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Track your performance',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-gradient-to-r from-green-500 to-teal-600',
      textColor: 'text-white',
      badge: null
    }
  ]

  const secondaryActions = [
    {
      id: 'create-post',
      title: 'Create Post',
      description: 'Write a new post',
      icon: Plus,
      href: '/dashboard/scheduler',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-900',
      external: false
    },
    {
      id: 'generate-images',
      title: 'Generate Images',
      description: 'AI-powered visuals',
      icon: Image,
      href: '/dashboard/ai-generator',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-900',
      external: false
    },
    {
      id: 'hashtag-research',
      title: 'Hashtag Research',
      description: 'Find trending tags',
      icon: Hash,
      href: '/dashboard/ai-generator',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-900',
      external: false
    },
    {
      id: 'connect-accounts',
      title: 'Connect Accounts',
      description: 'Link social platforms',
      icon: Users,
      href: '/dashboard/social-accounts',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-900',
      external: false
    },
    {
      id: 'automation',
      title: 'Automation',
      description: 'Set up workflows',
      icon: Zap,
      href: '/dashboard/automations',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-900',
      external: false
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure preferences',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-900',
      external: false
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Get started with these common tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div 
                className={`relative p-6 rounded-lg ${action.color} cursor-pointer group transition-all hover:scale-105 hover:shadow-lg overflow-hidden`}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                {action.badge && (
                  <Badge className="absolute top-2 right-2 bg-white/20 text-white border-white/30">
                    {action.badge}
                  </Badge>
                )}
                <div className="flex items-center justify-between mb-3">
                  <action.icon className={`w-6 h-6 ${action.textColor}`} />
                  <div className={`w-2 h-2 rounded-full ${action.textColor} opacity-60 ${hoveredAction === action.id ? 'animate-pulse' : ''}`}></div>
                </div>
                <h3 className={`font-semibold ${action.textColor} mb-1`}>
                  {action.title}
                </h3>
                <p className={`text-sm ${action.textColor} opacity-90`}>
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">More Actions</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {secondaryActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div 
                  className={`p-4 border rounded-lg ${action.color} cursor-pointer group transition-all hover:shadow-md relative`}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  {action.external && <ExternalLink className="absolute top-2 right-2 w-3 h-3 text-gray-400" />}
                  <action.icon className={`w-5 h-5 ${action.textColor} mb-2 group-hover:scale-110 transition-transform`} />
                  <h4 className={`font-medium ${action.textColor} text-sm mb-1`}>
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}