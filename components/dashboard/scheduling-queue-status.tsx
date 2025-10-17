"use client";

import { useEffect, useState } from "react";
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
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  post_id: string;
  platform: string;
  scheduled_for: string;
  status: string;
  attempts: number;
  error_message: string | null;
  posts: {
    title: string;
    content: string;
  };
}

interface QueueStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  nextScheduled: QueueItem | null;
}

export function SchedulingQueueStatus() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    nextScheduled: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadQueueStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadQueueStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQueueStatus = async () => {
    try {
      const response = await fetch("/api/posts/queue-status");
      const data = await response.json();

      if (response.ok) {
        setQueueItems(data.queueItems);
        setStats(data.stats);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error loading queue status:", error);
      toast.error("Failed to load queue status");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadQueueStatus();
  };

  const removeFromQueue = async (postId: string, platform: string) => {
    try {
      const response = await fetch("/api/posts/queue-status", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, platform }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Removed from queue");
        loadQueueStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Failed to remove from queue");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis: Record<string, string> = {
      instagram: "📸",
      linkedin: "💼",
      twitter: "🐦",
      facebook: "📘",
      tiktok: "🎵",
    };
    return emojis[platform] || "📱";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading queue status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Scheduling Queue
            </CardTitle>
            <CardDescription>
              Monitor your scheduled posts and queue status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Queue Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        {/* Next Scheduled */}
        {stats.nextScheduled && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Next scheduled post:</strong>{" "}
              {stats.nextScheduled.posts.title} on{" "}
              {format(new Date(stats.nextScheduled.scheduled_for), "PPP p")} (
              {formatDistanceToNow(
                new Date(stats.nextScheduled.scheduled_for),
                { addSuffix: true }
              )}
              )
            </AlertDescription>
          </Alert>
        )}

        {/* Queue Items */}
        {queueItems.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No posts in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queueItems.slice(0, 10).map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {getPlatformEmoji(item.platform)}
                      </span>
                      <h4 className="font-medium text-gray-900">
                        {item.posts.title || "Untitled Post"}
                      </h4>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.posts.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Scheduled:{" "}
                        {format(new Date(item.scheduled_for), "MMM dd, h:mm a")}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(item.scheduled_for), {
                          addSuffix: true,
                        })}
                      </span>
                      {item.attempts > 0 && (
                        <span>Attempts: {item.attempts}</span>
                      )}
                    </div>

                    {item.error_message && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        Error: {item.error_message}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {item.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeFromQueue(item.post_id, item.platform)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
