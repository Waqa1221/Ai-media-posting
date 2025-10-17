"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  TrendingUp,
  Calendar,
  ChartBar as BarChart3,
  Settings,
  Play,
  Pause,
  CircleCheck as CheckCircle,
  Clock,
  Target,
  Sparkles,
  Users,
  MessageSquare,
  Image,
  Activity,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";

interface ClientProject {
  id: string;
  business_name: string;
  industry: string;
  posting_frequency: string;
  platforms: string[];
  automation_level: string;
  is_active: boolean;
  created_at: string;
}

interface AgencyActivity {
  id: string;
  activity_type: string;
  details: any;
  created_at: string;
}

interface PerformanceMetrics {
  totalPosts: number;
  totalEngagement: number;
  avgEngagement: number;
  topPerformingPost: any;
}

export default function AgencyDashboardPage() {
  const [project, setProject] = useState<ClientProject | null>(null);
  const [recentActivity, setRecentActivity] = useState<AgencyActivity[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadAgencyDashboard();
  }, []);

  const loadAgencyDashboard = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has an active agency project
      const { data: projectData, error: projectError } = await supabase
        .from("client_projects")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (projectError && projectError.code !== "PGRST116") {
        throw projectError;
      }

      if (!projectData) {
        // No agency setup found, redirect to setup
        window.location.href = "/onboarding/agency-setup";
        return;
      }

      setProject(projectData);

      // Load agency dashboard data
      const response = await fetch(`/api/agency/dashboard/${projectData.id}`);
      const dashboardData = await response.json();

      if (response.ok) {
        setRecentActivity(dashboardData.recentActivity || []);
        setUpcomingPosts(dashboardData.upcomingPosts || []);
        setPerformanceMetrics(dashboardData.performanceMetrics || null);
      }
    } catch (error) {
      console.error("Error loading agency dashboard:", error);
      toast.error("Failed to load agency dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAgencyAutomation = async () => {
    if (!project) return;

    setIsToggling(true);
    try {
      const { error } = await supabase
        .from("client_projects")
        .update({
          is_active: !project.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (error) throw error;

      setProject((prev) =>
        prev ? { ...prev, is_active: !prev.is_active } : null
      );
      toast.success(
        `Agency automation ${!project.is_active ? "activated" : "paused"}`
      );
    } catch (error) {
      console.error("Error toggling automation:", error);
      toast.error("Failed to update automation status");
    } finally {
      setIsToggling(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "content_generation":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "post_scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "post_published":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "performance_optimization":
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: AgencyActivity) => {
    switch (activity.activity_type) {
      case "content_generation":
        return "AI generated new content for your brand";
      case "post_scheduled":
        return `Post scheduled for ${
          activity.details?.platform || "social media"
        }`;
      case "post_published":
        return `Post published to ${
          activity.details?.platform || "social media"
        }`;
      case "performance_optimization":
        return "AI analyzed performance and optimized strategy";
      case "content_generation_failed":
        return "Content generation failed - checking issue";
      default:
        return "Agency activity recorded";
    }
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis = {
      instagram: "📸",
      linkedin: "💼",
      twitter: "🐦",
      facebook: "📘",
      tiktok: "🎵",
    } as const;
    return emojis[platform as keyof typeof emojis] || "📱";
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your AI Marketing Agency...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No AI Marketing Agency Found
            </h3>
            <p className="text-gray-600 mb-6">
              Set up your AI Marketing Agency to start automated content
              creation and publishing
            </p>
            <Button asChild>
              <Link href="/onboarding/agency-setup">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Agency Setup
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8" />
            AI Marketing Agency
          </h1>
          <p className="text-muted-foreground mt-2">
            Your AI-powered marketing agency working 24/7 for{" "}
            {project.business_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            className={
              project.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }
          >
            {project.is_active ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Paused
              </>
            )}
          </Badge>

          <Button
            onClick={toggleAgencyAutomation}
            disabled={isToggling}
            variant={project.is_active ? "outline" : "default"}
          >
            {isToggling ? (
              "Updating..."
            ) : project.is_active ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Agency
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate Agency
              </>
            )}
          </Button>

          <Button variant="outline" asChild>
            <Link href="/dashboard/agency/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {!project.is_active && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <Pause className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your AI Marketing Agency is currently paused. Activate it to resume
            automated content creation and publishing.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Posts
                </p>
                <p className="text-2xl font-bold">
                  {performanceMetrics?.totalPosts || 0}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Engagement
                </p>
                <p className="text-2xl font-bold">
                  {performanceMetrics?.totalEngagement || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Engagement
                </p>
                <p className="text-2xl font-bold">
                  {performanceMetrics?.avgEngagement || 0}
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
                <p className="text-sm font-medium text-muted-foreground">
                  Platforms
                </p>
                <p className="text-2xl font-bold">{project.platforms.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Agency Activity
                </CardTitle>
                <CardDescription>
                  What your AI marketing agency has been doing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {getActivityMessage(activity)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(activity.created_at),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Posts
                </CardTitle>
                <CardDescription>
                  Content scheduled by your AI agency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingPosts.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming posts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 line-clamp-1">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {post.platforms?.map((platform: string) => (
                              <span key={platform} className="text-sm">
                                {getPlatformEmoji(platform)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(
                              new Date(post.scheduled_for),
                              "MMM dd, h:mm a"
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Pipeline</CardTitle>
              <CardDescription>
                Monitor your AI agency's content creation and publishing
                pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Content Pipeline</h3>
                <p className="text-gray-600 mb-6">
                  Detailed content pipeline view coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Track how your AI marketing agency is performing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceMetrics?.topPerformingPost ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceMetrics.totalPosts}
                      </div>
                      <div className="text-sm text-blue-600">Posts Created</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {performanceMetrics.totalEngagement}
                      </div>
                      <div className="text-sm text-green-600">
                        Total Engagement
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {performanceMetrics.avgEngagement}
                      </div>
                      <div className="text-sm text-purple-600">
                        Avg. Engagement
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Top Performing Post</h4>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg p-4">
                      <h5 className="font-medium text-orange-900 mb-2">
                        {performanceMetrics.topPerformingPost.title}
                      </h5>
                      <p className="text-sm text-orange-800 line-clamp-2">
                        {performanceMetrics.topPerformingPost.content}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Performance Data Yet
                  </h3>
                  <p className="text-gray-600">
                    Performance analytics will appear once your AI agency starts
                    publishing content
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agency Configuration</CardTitle>
              <CardDescription>
                Current settings for your AI marketing agency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Business Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business:</span>
                        <span>{project.business_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="capitalize">
                          {project.industry.replace("-", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Frequency:
                        </span>
                        <span className="capitalize">
                          {project.posting_frequency.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Platforms & Automation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Platforms:
                        </span>
                        <div className="flex gap-1">
                          {project.platforms.map((platform) => (
                            <span key={platform}>
                              {getPlatformEmoji(platform)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Automation:
                        </span>
                        <span className="capitalize">
                          {project.automation_level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          className={
                            project.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {project.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/agency/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Modify Agency Settings
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
