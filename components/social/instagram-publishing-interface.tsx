"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  Video,
  RefreshCw,
  Info,
  Calendar,
  Send,
  AlertCircle,
  CheckCircle,
  Upload,
  Hash,
  Target,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface InstagramPost {
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  location?: string;
  scheduledFor?: Date;
  postType: "feed" | "story" | "reel";
}

interface InstagramPublishingInterfaceProps {
  account: any;
  onPublish: (postData: InstagramPost) => Promise<void>;
  onSchedule: (postData: InstagramPost) => Promise<void>;
}

export function InstagramPublishingInterface({
  account,
  onPublish,
  onSchedule,
}: InstagramPublishingInterfaceProps) {
  const [postData, setPostData] = useState<InstagramPost>({
    content: "",
    mediaUrls: [],
    hashtags: [],
    location: "",
    postType: "feed",
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updatePostData = (updates: Partial<InstagramPost>) => {
    setPostData((prev) => ({ ...prev, ...updates }));

    // Clear related errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach((key) => {
        delete newErrors[key];
      });
      return newErrors;
    });
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace("#", "");
    if (
      tag &&
      !postData.hashtags.includes(tag) &&
      postData.hashtags.length < 30
    ) {
      updatePostData({ hashtags: [...postData.hashtags, tag] });
      setHashtagInput("");
    }
  };

  const removeHashtag = (index: number) => {
    updatePostData({
      hashtags: postData.hashtags.filter((_, i) => i !== index),
    });
  };

  const validatePost = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Instagram requires media for feed posts
    if (postData.postType === "feed" && postData.mediaUrls.length === 0) {
      newErrors.media =
        "Instagram feed posts require at least one image or video";
    }

    // Content length validation
    if (postData.content.length > 2200) {
      newErrors.content = "Instagram captions cannot exceed 2,200 characters";
    }

    // Hashtag validation
    if (postData.hashtags.length > 30) {
      newErrors.hashtags = "Instagram allows maximum 30 hashtags per post";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validatePost()) {
      toast.error("Please fix the errors before publishing");
      return;
    }

    setIsPublishing(true);
    try {
      await onPublish(postData);
      toast.success("Posted to Instagram successfully!");

      // Reset form
      setPostData({
        content: "",
        mediaUrls: [],
        hashtags: [],
        location: "",
        postType: "feed",
      });
    } catch (error) {
      toast.error("Failed to publish to Instagram");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!validatePost()) {
      toast.error("Please fix the errors before scheduling");
      return;
    }

    try {
      await onSchedule(postData);
      toast.success("Instagram post scheduled successfully!");
    } catch (error) {
      toast.error("Failed to schedule Instagram post");
    }
  };

  const getPostTypeDescription = (type: string) => {
    switch (type) {
      case "feed":
        return "Regular posts that appear in your feed and followers' timelines";
      case "story":
        return "Temporary content that disappears after 24 hours";
      case "reel":
        return "Short-form vertical videos for maximum reach";
      default:
        return "";
    }
  };

  const getPostTypeRequirements = (type: string) => {
    switch (type) {
      case "feed":
        return [
          "At least 1 image or video",
          "Square (1:1) or portrait (4:5) aspect ratio",
          "Max 10 items for carousel",
        ];
      case "story":
        return [
          "Image or video required",
          "Vertical (9:16) aspect ratio",
          "Max 15 seconds for video",
        ];
      case "reel":
        return [
          "Video required",
          "Vertical (9:16) aspect ratio",
          "15 seconds to 90 seconds duration",
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
            📸
          </div>
          Instagram Publishing
        </CardTitle>
        <CardDescription>
          Create and publish content to your Instagram account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!account ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your Instagram account first to use publishing
              features.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Post Type Selection */}
            <Tabs
              value={postData.postType}
              onValueChange={(value) =>
                updatePostData({ postType: value as any })
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Feed Post
                </TabsTrigger>
                <TabsTrigger value="story" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Story
                </TabsTrigger>
                <TabsTrigger value="reel" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Reel
                </TabsTrigger>
              </TabsList>

              <TabsContent value={postData.postType} className="space-y-4">
                {/* Post Type Info */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">
                        {postData.postType.charAt(0).toUpperCase() +
                          postData.postType.slice(1)}{" "}
                        Post
                      </div>
                      <div className="text-sm">
                        {getPostTypeDescription(postData.postType)}
                      </div>
                      <div className="text-sm">
                        <strong>Requirements:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {getPostTypeRequirements(postData.postType).map(
                            (req, index) => (
                              <li key={index}>{req}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Media Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Media {postData.postType === "feed" ? "*" : "(Required)"}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload{" "}
                      {postData.postType === "reel"
                        ? "video"
                        : "images or videos"}
                    </p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {postData.postType === "feed" &&
                        "JPG, PNG, MP4 • Max 10 files"}
                      {postData.postType === "story" &&
                        "JPG, PNG, MP4 • 9:16 aspect ratio"}
                      {postData.postType === "reel" &&
                        "MP4 only • 9:16 aspect ratio • 15-90 seconds"}
                    </p>
                  </div>
                  {errors.media && (
                    <p className="text-sm text-red-500 mt-1">{errors.media}</p>
                  )}
                </div>

                {/* Caption */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Caption
                  </label>
                  <Textarea
                    placeholder="Write your Instagram caption..."
                    value={postData.content}
                    onChange={(e) =>
                      updatePostData({ content: e.target.value })
                    }
                    className="min-h-[120px]"
                    maxLength={2200}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{postData.content.length}/2,200 characters</span>
                    {errors.content && (
                      <span className="text-red-500">{errors.content}</span>
                    )}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Hashtags ({postData.hashtags.length}/30)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add hashtag (without #)"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addHashtag())
                      }
                      disabled={postData.hashtags.length >= 30}
                    />
                    <Button
                      onClick={addHashtag}
                      variant="outline"
                      disabled={
                        !hashtagInput.trim() || postData.hashtags.length >= 30
                      }
                    >
                      <Hash className="w-4 h-4" />
                    </Button>
                  </div>

                  {postData.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {postData.hashtags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            onClick={() => removeHashtag(index)}
                            className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.hashtags && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.hashtags}
                    </p>
                  )}
                </div>

                {/* Location (Optional) */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location (Optional)
                  </label>
                  <Input
                    placeholder="Add location..."
                    value={postData.location}
                    onChange={(e) =>
                      updatePostData({ location: e.target.value })
                    }
                  />
                </div>

                {/* Publishing Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSchedule}
                    variant="outline"
                    className="flex-1"
                    disabled={isPublishing}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing || !validatePost()}
                    className="flex-1"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publish Now
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Instagram Best Practices */}
            <Alert className="bg-pink-50 border-pink-200">
              <Target className="h-4 w-4 text-pink-600" />
              <AlertDescription className="text-pink-800">
                <div className="space-y-1">
                  <div className="font-medium">Instagram Best Practices:</div>
                  <ul className="text-sm space-y-1">
                    <li>• Use high-quality, visually appealing images</li>
                    <li>• Include 5-11 relevant hashtags for optimal reach</li>
                    <li>• Post consistently (1-2 times per day)</li>
                    <li>• Engage with your audience in comments</li>
                    <li>• Use Stories for behind-the-scenes content</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
