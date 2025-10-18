import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlatformClientFactory } from "@/lib/social/platform-clients";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Social post fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData = await request.json();

    // Get the post first
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Update the post
    const { data: updatedPost, error: updateError } = await supabase
      .from("posts")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Post update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, ...updateData } = await request.json();

    // Get the post
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (action === "publish") {
      if (post.status === "published") {
        return NextResponse.json(
          { error: "Post is already published" },
          { status: 400 }
        );
      }

      if (
        !post.social_accounts ||
        post.social_accounts.connection_status !== "connected"
      ) {
        return NextResponse.json(
          { error: "Social account is not connected" },
          { status: 400 }
        );
      }

      try {
        const platformClient = PlatformClientFactory.createClient(
          post.platform,
          post.social_accounts.access_token
        );

        const publishResult = await platformClient.publishPost(
          post.content,
          post.media_urls,
          post.metadata
        );

        let updateFields: any = {
          retry_count: (post.retry_count || 0) + 1,
          last_retry_at: new Date().toISOString(),
        };

        if (publishResult.success) {
          updateFields = {
            ...updateFields,
            status: "published",
            published_at: new Date().toISOString(),
            platform_post_id: publishResult.platformPostId,
            platform_post_url: publishResult.platformPostUrl,
            error_message: null,
          };
        } else {
          updateFields = {
            ...updateFields,
            status: "failed",
            error_message: publishResult.error,
          };
        }

        const { data: updatedPost, error: updateError } = await supabase
          .from("social_posts")
          .update(updateFields)
          .eq("id", params.id)
          .select(
            `
            *,
            social_accounts!inner(
              platform,
              username,
              display_name,
              avatar_url
            )
          `
          )
          .single();

        if (updateError) {
          throw new Error("Failed to update post status");
        }

        return NextResponse.json(updatedPost);
      } catch (publishError) {
        console.error("Publishing error:", publishError);

        let errorMessage = "Publishing failed";
        if (
          typeof publishError === "object" &&
          publishError !== null &&
          "message" in publishError
        ) {
          errorMessage = `Publishing failed: ${
            (publishError as { message?: string }).message
          }`;
        }

        await supabase
          .from("social_posts")
          .update({
            status: "failed",
            error_message: errorMessage,
            retry_count: (post.retry_count || 0) + 1,
            last_retry_at: new Date().toISOString(),
          })
          .eq("id", params.id);

        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
    }

    if (action === "cancel") {
      if (post.status !== "scheduled") {
        return NextResponse.json(
          { error: "Only scheduled posts can be cancelled" },
          { status: 400 }
        );
      }

      const { data: updatedPost, error: updateError } = await supabase
        .from("social_posts")
        .update({ status: "cancelled" })
        .eq("id", params.id)
        .select(
          `
          *,
          social_accounts!inner(
            platform,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to cancel post" },
          { status: 500 }
        );
      }

      return NextResponse.json(updatedPost);
    }

    if (action === "sync_analytics") {
      if (post.status !== "published" || !post.platform_post_id) {
        return NextResponse.json(
          { error: "Can only sync analytics for published posts" },
          { status: 400 }
        );
      }

      try {
        const platformClient = PlatformClientFactory.createClient(
          post.platform,
          post.social_accounts.access_token
        );

        const analytics = await platformClient.getAnalytics(
          post.platform_post_id
        );

        // Update post with analytics data
        const { error: updateError } = await supabase
          .from("social_posts")
          .update({
            likes_count: analytics.likes || 0,
            comments_count: analytics.comments || 0,
            shares_count: analytics.shares || 0,
            views_count: analytics.impressions || 0,
            engagement_rate: analytics.engagementRate || 0,
          })
          .eq("id", params.id);

        if (updateError) {
          throw new Error("Failed to update analytics data");
        }

        // Store detailed analytics
        const analyticsEntries = Object.entries(analytics).map(
          ([metric, value]) => ({
            post_id: params.id,
            user_id: user.id,
            platform: post.platform,
            metric_name: metric,
            metric_value: value as number,
            metric_date: new Date().toISOString().split("T")[0],
          })
        );

        if (analyticsEntries.length > 0) {
          await supabase.from("post_analytics").upsert(analyticsEntries, {
            onConflict: "post_id,metric_name,metric_date",
          });
        }

        return NextResponse.json({
          message: "Analytics synced successfully",
          analytics,
        });
      } catch (analyticsError) {
        console.error("Analytics sync error:", analyticsError);
        let errorMessage = "Analytics sync failed";
        if (
          typeof analyticsError === "object" &&
          analyticsError !== null &&
          "message" in analyticsError
        ) {
          errorMessage = `Analytics sync failed: ${
            (analyticsError as { message?: string }).message
          }`;
        }
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
    }

    // Handle regular updates
    const allowedUpdates = [
      "content",
      "media_urls",
      "hashtags",
      "mentions",
      "location",
      "scheduled_for",
      "metadata",
    ];
    const filteredUpdates = Object.keys(updateData)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as { [key: string]: any });

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Don't allow editing published posts
    if (post.status === "published") {
      return NextResponse.json(
        { error: "Cannot edit published posts" },
        { status: 400 }
      );
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from("social_posts")
      .update(filteredUpdates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        social_accounts!inner(
          platform,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update social post" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Social post update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Post deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
