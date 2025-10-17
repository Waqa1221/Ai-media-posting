"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Post {
  id: string;
  title?: string;
  content: string;
  scheduled_for: string;
  platforms?: string[];
  status: string;
}

interface UpcomingPostsProps {
  posts: Post[];
}

export function UpcomingPosts({ posts }: UpcomingPostsProps) {
  const getPlatformEmojis = (platforms?: string[]) => {
    const platformEmojis: { [key: string]: string } = {
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

  const getTimeLabel = (scheduledFor: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledFor);
    const diffHours = Math.floor(
      (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return "Within hour";
    if (diffHours < 24) return "Today";
    if (diffHours < 48) return "Tomorrow";
    return format(scheduled, "MMM dd");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Upcoming Posts
        </CardTitle>
        <CardDescription>
          Your scheduled content for the next few days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No upcoming posts</p>
            <p className="text-sm text-gray-400 mb-4">
              Schedule your first post to see it here
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/scheduler">Schedule a Post</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {post.title || "Untitled Post"}
                    </h4>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(post.status)}
                    >
                      {getTimeLabel(post.scheduled_for)}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getPlatformEmojis(post.platforms)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(post.scheduled_for), "MMM dd, h:mm a")}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {posts.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/scheduler">
                    View all {posts.length} posts
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
