'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { useMemo } from 'react'

interface AnalyticsChartProps {
  analytics: any[]
  timeRange: string
}

export function AnalyticsChart({ analytics, timeRange }: AnalyticsChartProps) {
  const chartData = useMemo(() => {
    // Generate last 30 days of data
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i))
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        likes: 0,
        comments: 0,
        shares: 0,
        impressions: 0,
        engagement: 0
      }
    })

    // Aggregate analytics data by day
    analytics.forEach(item => {
      const itemDate = startOfDay(new Date(item.recorded_at))
      const dayIndex = days.findIndex(day => 
        day.fullDate.getTime() === itemDate.getTime()
      )
      
      if (dayIndex !== -1) {
        const metricName = item.metric_name as keyof typeof days[number];
        if (
          metricName === "likes" ||
          metricName === "comments" ||
          metricName === "shares" ||
          metricName === "impressions"
        ) {
          days[dayIndex][metricName] += item.metric_value;
        }
      }
    })

    // Calculate engagement for each day
    days.forEach(day => {
      day.engagement = day.likes + day.comments + day.shares
    })

    return days
  }, [analytics])

  const totalMetrics = useMemo(() => {
    return chartData.reduce((acc, day) => ({
      likes: acc.likes + day.likes,
      comments: acc.comments + day.comments,
      shares: acc.shares + day.shares,
      impressions: acc.impressions + day.impressions,
      engagement: acc.engagement + day.engagement
    }), { likes: 0, comments: 0, shares: 0, impressions: 0, engagement: 0 })
  }, [chartData])

  const engagementRate = totalMetrics.impressions > 0 
    ? ((totalMetrics.engagement / totalMetrics.impressions) * 100).toFixed(2)
    : '0.00'

  const previousPeriodEngagement = chartData.slice(0, 15).reduce((sum, day) => sum + day.engagement, 0)
  const currentPeriodEngagement = chartData.slice(15).reduce((sum, day) => sum + day.engagement, 0)
  const growthRate = previousPeriodEngagement > 0 
    ? (((currentPeriodEngagement - previousPeriodEngagement) / previousPeriodEngagement) * 100).toFixed(1)
    : '0.0'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Overview
            </CardTitle>
            <CardDescription>
              Performance metrics for the last 30 days
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              30 days
            </Badge>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalMetrics.engagement.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Total Engagement</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {totalMetrics.impressions.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Impressions</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {engagementRate}%
            </div>
            <div className="text-sm text-purple-600">Engagement Rate</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-orange-600">
                {Math.abs(parseFloat(growthRate))}%
              </span>
              {parseFloat(growthRate) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-sm text-orange-600">Growth Rate</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#engagementGradient)"
                name="Engagement"
              />
              <Area
                type="monotone"
                dataKey="impressions"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#impressionsGradient)"
                name="Impressions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Impressions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}