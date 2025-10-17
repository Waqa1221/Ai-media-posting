"use client";

import {
  useState,
  useMemo,
  Suspense,
  memo,
  useCallback,
  useEffect,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { UsageMetrics } from "@/components/dashboard/usage-metrics";
import { PerformanceInsights } from "@/components/dashboard/performance-insights";
import { ContentCalendar } from "@/components/dashboard/content-calendar";
import { TrendingTopics } from "@/components/dashboard/trending-topics";
import { AutomationStatus } from "@/components/dashboard/automation-status";
import { TeamActivity } from "@/components/dashboard/team-activity";
import { AgencyStatusWidget } from "@/components/dashboard/agency-status-widget";
import { InstagramAnalyticsWidget } from "@/components/dashboard/instagram-analytics-widget";
import { SchedulingQueueStatus } from "@/components/dashboard/scheduling-queue-status";
import { AIInsightsWidget } from "@/components/dashboard/ai-insights-widget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardErrorBoundary } from "@/components/dashboard/error-boundary";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  BarChart3,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Loading component for better UX
const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Upcoming Posts Placeholder Component
const UpcomingPostsPlaceholder = memo(function UpcomingPostsPlaceholder({
  posts,
}: {
  posts: any[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Posts
        </CardTitle>
        <CardDescription>Your scheduled content</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming posts</p>
            <Button size="sm" className="mt-2" asChild>
              <Link href="/dashboard/scheduler">Schedule a Post</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 5).map((post: any) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {post.title || "Untitled Post"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for{" "}
                    {new Date(post.scheduled_for).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Memoized components for better performance
const MemoizedStatsCards = memo(StatsCards);
const MemoizedQuickActions = memo(QuickActions);
const MemoizedAnalyticsChart = memo(AnalyticsChart);
const MemoizedUsageMetrics = memo(UsageMetrics);
const MemoizedUpcomingPosts = memo(UpcomingPostsPlaceholder);
const MemoizedRecentActivity = memo(RecentActivity);

interface DashboardData {
  user: any;
  profile?: any;
  stats?: any;
  analytics?: any[];
  recentPosts?: any[];
  upcomingPosts?: any[];
  usageData?: any;
  notifications?: any[];
  automations?: any[];
  teamMembers?: any[];
  trendingTopics?: any[];
  contentCalendar?: any[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data, isLoading, error, lastRefresh, retryCount, refreshData } =
    useDashboardData();

  // Check for onboarding completion
  useEffect(() => {
    if (searchParams.get("onboarding") === "complete") {
      toast.success("Welcome to SocialAI! Your account is now set up.");
    }
  }, [searchParams]);

  // Force refresh with key update
  const handleForceRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    refreshData();
  }, [refreshData]);

  const memoizedStats = useMemo(() => {
    return (
      data?.stats || {
        totalPosts: 0,
        scheduledPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalEngagement: 0,
        engagementRate: 0,
        aiGenerations: 0,
        connectedAccounts: 0,
        weeklyGrowth: 0,
        monthlyReach: 0,
        avgEngagementRate: 0,
        topPerformingPlatform: "instagram",
        contentScore: 0,
        automationSavings: 0,
      }
    );
  }, [data?.stats]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {error?.toString() || "Failed to load dashboard data"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Ensure we have valid data structure
  const safeData: DashboardData = {
    user: data.user || {},
    profile: data.profile || {},
    stats: data.stats || memoizedStats,
    analytics: data.analytics || [],
    recentPosts: data.recentPosts || [],
    upcomingPosts: data.upcomingPosts || [],
    usageData: data.usageData || {},
    notifications: data.notifications || [],
    automations: data.automations || [],
    teamMembers: data.teamMembers || [],
    trendingTopics: data.trendingTopics || [],
    contentCalendar: data.contentCalendar || [],
  };

  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
          {/* Enhanced Header with Real-time Updates */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <DashboardHeader
              user={safeData.user}
              profile={safeData.profile}
              onRefresh={handleForceRefresh}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  Live data • Updated {lastRefresh.toLocaleTimeString()}
                </span>
                {retryCount > 0 && (
                  <span className="text-orange-500">(retry {retryCount})</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleForceRefresh}>
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards with Trends */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <MemoizedStatsCards stats={safeData.stats} />
          </Suspense>

          {/* Enhanced Dashboard Tabs with Better Organization */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="automation"
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Quick Actions with Enhanced Design */}
                  <MemoizedQuickActions />

                  {/* Analytics Chart with Better Visualization */}
                  {safeData.analytics && safeData.analytics.length > 0 && (
                    <MemoizedAnalyticsChart
                      analytics={safeData.analytics}
                      timeRange="30d"
                    />
                  )}

                  {/* Performance Insights with AI Recommendations */}
                  {safeData.recentPosts && safeData.recentPosts.length > 0 && (
                    <PerformanceInsights
                      posts={safeData.recentPosts}
                      analytics={safeData.analytics || []}
                    />
                  )}

                  {/* Trending Topics with Action Items */}
                  <TrendingTopics topics={safeData.trendingTopics || []} />
                </div>

                {/* Right Column - Enhanced Sidebar */}
                <div className="space-y-6">
                  {/* AI Marketing Agency Status */}
                  <AgencyStatusWidget />

                  {/* Instagram Analytics */}
                  <InstagramAnalyticsWidget />

                  {/* Usage Metrics with Better Visualization */}
                  <MemoizedUsageMetrics
                    usageData={safeData.usageData || {}}
                    subscriptionTier={
                      safeData.profile?.subscription_tier || "premium"
                    }
                  />

                  {/* Upcoming Posts with Enhanced Preview */}
                  <MemoizedUpcomingPosts posts={safeData.upcomingPosts || []} />

                  {/* Recent Activity with Better Categorization */}
                  <MemoizedRecentActivity
                    posts={(safeData.recentPosts || []).slice(0, 5)}
                    aiGenerations={[]}
                    notifications={safeData.notifications || []}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enhanced Content Calendar */}
                <ContentCalendar posts={safeData.contentCalendar || []} />

                {/* Content Performance Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Content Performance
                    </CardTitle>
                    <CardDescription>
                      How your content is performing across platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Content Score */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {safeData.stats.contentScore}/100
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Content Quality Score
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${safeData.stats.contentScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Platform Breakdown */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Platform Performance</h4>
                        <div className="space-y-3">
                          {["instagram", "linkedin", "twitter", "facebook"].map(
                            (platform) => (
                              <div
                                key={platform}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {platform === "instagram" && "📸"}
                                    {platform === "linkedin" && "💼"}
                                    {platform === "twitter" && "🐦"}
                                    {platform === "facebook" && "📘"}
                                  </span>
                                  <span className="capitalize">{platform}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        platform ===
                                        safeData.stats.topPerformingPlatform
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                      }`}
                                      style={{
                                        width: `${Math.random() * 80 + 20}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-8">
                                    {Math.round(Math.random() * 40 + 60)}%
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/ai-generator">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Content
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/analytics">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Enhanced Analytics Chart */}
                  {safeData.analytics && safeData.analytics.length > 0 && (
                    <MemoizedAnalyticsChart
                      analytics={safeData.analytics}
                      timeRange="30d"
                    />
                  )}
                </div>
                <div className="space-y-6">
                  {/* Key Metrics Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Engagement Rate</span>
                          <span className="font-semibold text-green-600">
                            {safeData.stats.avgEngagementRate.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Monthly Reach</span>
                          <span className="font-semibold">
                            {safeData.stats.monthlyReach.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Growth Rate</span>
                          <span
                            className={`font-semibold ${
                              safeData.stats.weeklyGrowth >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {safeData.stats.weeklyGrowth >= 0 ? "+" : ""}
                            {safeData.stats.weeklyGrowth}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Platform */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl mb-2">
                          {safeData.stats.topPerformingPlatform ===
                            "instagram" && "📸"}
                          {safeData.stats.topPerformingPlatform ===
                            "linkedin" && "💼"}
                          {safeData.stats.topPerformingPlatform === "twitter" &&
                            "🐦"}
                          {safeData.stats.topPerformingPlatform ===
                            "facebook" && "📘"}
                        </div>
                        <div className="font-semibold capitalize">
                          {safeData.stats.topPerformingPlatform}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Best performing platform
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enhanced Automation Status */}
                <AutomationStatus automations={safeData.automations || []} />

                {/* Scheduling Queue Status */}
                <SchedulingQueueStatus />

                {/* Automation Savings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Automation Impact
                    </CardTitle>
                    <CardDescription>
                      How automation is helping your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {safeData.stats.automationSavings}h
                        </div>
                        <div className="text-muted-foreground mb-2">
                          Time saved this month
                        </div>
                        <div className="text-sm text-green-600">
                          Worth $
                          {Math.round(safeData.stats.automationSavings * 25)} in
                          productivity
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {
                              (safeData.automations || []).filter(
                                (a: any) => a.status === "active"
                              ).length
                            }
                          </div>
                          <div className="text-sm text-blue-600">
                            Active Rules
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {safeData.stats.aiGenerations}
                          </div>
                          <div className="text-sm text-purple-600">
                            AI Generations
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Automation Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Automation Opportunities</CardTitle>
                    <CardDescription>
                      Suggested automations to save more time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          title: "Daily Content Generation",
                          description: "Auto-generate posts every morning",
                          potential: "2h/day",
                          difficulty: "Easy",
                        },
                        {
                          title: "Engagement Automation",
                          description: "Auto-respond to comments",
                          potential: "1h/day",
                          difficulty: "Medium",
                        },
                        {
                          title: "Analytics Reporting",
                          description: "Weekly performance reports",
                          potential: "30min/week",
                          difficulty: "Easy",
                        },
                      ].map((opportunity, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {opportunity.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {opportunity.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">
                                {opportunity.potential}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {opportunity.difficulty}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Insights Widget */}
                <AIInsightsWidget
                  posts={safeData.recentPosts || []}
                  analytics={safeData.analytics || []}
                />

                {/* Content Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription>
                      Personalized suggestions to improve your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          type: "content",
                          title: "Optimize Posting Times",
                          description:
                            "Your audience is most active at 2 PM on weekdays",
                          action: "Schedule more posts at 2 PM",
                          impact: "High",
                          color: "text-green-600",
                        },
                        {
                          type: "engagement",
                          title: "Add More Questions",
                          description:
                            "Posts with questions get 40% more engagement",
                          action: "Include questions in your next 3 posts",
                          impact: "Medium",
                          color: "text-blue-600",
                        },
                        {
                          type: "hashtags",
                          title: "Trending Hashtags",
                          description:
                            "#AIMarketing is trending in your industry",
                          action: "Create content around this hashtag",
                          impact: "Medium",
                          color: "text-purple-600",
                        },
                      ].map((rec, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{rec.title}</h4>
                            <span
                              className={`text-xs font-medium ${rec.color}`}
                            >
                              {rec.impact} Impact
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {rec.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              💡 {rec.action}
                            </span>
                            <Button size="sm" variant="outline">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </DashboardErrorBoundary>
  );
}
