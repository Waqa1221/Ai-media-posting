"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  ThumbsUp,
  MessageCircle,
  Share,
  Eye,
  Lightbulb,
  LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

interface PerformanceInsightsProps {
  posts: any[];
  analytics: any[];
}

interface Post {
  id: string;
  status: string;
  engagement_data?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
  published_at?: string;
  platforms?: string[];
  ai_generated?: boolean;
  content: string;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface TimeEngagement {
  [key: number]: number;
}

interface PlatformEngagement {
  [key: string]: number;
}

export function PerformanceInsights({
  posts,
  analytics,
}: PerformanceInsightsProps) {
  const insights = useMemo(() => {
    const publishedPosts = posts.filter(
      (p: Post) => p.status === "published" && p.engagement_data
    );

    if (publishedPosts.length === 0) {
      return {
        bestPerformingPost: null,
        averageEngagement: 0,
        bestPostingTime: null,
        topPlatform: null,
        recommendations: [] as Recommendation[],
      };
    }

    // Find best performing post
    const bestPost = publishedPosts.reduce((best: Post, post: Post) => {
      const currentEngagement =
        (post.engagement_data?.likes || 0) +
        (post.engagement_data?.comments || 0) +
        (post.engagement_data?.shares || 0);
      const bestEngagement =
        (best.engagement_data?.likes || 0) +
        (best.engagement_data?.comments || 0) +
        (best.engagement_data?.shares || 0);
      return currentEngagement > bestEngagement ? post : best;
    });

    // Calculate average engagement
    const totalEngagement = publishedPosts.reduce((sum: number, post: Post) => {
      return (
        sum +
        (post.engagement_data?.likes || 0) +
        (post.engagement_data?.comments || 0) +
        (post.engagement_data?.shares || 0)
      );
    }, 0);
    const avgEngagement = Math.round(totalEngagement / publishedPosts.length);

    // Find best posting time
    const timeEngagement: TimeEngagement = {};
    publishedPosts.forEach((post: Post) => {
      if (post.published_at) {
        const hour = new Date(post.published_at).getHours();
        const engagement =
          (post.engagement_data?.likes || 0) +
          (post.engagement_data?.comments || 0) +
          (post.engagement_data?.shares || 0);
        timeEngagement[hour] = (timeEngagement[hour] || 0) + engagement;
      }
    });

    const bestHour = Object.entries(timeEngagement).reduce(
      (best: { hour: number; engagement: number }, [hour, engagement]) => {
        return engagement > best.engagement
          ? { hour: parseInt(hour), engagement }
          : best;
      },
      { hour: 9, engagement: 0 }
    );

    // Find top platform
    const platformEngagement: PlatformEngagement = {};
    publishedPosts.forEach((post: Post) => {
      post.platforms?.forEach((platform: string) => {
        const engagement =
          (post.engagement_data?.likes || 0) +
          (post.engagement_data?.comments || 0) +
          (post.engagement_data?.shares || 0);
        platformEngagement[platform] =
          (platformEngagement[platform] || 0) + engagement;
      });
    });

    const topPlatform = Object.entries(platformEngagement).reduce(
      (
        best: { platform: string; engagement: number },
        [platform, engagement]
      ) => {
        return engagement > best.engagement ? { platform, engagement } : best;
      },
      { platform: "instagram", engagement: 0 }
    );

    // Generate recommendations
    const recommendations: Recommendation[] = [];

    if (avgEngagement < 50) {
      recommendations.push({
        type: "engagement",
        title: "Boost Engagement",
        description:
          "Try asking questions or adding calls-to-action to increase interaction",
        icon: ThumbsUp,
        color: "text-blue-600",
      });
    }

    if (
      publishedPosts.filter((p: Post) => p.ai_generated).length /
        publishedPosts.length <
      0.3
    ) {
      recommendations.push({
        type: "ai",
        title: "Use More AI Content",
        description:
          "AI-generated posts often perform better. Try our AI generator",
        icon: TrendingUp,
        color: "text-purple-600",
      });
    }

    if (bestHour.hour !== 9) {
      recommendations.push({
        type: "timing",
        title: "Optimize Posting Time",
        description: `Your best engagement is at ${bestHour.hour}:00. Schedule more posts then`,
        icon: Clock,
        color: "text-green-600",
      });
    }

    return {
      bestPerformingPost: bestPost,
      averageEngagement: avgEngagement,
      bestPostingTime: bestHour.hour,
      topPlatform: topPlatform.platform,
      recommendations,
    };
  }, [posts, analytics]);

  const formatTime = (hour: number | null) => {
    if (hour === null) return "9:00 AM";
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getPlatformEmoji = (platform: string | null) => {
    const emojis: { [key: string]: string } = {
      instagram: "📸",
      linkedin: "💼",
      twitter: "🐦",
      facebook: "📘",
      tiktok: "🎵",
    };
    return emojis[platform || "instagram"] || "📱";
  };

  const formatPlatformName = (platform: string | null) => {
    if (!platform) return "Instagram";
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Performance Insights
        </CardTitle>
        <CardDescription>
          AI-powered recommendations to improve your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {insights.averageEngagement}
            </div>
            <div className="text-sm text-green-600">Avg. Engagement</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatTime(insights.bestPostingTime)}
            </div>
            <div className="text-sm text-blue-600">Best Time</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {getPlatformEmoji(insights.topPlatform)}{" "}
              {formatPlatformName(insights.topPlatform)}
            </div>
            <div className="text-sm text-purple-600">Top Platform</div>
          </div>
        </div>

        {/* Best Performing Post */}
        {insights.bestPerformingPost && (
          <div className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 mb-1">
                  🏆 Best Performing Post
                </h4>
                <p className="text-sm text-orange-800 mb-2 line-clamp-2">
                  {insights.bestPerformingPost.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-orange-700">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {insights.bestPerformingPost.engagement_data?.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {insights.bestPerformingPost.engagement_data?.comments || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share className="w-3 h-3" />
                    {insights.bestPerformingPost.engagement_data?.shares || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Recommendations
            </h4>
            {insights.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <rec.icon className={`w-4 h-4 ${rec.color} mt-0.5`} />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm mb-1">
                    {rec.title}
                  </h5>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No data state */}
        {posts.filter((p: Post) => p.status === "published").length === 0 && (
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No performance data yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Publish some posts to see insights and recommendations
            </p>
            <Button size="sm">Create Your First Post</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
