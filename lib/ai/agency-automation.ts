import { createServiceRoleClient } from "@/lib/supabase/server";
import { aiContentGenerator } from "./generator";
import { schedulePost } from "@/lib/queue/client";
import { openaiClient } from "./openai-client";
import type { ContentBrief } from "./types";

interface ClientProject {
  id: string;
  user_id: string;
  business_name: string;
  industry: string;
  target_audience: string;
  brand_voice: string;
  content_pillars: string[];
  posting_frequency: string;
  platforms: string[];
  use_media_library: boolean;
  use_ai_images: boolean;
  content_themes: string[];
  optimal_times: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

interface AutomationSettings {
  content_generation_enabled: boolean;
  auto_scheduling_enabled: boolean;
  auto_publishing_enabled: boolean;
  content_approval_required: boolean;
  daily_post_limit: number;
  weekly_themes: string[];
}

export class AIMarketingAgency {
  private static instance: AIMarketingAgency;

  static getInstance(): AIMarketingAgency {
    if (!AIMarketingAgency.instance) {
      AIMarketingAgency.instance = new AIMarketingAgency();
    }
    return AIMarketingAgency.instance;
  }

  async createClientProject(data: {
    user_id: string;
    business_name: string;
    industry: string;
    target_audience: string;
    brand_voice: string;
    content_pillars: string[];
    posting_frequency: string;
    platforms: string[];
    use_media_library: boolean;
    use_ai_images: boolean;
    content_themes: string[];
    optimal_times: Record<string, string>;
  }): Promise<ClientProject> {
    const supabase = createServiceRoleClient();

    const { data: project, error } = await supabase
      .from("client_projects")
      .insert({
        ...data,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Set up automation for this client
    await this.setupClientAutomation(project.id);

    return project;
  }

  async setupClientAutomation(projectId: string) {
    const supabase = createServiceRoleClient();

    // Create automation rules for the client
    const automationRules = [
      {
        project_id: projectId,
        name: "Daily Content Generation",
        trigger_type: "schedule",
        trigger_conditions: { time: "06:00", timezone: "UTC" },
        actions: [{ type: "generate_and_schedule_content" }],
        is_active: true,
      },
      {
        project_id: projectId,
        name: "Weekly Content Planning",
        trigger_type: "schedule",
        trigger_conditions: { time: "09:00", day: "monday" },
        actions: [{ type: "plan_weekly_content" }],
        is_active: true,
      },
      {
        project_id: projectId,
        name: "Performance Optimization",
        trigger_type: "schedule",
        trigger_conditions: { time: "18:00", day: "friday" },
        actions: [{ type: "analyze_and_optimize" }],
        is_active: true,
      },
    ];

    for (const rule of automationRules) {
      await supabase.from("agency_automation_rules").insert(rule);
    }
  }

  async generateDailyContent(projectId: string): Promise<void> {
    const supabase = createServiceRoleClient();

    // Get project details
    const { data: project, error } = await supabase
      .from("client_projects")
      .select("*")
      .eq("id", projectId)
      .eq("is_active", true)
      .single();

    if (error || !project) {
      console.error("Project not found:", projectId);
      return;
    }

    // Determine how many posts to generate based on frequency
    const postsToGenerate = this.calculateDailyPosts(project.posting_frequency);

    for (let i = 0; i < postsToGenerate; i++) {
      await this.generateAndSchedulePost(project);
    }
  }

  private calculateDailyPosts(frequency: string): number {
    switch (frequency) {
      case "daily":
        return 1;
      case "few-times-week":
        return Math.random() > 0.5 ? 1 : 0; // ~3-4 times per week
      case "weekly":
        return Math.random() > 0.85 ? 1 : 0; // ~1 time per week
      case "bi-weekly":
        return Math.random() > 0.93 ? 1 : 0; // ~1 time per 2 weeks
      default:
        return 0;
    }
  }

  private async generateAndSchedulePost(project: ClientProject): Promise<void> {
    const supabase = createServiceRoleClient();

    try {
      // Select a random content theme for variety
      const theme =
        project.content_themes[
          Math.floor(Math.random() * project.content_themes.length)
        ];

      // Create content brief based on project settings
      const brief: ContentBrief = {
        industry: project.industry,
        tone: this.getBrandTone(project.brand_voice),
        keywords: [...project.content_pillars, theme],
        platform: project.platforms[0] as any, // Primary platform
        targetAudience: project.target_audience,
        brandVoice: project.brand_voice,
      };

      // Generate content
      const result = await aiContentGenerator.generateContent({
        brief,
        userId: project.user_id,
        model: "gpt-4",
        useCache: false,
        supabase,
      });

      // Handle media selection
      let selectedImages: string[] = [];

      if (project.use_ai_images && result.content.generated_images) {
        selectedImages = result.content.generated_images;
      } else if (project.use_media_library) {
        selectedImages = await this.selectFromMediaLibrary(
          project.user_id,
          theme
        );
      }

      // Create post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: project.user_id,
          title: `${project.business_name} - ${theme}`,
          content: result.content.caption,
          platforms: project.platforms,
          hashtags: result.content.hashtags,
          media_urls: selectedImages,
          status: "scheduled",
          scheduled_for: this.calculateOptimalTime(project),
          ai_generated: true,
          ai_prompt: JSON.stringify(brief),
          project_id: project.id,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Schedule the post
      for (const platform of project.platforms) {
        await schedulePost({
          postId: post.id,
          userId: project.user_id,
          platform,
          content: result.content.caption,
          mediaUrls: selectedImages,
          scheduledFor: post.scheduled_for,
        });

        await supabase.from("scheduling_queue").insert({
          post_id: post.id,
          user_id: project.user_id,
          platform,
          scheduled_for: post.scheduled_for,
          status: "pending",
        });
      }

      console.log(`Generated and scheduled post for project ${project.id}`);
    } catch (error) {
      console.error(
        `Error generating content for project ${project.id}:`,
        error
      );

      // Log the error for client reporting
      await supabase.from("agency_activity_logs").insert({
        project_id: project.id,
        activity_type: "content_generation_failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        created_at: new Date().toISOString(),
      });
    }
  }

  private async selectFromMediaLibrary(
    userId: string,
    theme: string
  ): Promise<string[]> {
    const supabase = createServiceRoleClient();

    // Get user's media library images that match the theme
    const { data: mediaItems, error } = await supabase
      .from("media_library")
      .select("url, tags")
      .eq("user_id", userId)
      .eq("type", "image")
      .limit(10);

    if (error || !mediaItems) return [];

    // Filter by theme/tags and select randomly
    const relevantImages = mediaItems.filter((item) =>
      item.tags?.some(
        (tag: string) =>
          tag.toLowerCase().includes(theme.toLowerCase()) ||
          theme.toLowerCase().includes(tag.toLowerCase())
      )
    );

    if (relevantImages.length > 0) {
      const randomImage =
        relevantImages[Math.floor(Math.random() * relevantImages.length)];
      return [randomImage.url];
    }

    // Fallback to any image from their library
    if (mediaItems.length > 0) {
      const randomImage =
        mediaItems[Math.floor(Math.random() * mediaItems.length)];
      return [randomImage.url];
    }

    return [];
  }

  private getBrandTone(
    brandVoice: string
  ): "professional" | "friendly" | "bold" {
    const voice = brandVoice.toLowerCase();
    if (voice.includes("professional") || voice.includes("formal"))
      return "professional";
    if (voice.includes("bold") || voice.includes("confident")) return "bold";
    return "friendly";
  }

  private calculateOptimalTime(project: ClientProject): string {
    const today = new Date();
    const platform = project.platforms[0]; // Use primary platform for timing
    const optimalTime = project.optimal_times[platform] || "09:00";

    // Schedule for today if it's before the optimal time, otherwise tomorrow
    const [hours, minutes] = optimalTime.split(":").map(Number);
    const scheduledDate = new Date(today);
    scheduledDate.setHours(hours, minutes, 0, 0);

    if (scheduledDate <= today) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    return scheduledDate.toISOString();
  }

  async analyzeAndOptimize(projectId: string): Promise<void> {
    const supabase = createServiceRoleClient();

    // Get recent posts performance
    const { data: recentPosts, error } = await supabase
      .from("posts")
      .select("*, analytics(*)")
      .eq("project_id", projectId)
      .eq("status", "published")
      .gte(
        "published_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("published_at", { ascending: false });

    if (error || !recentPosts) return;

    // Analyze performance and generate insights
    const insights = await this.generatePerformanceInsights(recentPosts);

    // Update project settings based on insights
    await this.updateProjectOptimizations(projectId, insights);

    // Log the optimization activity
    await supabase.from("agency_activity_logs").insert({
      project_id: projectId,
      activity_type: "performance_optimization",
      details: insights,
      created_at: new Date().toISOString(),
    });
  }

  private async generatePerformanceInsights(posts: any[]): Promise<any> {
    if (posts.length === 0) return { message: "No recent posts to analyze" };

    // Calculate engagement metrics
    const totalEngagement = posts.reduce((sum: number, post: any) => {
      const analytics = post.analytics || [];
      return (
        sum +
        analytics.reduce(
          (postSum: number, metric: any) =>
            postSum + (metric.metric_value || 0),
          0
        )
      );
    }, 0);

    const avgEngagement = totalEngagement / posts.length;

    // Find best performing content themes
    const themePerformance: {
      [key: string]: { total: number; count: number };
    } = {};
    posts.forEach((post: any) => {
      const theme = post.title?.split(" - ")[1] || "general";
      const engagement =
        post.analytics?.reduce(
          (sum: number, metric: any) => sum + (metric.metric_value || 0),
          0
        ) || 0;

      if (!themePerformance[theme]) {
        themePerformance[theme] = { total: 0, count: 0 };
      }
      themePerformance[theme].total += engagement;
      themePerformance[theme].count += 1;
    });

    const bestThemes = Object.entries(themePerformance)
      .map(([theme, data]) => ({
        theme,
        avgEngagement: data.total / data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 3);

    return {
      avgEngagement,
      totalPosts: posts.length,
      bestThemes: bestThemes.map((t) => t.theme),
      recommendations: this.generateRecommendations(avgEngagement, bestThemes),
    };
  }

  private generateRecommendations(
    avgEngagement: number,
    bestThemes: any[]
  ): string[] {
    const recommendations = [];

    if (avgEngagement < 50) {
      recommendations.push("Increase posting frequency to boost engagement");
      recommendations.push(
        "Focus more on interactive content with questions and CTAs"
      );
    }

    if (bestThemes.length > 0) {
      recommendations.push(
        `Focus more on "${bestThemes[0].theme}" content - it performs best`
      );
    }

    recommendations.push("Consider A/B testing different posting times");
    recommendations.push("Experiment with video content for higher engagement");

    return recommendations;
  }

  private async updateProjectOptimizations(
    projectId: string,
    insights: any
  ): Promise<void> {
    const supabase = createServiceRoleClient();

    // Update content themes based on performance
    if (insights.bestThemes && insights.bestThemes.length > 0) {
      await supabase
        .from("client_projects")
        .update({
          content_themes: insights.bestThemes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    }
  }

  async getClientDashboard(projectId: string): Promise<any> {
    const supabase = createServiceRoleClient();

    // Get project details
    const { data: project } = await supabase
      .from("client_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from("agency_activity_logs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get upcoming posts
    const { data: upcomingPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "scheduled")
      .order("scheduled_for", { ascending: true })
      .limit(5);

    // Get performance metrics
    const { data: recentPosts } = await supabase
      .from("posts")
      .select("*, analytics(*)")
      .eq("project_id", projectId)
      .eq("status", "published")
      .gte(
        "published_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    return {
      project,
      recentActivity,
      upcomingPosts,
      performanceMetrics: this.calculatePerformanceMetrics(recentPosts || []),
    };
  }

  private calculatePerformanceMetrics(posts: any[]): any {
    if (posts.length === 0) {
      return {
        totalPosts: 0,
        totalEngagement: 0,
        avgEngagement: 0,
        topPerformingPost: null,
      };
    }

    const totalEngagement = posts.reduce((sum: number, post: any) => {
      const analytics = post.analytics || [];
      return (
        sum +
        analytics.reduce(
          (postSum: number, metric: any) =>
            postSum + (metric.metric_value || 0),
          0
        )
      );
    }, 0);

    const topPost = posts.reduce((best: any, post: any) => {
      const postEngagement =
        post.analytics?.reduce(
          (sum: number, metric: any) => sum + (metric.metric_value || 0),
          0
        ) || 0;
      const bestEngagement =
        best.analytics?.reduce(
          (sum: number, metric: any) => sum + (metric.metric_value || 0),
          0
        ) || 0;
      return postEngagement > bestEngagement ? post : best;
    });

    return {
      totalPosts: posts.length,
      totalEngagement,
      avgEngagement: Math.round(totalEngagement / posts.length),
      topPerformingPost: topPost,
    };
  }
}

export const aiMarketingAgency = AIMarketingAgency.getInstance();
