import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishToSocialPlatform } from "@/lib/social/publisher";

export async function POST(req: Request) {
  try {
    console.log("[Publish API] Request received");
    const { postId, platforms, publishNow } = await req.json();
    console.log("[Publish API] Params:", { postId, platforms, publishNow });

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Publish API] Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Publish API] User authenticated:", user.id);

    // Get post details
    console.log("[Publish API] Fetching post:", postId);
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      console.error("[Publish API] Post not found:", postError);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    console.log("[Publish API] Post found:", post.id);

    const results = [];
    const errors = [];
    const platformsToPublish = platforms || post.platforms || [];

    if (publishNow) {
      // Publish immediately
      console.log("[Publish API] Publishing to platforms:", platformsToPublish);

      for (const platform of platformsToPublish) {
        console.log(`[Publish API] Publishing to ${platform}...`);

        try {
          const result = await publishToSocialPlatform({
            userId: user.id,
            platform,
            content: post.content,
            mediaUrls: post.media_urls,
            postId: post.id,
          });

          console.log(`[Publish API] ${platform} result:`, result);

          results.push({
            platform,
            success: result.success,
            platformPostId: result.platformPostId,
            url: result.url,
            error: result.error,
          });

          if (!result.success) {
            errors.push(`${platform}: ${result.error}`);
          }
        } catch (error) {
          console.error(`[Publish API] ${platform} exception:`, error);
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(`${platform}: ${errorMsg}`);
          results.push({
            platform,
            success: false,
            error: errorMsg,
          });
        }
      }

      // Update post status based on results
      const hasSuccessfulPublications = results.some((r) => r.success);
      console.log(
        "[Publish API] Publication complete. Success count:",
        results.filter((r) => r.success).length
      );
      console.log("[Publish API] Errors:", errors);

      await supabase
        .from("posts")
        .update({
          status: hasSuccessfulPublications ? "published" : "failed",
          published_at: hasSuccessfulPublications
            ? new Date().toISOString()
            : null,
          error_message: errors.length > 0 ? errors.join("; ") : null,
        })
        .eq("id", postId);
    } else if (post.scheduled_for) {
      // Schedule for later
      for (const platform of platformsToPublish) {
        await supabase.from("scheduling_queue").insert({
          post_id: post.id,
          user_id: user.id,
          platform,
          scheduled_for: post.scheduled_for,
          status: "pending",
        });

        results.push({
          platform,
          success: true,
          scheduled: true,
        });
      }
      // Update post status
      await supabase
        .from("posts")
        .update({ status: "scheduled" })
        .eq("id", postId);
    }

    return NextResponse.json({
      success: results.length > 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Publish API] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Failed to publish post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
