'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Plus, UserPlus, Crown, Edit, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface TeamActivityProps {
  members: Array<{
    id: string
    name: string
    email: string
    role: string
    avatar_url?: string
    last_active: Date
    posts_created: number
    status: 'active' | 'invited' | 'inactive'
  }>
}

export function TeamActivity({ members }: TeamActivityProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-500" />
      case 'editor':
        return <Edit className="w-3 h-3 text-blue-500" />
      case 'contributor':
        return <MessageSquare className="w-3 h-3 text-green-500" />
      default:
        return <Users className="w-3 h-3 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'contributor': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'invited': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Activity
            </CardTitle>
            <CardDescription>
              Collaborate with your team members
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/team">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No team members yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Invite team members to collaborate on content
            </p>
            <Button asChild>
              <Link href="/dashboard/team">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Team Member
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      <Badge className={getRoleColor(member.role)}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1 capitalize">{member.role}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.email} • {member.posts_created} posts
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(member.last_active, { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Team Stats */}
        {members.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {members.filter(m => m.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {members.reduce((sum, m) => sum + m.posts_created, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {members.filter(m => m.role === 'admin').length}
                </div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}