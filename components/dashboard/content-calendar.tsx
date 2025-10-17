'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, CheckCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import Link from 'next/link'

interface ContentCalendarProps {
  posts: any[]
}

interface Post {
  id: string
  scheduled_for?: string
  title?: string
  content: string
  platforms?: string[]
  status?: string
}

interface GroupedPosts {
  [key: string]: Post[]
}

export function ContentCalendar({ posts }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const postsGroupedByDate = useMemo(() => {
    const grouped: GroupedPosts = {}
    posts.forEach((post: Post) => {
      if (post.scheduled_for) {
        const dateKey = format(new Date(post.scheduled_for), 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(post)
      }
    })
    return grouped
  }, [posts])

  const getPostsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return postsGroupedByDate[dateKey] || []
  }

  const getPlatformEmoji = (platform: string) => {
    const emojis: { [key: string]: string } = {
      instagram: '📸',
      linkedin: '💼',
      twitter: '🐦',
      facebook: '📘',
      tiktok: '🎵'
    }
    return emojis[platform] || '📱'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Content Calendar
            </CardTitle>
            <CardDescription>
              View and manage your scheduled content
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/scheduler">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Post
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map(date => {
            const dayPosts = getPostsForDate(date)
            const isCurrentDay = isToday(date)
            
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[80px] p-2 border rounded-lg ${
                  isCurrentDay ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                } hover:bg-gray-50 transition-colors`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post: Post) => (
                    <div
                      key={post.id}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                      title={post.title || post.content.substring(0, 50)}
                    >
                      <div className="flex items-center gap-1">
                        {post.platforms?.[0] && (
                          <span>{getPlatformEmoji(post.platforms[0])}</span>
                        )}
                        <span className="truncate">
                          {format(new Date(post.scheduled_for!), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {dayPosts.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayPosts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Calendar Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-sm text-muted-foreground">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-sm text-muted-foreground">Published</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span className="text-sm text-muted-foreground">Failed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}