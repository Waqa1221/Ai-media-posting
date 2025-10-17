"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient, ensureUserProfile } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardData {
  user: any;
  profile: any;
  stats: {
    totalPosts: number;
    scheduledPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalEngagement: number;
    engagementRate: number;
    aiGenerations: number;
    connectedAccounts: number;
    weeklyGrowth: number;
    monthlyReach: number;
    avgEngagementRate: number;
    topPerformingPlatform: string;
    contentScore: number;
    automationSavings: number;
  };
  recentPosts: any[];
  upcomingPosts: any[];
  analytics: any[];
  usageData: any;
  notifications: any[];
  automations: any[];
  teamMembers: any[];
  trendingTopics: any[];
  contentCalendar: any[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const hasLoadedRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const loadDashboardData = useCallback(
    async (forceRefresh = false) => {
      // Skip if already loading or loaded (unless forced)
      if (hasLoadedRef.current && !forceRefresh) return;

      try {
        hasLoadedRef.current = true;
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/signin");
          return;
        }

        // Load only essential data first for faster initial render
        const [profileResult, postsResult] = await Promise.allSettled([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase
            .from("posts")
            .select(
              "id, title, content, platforms, status, scheduled_for, published_at, ai_generated, hashtags, engagement_data, created_at"
            )
            .eq("user_id", user.id)
            .limit(20)
            .order("created_at", { ascending: false }),
        ]);

        // Handle profile creation if it doesn't exist
        let profile =
          profileResult.status === "fulfilled"
            ? profileResult.value.data
            : null;

        if (!profile) {
          console.warn(
            "Profile not found, attempting to create for user:",
            user.id
          );

          try {
            // Use the helper function to ensure profile exists
            await ensureUserProfile(
              user.id,
              user.email || "",
              user.user_metadata?.full_name
            );

            // Try to fetch the profile again with basic fields only
            const { data: newProfile, error: newProfileError } = await supabase
              .from("profiles")
              .select(
                "id, email, full_name, subscription_tier, subscription_status, created_at, updated_at"
              )
              .eq("id", user.id)
              .maybeSingle();

            if (newProfileError) {
              console.warn(
                "Error fetching newly created profile:",
                newProfileError
              );
            }

            profile = newProfile;
          } catch (profileCreationError) {
            console.warn(
              "Failed to create profile, using defaults:",
              profileCreationError
            );

            // Create a minimal profile object to prevent crashes
            profile = {
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || null,
              subscription_tier: "premium",
              subscription_status: "active",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
        }

        // Ensure profile has required fields
        if (profile && !profile.subscription_tier) {
          profile.subscription_tier = "premium";
        }
        if (profile && !profile.subscription_status) {
          profile.subscription_status = "active";
        }

        // Load secondary data in background
        const [
          socialAccountsResult,
          usageResult,
          analyticsResult,
          aiGenerationsResult,
        ] = await Promise.allSettled([
          supabase
            .from("social_accounts")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true),
          supabase.from("usage_limits").select("*").eq("user_id", user.id),
          supabase
            .from("analytics")
            .select("*")
            .eq("user_id", user.id)
            .gte(
              "recorded_at",
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            )
            .limit(200),
          supabase
            .from("ai_generations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        // Handle results with proper error checking
        const posts =
          postsResult.status === "fulfilled"
            ? postsResult.value.data || []
            : [];
        const socialAccounts =
          socialAccountsResult.status === "fulfilled"
            ? socialAccountsResult.value.data || []
            : [];
        const usage =
          usageResult.status === "fulfilled"
            ? usageResult.value.data || []
            : [];
        const analytics =
          analyticsResult.status === "fulfilled"
            ? analyticsResult.value.data || []
            : [];
        const aiGenerations =
          aiGenerationsResult.status === "fulfilled"
            ? aiGenerationsResult.value.data || []
            : [];

        // Calculate comprehensive metrics
        const publishedPosts = posts.filter((p) => p.status === "published");
        const scheduledPosts = posts.filter((p) => p.status === "scheduled");
        const draftPosts = posts.filter((p) => p.status === "draft");

        // Engagement calculations
        const totalEngagement = publishedPosts.reduce((sum, post) => {
          const engagement = post.engagement_data || {};
          return (
            sum +
            (engagement.likes || 0) +
            (engagement.comments || 0) +
            (engagement.shares || 0)
          );
        }, 0);

        const totalImpressions = publishedPosts.reduce((sum, post) => {
          const engagement = post.engagement_data || {};
          return sum + (engagement.impressions || 0);
        }, 0);

        const engagementRate =
          totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

        // Growth calculations
        const lastWeekPosts = posts.filter(
          (p) =>
            new Date(p.created_at) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        const previousWeekPosts = posts.filter((p) => {
          const date = new Date(p.created_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
          return date > twoWeeksAgo && date <= weekAgo;
        });

        const weeklyGrowth =
          previousWeekPosts.length > 0
            ? ((lastWeekPosts.length - previousWeekPosts.length) /
                previousWeekPosts.length) *
              100
            : 0;

        // Platform performance
        const platformEngagement: { [key: string]: number } = {};
        publishedPosts.forEach((post) => {
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
            [platform, engagement]: [string, number]
          ) => {
            return engagement > best.engagement
              ? { platform, engagement }
              : best;
          },
          { platform: "instagram", engagement: 0 }
        );

        // Content score calculation
        const contentScore =
          publishedPosts.length > 0
            ? Math.min(
                100,
                Math.round((totalEngagement / publishedPosts.length) * 2)
              )
            : 0;

        // Automation savings (estimated hours saved)
        const automationSavings =
          aiGenerations.length * 0.5 + scheduledPosts.length * 0.25;

        // Generate mock data for features not yet implemented
        const mockTrendingTopics = [
          { topic: "AI Technology", volume: 15420, growth: 23 },
          { topic: "Social Media Marketing", volume: 8930, growth: 18 },
          { topic: "Content Creation", volume: 6750, growth: 31 },
          { topic: "Digital Transformation", volume: 4320, growth: 12 },
        ];

        const mockAutomations = [
          {
            id: "1",
            name: "Daily Motivation Posts",
            status: "active",
            lastRun: new Date(),
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          {
            id: "2",
            name: "Weekly Industry News",
            status: "active",
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
            nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: "3",
            name: "Engagement Responses",
            status: "paused",
            lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
            nextRun: null,
          },
        ];

        setData({
          user,
          profile,
          stats: {
            totalPosts: posts.length,
            scheduledPosts: scheduledPosts.length,
            publishedPosts: publishedPosts.length,
            draftPosts: draftPosts.length,
            totalEngagement,
            engagementRate: Math.round(engagementRate * 100) / 100,
            aiGenerations: aiGenerations.length,
            connectedAccounts: socialAccounts.length,
            weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
            monthlyReach: totalImpressions,
            avgEngagementRate: engagementRate,
            topPerformingPlatform: topPlatform.platform,
            contentScore,
            automationSavings: Math.round(automationSavings * 10) / 10,
          },
          recentPosts: posts.slice(0, 10),
          upcomingPosts: scheduledPosts
            .sort(
              (a, b) =>
                new Date(a.scheduled_for).getTime() -
                new Date(b.scheduled_for).getTime()
            )
            .slice(0, 8),
          analytics,
          usageData: usage.reduce((acc, item) => {
            acc[item.limit_type] = item;
            return acc;
          }, {}),
          notifications: [],
          automations: mockAutomations,
          teamMembers: [],
          trendingTopics: mockTrendingTopics,
          contentCalendar: scheduledPosts.slice(0, 15),
        });

        setLastRefresh(new Date());
        setRetryCount(0);
      } catch (error) {
        console.error("Dashboard data loading error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data";
        setError(errorMessage);
        hasLoadedRef.current = false;

        // Retry logic for transient errors
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            hasLoadedRef.current = false;
            loadDashboardData(false);
          }, 500 * (retryCount + 1)); // Faster retry
        }
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router, retryCount]
  );

  const refreshData = useCallback(() => {
    hasLoadedRef.current = false;
    setRetryCount(0);
    loadDashboardData(true);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 10 minutes when tab is visible (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        hasLoadedRef.current = false;
        setRetryCount(0);
        loadDashboardData(true);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  return {
    data,
    isLoading,
    error,
    lastRefresh,
    retryCount,
    refreshData,
    loadDashboardData,
  };
}
