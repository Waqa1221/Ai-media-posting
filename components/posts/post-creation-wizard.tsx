"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Hash,
  Image,
  Send,
  Save,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface PostCreationWizardProps {
  method: "wizard" | "ai" | "manual";
  onComplete: (post: any) => void;
  onCancel: () => void;
}

interface PostData {
  title: string;
  content: string;
  platforms: string[];
  hashtags: string[];
  mediaUrls: string[];
  scheduledFor: Date | null;
  publishNow: boolean;
}

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "bg-pink-100 text-pink-800",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "🐦",
    color: "bg-gray-100 text-gray-800",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "bg-blue-100 text-blue-800",
  },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-black text-white" },
];

export function PostCreationWizard({
  method,
  onComplete,
  onCancel,
}: PostCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [postData, setPostData] = useState<PostData>({
    title: "",
    content: "",
    platforms: [],
    hashtags: [],
    mediaUrls: [],
    scheduledFor: null,
    publishNow: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const totalSteps = method === "manual" ? 4 : 5;

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      setConnectedAccounts(data || []);
    } catch (error) {
      console.error("Error loading connected accounts:", error);
    }
  };

  const updatePostData = (updates: Partial<PostData>) => {
    setPostData((prev) => ({ ...prev, ...updates }));
  };

  const addHashtag = () => {
    if (
      hashtagInput.trim() &&
      !postData.hashtags.includes(hashtagInput.trim())
    ) {
      updatePostData({
        hashtags: [...postData.hashtags, hashtagInput.trim().replace("#", "")],
      });
      setHashtagInput("");
    }
  };

  const removeHashtag = (index: number) => {
    updatePostData({
      hashtags: postData.hashtags.filter((_, i) => i !== index),
    });
  };

  const togglePlatform = (platformId: string) => {
    const isSelected = postData.platforms.includes(platformId);
    updatePostData({
      platforms: isSelected
        ? postData.platforms.filter((p) => p !== platformId)
        : [...postData.platforms, platformId],
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return postData.content.trim().length > 0;
      case 2:
        return postData.platforms.length > 0;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Scheduling is optional
      default:
        return true;
    }
  };

  const savePost = async (status: "draft" | "scheduled" | "published") => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const postPayload = {
        user_id: user.id,
        title: postData.title || postData.content.substring(0, 50) + "...",
        content: postData.content,
        platforms: postData.platforms,
        hashtags: postData.hashtags,
        media_urls: postData.mediaUrls,
        status,
        scheduled_for: postData.scheduledFor?.toISOString() || null,
        ai_generated: method === "ai",
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(postPayload)
        .select()
        .single();

      if (error) throw error;

      // If scheduling, add to scheduling queue
      if (status === "scheduled" && postData.scheduledFor) {
        for (const platform of postData.platforms) {
          await supabase.from("scheduling_queue").insert({
            post_id: data.id,
            user_id: user.id,
            platform,
            scheduled_for: postData.scheduledFor.toISOString(),
          });
        }
      }

      toast.success(`Post ${status} successfully!`);
      onComplete(data);
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please complete the required fields");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    if (postData.publishNow) {
      await publishPost();
    } else if (postData.scheduledFor) {
      await savePost("scheduled");
    } else {
      await savePost("draft");
    }
  };

  const publishPost = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First save the post
      const postPayload = {
        user_id: user.id,
        title: postData.title || postData.content.substring(0, 50) + "...",
        content: postData.content,
        platforms: postData.platforms,
        hashtags: postData.hashtags,
        media_urls: postData.mediaUrls,
        status: "draft",
        ai_generated: method === "ai",
      };

      const { data: savedPost, error: saveError } = await supabase
        .from("posts")
        .insert(postPayload)
        .select()
        .single();

      if (saveError) throw saveError;

      // Now publish to each platform
      const publishResults = [];
      for (const platform of postData.platforms) {
        try {
          const response = await fetch("/api/posts/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              postId: savedPost.id,
              platforms: [platform],
              publishNow: true,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error(`Failed to publish to ${platform}:`, result);
            publishResults.push({
              platform,
              success: false,
              error: result.error || "Unknown error",
            });
          } else {
            publishResults.push({
              platform,
              success: result.success,
              data: result.results,
            });
          }
        } catch (error) {
          console.error(`Error publishing to ${platform}:`, error);
          publishResults.push({
            platform,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Check results
      const successCount = publishResults.filter((r) => r.success).length;
      const failCount = publishResults.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(`Published successfully to ${successCount} platform(s)!`);

        // Show specific errors
        if (failCount > 0) {
          const failedPlatforms = publishResults
            .filter((r) => !r.success)
            .map((r) => `${r.platform}: ${r.error}`)
            .join("\n");

          toast.error(
            `Failed to publish to ${failCount} platform(s):\n${failedPlatforms}`,
            {
              duration: 10000,
            }
          );
        }

        // Update post status
        await supabase
          .from("posts")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
          })
          .eq("id", savedPost.id);

        onComplete(savedPost);
      } else {
        // All failed
        const errorMessages = publishResults
          .map((r) => `${r.platform}: ${r.error}`)
          .join("\n");

        toast.error(`Failed to publish to all platforms:\n${errorMessages}`, {
          duration: 10000,
        });

        // Keep as draft
        await supabase
          .from("posts")
          .update({
            status: "failed",
            error_message: errorMessages,
          })
          .eq("id", savedPost.id);
      }
    } catch (error) {
      console.error("Error in publishPost:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to publish post"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailablePlatforms = () => {
    return PLATFORMS.filter((platform) =>
      connectedAccounts.some((account) => account.platform === platform.id)
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content Creation</CardTitle>
              <CardDescription>
                Write your post content and add a title
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Post Title (Optional)
                </label>
                <Input
                  placeholder="Give your post a title..."
                  value={postData.title}
                  onChange={(e) => updatePostData({ title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content *
                </label>
                <Textarea
                  placeholder="What's on your mind? Share your thoughts, insights, or updates..."
                  value={postData.content}
                  onChange={(e) => updatePostData({ content: e.target.value })}
                  className="min-h-[150px]"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {postData.content.length} characters
                </div>
              </div>

              {method === "wizard" && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Need inspiration? Try our{" "}
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href="/dashboard/ai-generator" target="_blank">
                        AI Content Generator
                      </a>
                    </Button>{" "}
                    to create engaging content automatically.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Platform Selection</CardTitle>
              <CardDescription>
                Choose where you want to publish this post
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedAccounts.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No social media accounts connected.{" "}
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href="/dashboard/social-accounts">
                        Connect your accounts
                      </a>
                    </Button>{" "}
                    to start publishing.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAvailablePlatforms().map((platform) => (
                    <div
                      key={platform.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        postData.platforms.includes(platform.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => togglePlatform(platform.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{platform.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Connected account available
                          </div>
                        </div>
                        {postData.platforms.includes(platform.id) && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {postData.platforms.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">
                    Selected Platforms:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {postData.platforms.map((platformId) => {
                      const platform = PLATFORMS.find(
                        (p) => p.id === platformId
                      );
                      return platform ? (
                        <Badge key={platformId} className={platform.color}>
                          {platform.icon} {platform.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Hashtags & Media</CardTitle>
              <CardDescription>
                Add hashtags and media to boost engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hashtags
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add hashtag (without #)"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addHashtag())
                    }
                  />
                  <Button onClick={addHashtag} variant="outline">
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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Media (Coming Soon)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Media upload functionality coming soon
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Support for images, videos, and GIFs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
              <CardDescription>
                Choose when to publish your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publish-now"
                    checked={postData.publishNow}
                    onCheckedChange={(checked) =>
                      updatePostData({
                        publishNow: !!checked,
                        scheduledFor: checked ? null : postData.scheduledFor,
                      })
                    }
                  />
                  <label htmlFor="publish-now" className="text-sm font-medium">
                    Publish immediately
                  </label>
                </div>

                {!postData.publishNow && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Schedule for later
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {postData.scheduledFor
                              ? format(postData.scheduledFor, "PPP p")
                              : "Pick a date and time"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={postData.scheduledFor || undefined}
                            onSelect={(date) =>
                              updatePostData({ scheduledFor: date || null })
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                          {postData.scheduledFor && (
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                value={format(postData.scheduledFor, "HH:mm")}
                                onChange={(e) => {
                                  if (postData.scheduledFor) {
                                    const [hours, minutes] =
                                      e.target.value.split(":");
                                    const newDate = new Date(
                                      postData.scheduledFor
                                    );
                                    newDate.setHours(
                                      parseInt(hours),
                                      parseInt(minutes)
                                    );
                                    updatePostData({ scheduledFor: newDate });
                                  }
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {postData.scheduledFor && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Your post will be automatically published on{" "}
                          <strong>
                            {format(postData.scheduledFor, "PPP p")}
                          </strong>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Publish</CardTitle>
              <CardDescription>
                Review your post before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {postData.title || "Untitled Post"}
                </h4>
                <p className="text-gray-700 mb-3">{postData.content}</p>

                {postData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {postData.hashtags.map((tag, index) => (
                      <span key={index} className="text-blue-600 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>Publishing to:</span>
                    {postData.platforms.map((platformId) => {
                      const platform = PLATFORMS.find(
                        (p) => p.id === platformId
                      );
                      return platform ? (
                        <span key={platformId}>{platform.icon}</span>
                      ) : null;
                    })}
                  </div>
                  <div>
                    {postData.publishNow
                      ? "Publishing immediately"
                      : postData.scheduledFor
                      ? `Scheduled for ${format(
                          postData.scheduledFor,
                          "MMM dd, yyyy h:mm a"
                        )}`
                      : "Saving as draft"}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => savePost("draft")}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : postData.publishNow ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Now
                    </>
                  ) : postData.scheduledFor ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule Post
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Step {currentStep} of {totalSteps}
            </h2>
            <div className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handlePrevious}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep) || isLoading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isLoading}>
                {isLoading ? "Processing..." : "Complete"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
