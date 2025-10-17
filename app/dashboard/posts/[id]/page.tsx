"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  CreditCard as Edit,
  Share,
  Calendar,
  ChartBar as BarChart3,
  Clock,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      loadPost();
      loadAnalytics();
    }
  }, [params.id]);

  const loadPost = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("Failed to load post");
      router.push("/dashboard/posts");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .eq("post_id", params.id)
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4" />;
      case "scheduled":
        return <Clock className="w-4 h-4" />;
      case "draft":
        return <Edit className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Edit className="w-4 h-4" />;
    }
  };

  const getPlatformEmojis = (platforms: string[]) => {
    const platformEmojis: Record<string, string> = {
      instagram: "📸",
      linkedin: "💼",
      twitter: "🐦",
      facebook: "📘",
      tiktok: "🎵",
    };
    return (
      platforms
        ?.map((platform) => platformEmojis[platform] || "📱")
        .join(" ") || ""
    );
  };

  const getTotalEngagement = () => {
    if (!post?.engagement_data) return 0;
    const data = post.engagement_data;
    return (data.likes || 0) + (data.comments || 0) + (data.shares || 0);
  };

  const getEngagementRate = () => {
    if (!post?.engagement_data) return 0;
    const impressions = post.engagement_data.impressions || 0;
    const engagement = getTotalEngagement();
    return impressions > 0 ? ((engagement / impressions) * 100).toFixed(2) : 0;
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Post not found</h3>
            <p className="text-gray-600 mb-4">
              The post you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button asChild>
              <Link href="/dashboard/posts">Back to Posts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/posts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {post.title || "Untitled Post"}
            </h1>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(post.status)}>
                {getStatusIcon(post.status)}
                <span className="ml-1 capitalize">{post.status}</span>
              </Badge>
              {post.platforms && (
                <span className="text-lg">
                  {getPlatformEmojis(post.platforms)}
                </span>
              )}
              {post.ai_generated && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  AI Generated
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/posts/${post.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {post.hashtags && post.hashtags.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-blue-600 bg-blue-50"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="reach">Reach</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {post.engagement_data?.impressions?.toLocaleString() ||
                        "0"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Impressions
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {getTotalEngagement().toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Engagement
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {getEngagementRate()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Engagement Rate
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {post.engagement_data?.reach?.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-muted-foreground">Reach</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-8 h-8 text-red-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          {post.engagement_data?.likes?.toLocaleString() || "0"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Likes
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          {post.engagement_data?.comments?.toLocaleString() ||
                            "0"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Comments
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Repeat2 className="w-8 h-8 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          {post.engagement_data?.shares?.toLocaleString() ||
                            "0"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Shares
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reach" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reach Metrics</CardTitle>
                  <CardDescription>
                    How many people saw your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Reach</span>
                      <span className="font-semibold">
                        {post.engagement_data?.reach?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Impressions</span>
                      <span className="font-semibold">
                        {post.engagement_data?.impressions?.toLocaleString() ||
                          "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Frequency</span>
                      <span className="font-semibold">
                        {post.engagement_data?.impressions &&
                        post.engagement_data?.reach
                          ? (
                              post.engagement_data.impressions /
                              post.engagement_data.reach
                            ).toFixed(2)
                          : "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Details */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Status
                </div>
                <Badge className={getStatusColor(post.status)}>
                  {getStatusIcon(post.status)}
                  <span className="ml-1 capitalize">{post.status}</span>
                </Badge>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Platforms
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {post.platforms?.map((platform: string) => (
                    <Badge
                      key={platform}
                      variant="outline"
                      className="capitalize"
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Created
                </div>
                <div className="text-sm">
                  {format(new Date(post.created_at), "PPP p")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {post.scheduled_for && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Scheduled For
                  </div>
                  <div className="text-sm">
                    {format(new Date(post.scheduled_for), "PPP p")}
                  </div>
                </div>
              )}

              {post.published_at && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Published
                  </div>
                  <div className="text-sm">
                    {format(new Date(post.published_at), "PPP p")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.published_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/posts/${post.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Post
                </Link>
              </Button>

              {post.status === "draft" && (
                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Analytics
              </Button>

              <Button variant="outline" className="w-full">
                <Share className="w-4 h-4 mr-2" />
                Share Post
              </Button>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {post.status === "published" && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Above average engagement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>Good reach performance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Posted at optimal time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
