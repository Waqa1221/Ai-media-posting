'use client'

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChartBar as BarChart3,
  CreditCard as Edit,
  Trash2,
  Share,
  Clock,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  Sparkles,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduled_for: string | null;
  published_at: string | null;
  ai_generated: boolean;
  hashtags: string[];
  engagement_data: any;
  created_at: string;
  updated_at: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();
  const supabase = createClient();

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .limit(50)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Memoize filtered posts for better performance
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    return filtered;
  }, [posts, searchQuery, statusFilter]);

  // Memoize status counts
  const statusCounts = useMemo(
    () => ({
      all: posts.length,
      draft: posts.filter((p) => p.status === "draft").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      published: posts.filter((p) => p.status === "published").length,
      failed: posts.filter((p) => p.status === "failed").length,
    }),
    [posts]
  );
  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
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
    instagram: '📸',
    linkedin: '💼',
    twitter: '🐦',
    facebook: '📘',
    tiktok: '🎵'
  }
  return platforms?.map(platform => platformEmojis[platform] ?? '📱').join(' ') || ''
}

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600 mt-1">
            Manage your social media content and track performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/ai-generator">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generator
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Posts ({statusCounts.all})</option>
                <option value="draft">Drafts ({statusCounts.draft})</option>
                <option value="scheduled">
                  Scheduled ({statusCounts.scheduled})
                </option>
                <option value="published">
                  Published ({statusCounts.published})
                </option>
                <option value="failed">Failed ({statusCounts.failed})</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {posts.length === 0
                ? "No posts yet"
                : "No posts match your filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {posts.length === 0
                ? "Create your first post to get started with social media management"
                : "Try adjusting your search or filter criteria"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard/posts/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/ai-generator">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1 capitalize">{post.status}</span>
                      </Badge>
                      {post.platforms && post.platforms.length > 0 && (
                        <span className="text-lg">
                          {getPlatformEmojis(post.platforms)}
                        </span>
                      )}
                      {post.ai_generated && (
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-800"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title || "Untitled Post"}
                    </h3>

                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {post.content}
                    </p>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.hashtags.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{post.hashtags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Created{" "}
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {post.scheduled_for && (
                        <span>
                          Scheduled for{" "}
                          {format(
                            new Date(post.scheduled_for),
                            "MMM dd, yyyy h:mm a"
                          )}
                        </span>
                      )}
                      {post.published_at && (
                        <span>
                          Published{" "}
                          {formatDistanceToNow(new Date(post.published_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>

                    {post.engagement_data &&
                      Object.keys(post.engagement_data).length > 0 && (
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          {post.engagement_data.likes > 0 && (
                            <span className="flex items-center gap-1">
                              ❤️ {post.engagement_data.likes}
                            </span>
                          )}
                          {post.engagement_data.comments > 0 && (
                            <span className="flex items-center gap-1">
                              💬 {post.engagement_data.comments}
                            </span>
                          )}
                          {post.engagement_data.shares > 0 && (
                            <span className="flex items-center gap-1">
                              🔄 {post.engagement_data.shares}
                            </span>
                          )}
                          {post.engagement_data.impressions > 0 && (
                            <span className="flex items-center gap-1">
                              👁️{" "}
                              {post.engagement_data.impressions.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/posts/${post.id}`}>
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/posts/${post.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
