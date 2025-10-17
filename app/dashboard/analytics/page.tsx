"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartBar as BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Users,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedPlatform]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), days);

      // Load analytics data
      let analyticsQuery = supabase
        .from("analytics")
        .select("*")
        .eq("user_id", user.id)
        .gte("recorded_at", startDate.toISOString())
        .order("recorded_at", { ascending: true });

      if (selectedPlatform !== "all") {
        analyticsQuery = analyticsQuery.eq("platform", selectedPlatform);
      }

      const { data: analyticsData, error: analyticsError } =
        await analyticsQuery;
      if (analyticsError) throw analyticsError;

      // Load posts data
      let postsQuery = supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "published")
        .gte("published_at", startDate.toISOString())
        .order("published_at", { ascending: false });

      const { data: postsData, error: postsError } = await postsQuery;
      if (postsError) throw postsError;

      setAnalytics(analyticsData || []);
      setPosts(postsData || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = startOfDay(subDays(new Date(), days - 1 - i));
      return {
        date: format(date, "MMM dd"),
        fullDate: date,
        impressions: 0,
        engagement: 0,
        reach: 0,
        clicks: 0,
      };
    });

    analytics.forEach((item) => {
      const itemDate = startOfDay(new Date(item.recorded_at));
      const dayIndex = dateRange.findIndex(
        (day) => day.fullDate.getTime() === itemDate.getTime()
      );

      if (dayIndex !== -1) {
        const metricName = item.metric_name;
        if (
          metricName in dateRange[dayIndex] &&
          typeof dateRange[dayIndex][
            metricName as keyof (typeof dateRange)[number]
          ] === "number"
        ) {
          (dateRange[dayIndex] as any)[metricName] += item.metric_value;
        }
      }
    });

    return dateRange;
  }, [analytics, timeRange]);

  const platformData = useMemo(() => {
    const platforms: any = {};
    posts.forEach((post) => {
      post.platforms?.forEach((platform: string) => {
        if (!platforms[platform]) {
          platforms[platform] = {
            name: platform,
            posts: 0,
            engagement: 0,
            reach: 0,
          };
        }
        platforms[platform].posts += 1;
        const engagement =
          (post.engagement_data?.likes || 0) +
          (post.engagement_data?.comments || 0) +
          (post.engagement_data?.shares || 0);
        platforms[platform].engagement += engagement;
        platforms[platform].reach += post.engagement_data?.reach || 0;
      });
    });

    return Object.values(platforms);
  }, [posts]);

  const totalMetrics = useMemo(() => {
    return chartData.reduce(
      (acc, day) => ({
        impressions: acc.impressions + day.impressions,
        engagement: acc.engagement + day.engagement,
        reach: acc.reach + day.reach,
        clicks: acc.clicks + day.clicks,
      }),
      { impressions: 0, engagement: 0, reach: 0, clicks: 0 }
    );
  }, [chartData]);

  const engagementRate =
    totalMetrics.impressions > 0
      ? ((totalMetrics.engagement / totalMetrics.impressions) * 100).toFixed(2)
      : "0.00";

  const topPerformingPosts = useMemo(() => {
    return posts
      .filter((post) => post.engagement_data)
      .sort((a, b) => {
        const aEngagement =
          (a.engagement_data?.likes || 0) +
          (a.engagement_data?.comments || 0) +
          (a.engagement_data?.shares || 0);
        const bEngagement =
          (b.engagement_data?.likes || 0) +
          (b.engagement_data?.comments || 0) +
          (b.engagement_data?.shares || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 5);
  }, [posts]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your social media performance and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Reach
                </p>
                <p className="text-2xl font-bold">
                  {totalMetrics.reach.toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="text-sm text-muted-foreground ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Engagement
                </p>
                <p className="text-2xl font-bold">
                  {totalMetrics.engagement.toLocaleString()}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8.2%</span>
              <span className="text-sm text-muted-foreground ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Engagement Rate
                </p>
                <p className="text-2xl font-bold">{engagementRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">-2.1%</span>
              <span className="text-sm text-muted-foreground ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Posts
                </p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15.3%</span>
              <span className="text-sm text-muted-foreground ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Track your key metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="reach"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      stroke="#F59E0B"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>
                Your best content from the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingPosts.map((post, index) => {
                  const engagement =
                    (post.engagement_data?.likes || 0) +
                    (post.engagement_data?.comments || 0) +
                    (post.engagement_data?.shares || 0);

                  return (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {post.title || "Untitled Post"}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.engagement_data?.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.engagement_data?.comments || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share className="w-3 h-3" />
                            {post.engagement_data?.shares || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.engagement_data?.impressions?.toLocaleString() ||
                              0}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {engagement.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total Engagement
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          {/* Platform Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>
                  Compare performance across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="engagement" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>
                  Posts distribution by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="posts"
                      >
                        {platformData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Types Performance</CardTitle>
                <CardDescription>
                  Which content types perform best
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>AI Generated</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: "75%" }}
                        />
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Manual Posts</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "60%" }}
                        />
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scheduled Posts</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: "85%" }}
                        />
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
                <CardDescription>
                  Optimal times for maximum engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: "9:00 AM", engagement: 92, day: "Monday" },
                    { time: "12:00 PM", engagement: 88, day: "Wednesday" },
                    { time: "6:00 PM", engagement: 85, day: "Friday" },
                    { time: "3:00 PM", engagement: 78, day: "Tuesday" },
                  ].map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-sm text-gray-600">{slot.day}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {slot.engagement}%
                        </div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          {/* Audience Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
                <CardDescription>
                  Who is engaging with your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">25-34 years</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "45%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">35-44 years</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "30%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">18-24 years</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: "25%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audience Growth</CardTitle>
                <CardDescription>
                  Follower growth across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: "Instagram", followers: 12500, growth: 15.2 },
                    { platform: "LinkedIn", followers: 8300, growth: 22.1 },
                    { platform: "Twitter", followers: 5600, growth: -2.3 },
                    { platform: "Facebook", followers: 3200, growth: 8.7 },
                  ].map((platform, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{platform.platform}</div>
                        <div className="text-sm text-gray-600">
                          {platform.followers.toLocaleString()} followers
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {platform.growth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            platform.growth > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {platform.growth > 0 ? "+" : ""}
                          {platform.growth}%
                        </span>
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
  );
}
