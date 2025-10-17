import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { schedulePost } from "@/lib/queue/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { scheduledFor, platforms } = await req.json();
    const postId = params.id;

    if (!scheduledFor) {
      return NextResponse.json(
        { error: "Scheduled time is required" },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const platformsToSchedule = platforms || post.platforms;

    // Update post status and scheduled time
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        status: "scheduled",
        scheduled_for: scheduledFor,
        platforms: platformsToSchedule,
      })
      .eq("id", postId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    // Clear existing scheduling queue entries for this post
    await supabase.from("scheduling_queue").delete().eq("post_id", postId);

    // Add to scheduling queue for each platform
    const results = [];
    for (const platform of platformsToSchedule) {
      try {
        // Add to BullMQ queue
        await schedulePost({
          postId,
          userId: user.id,
          platform,
          content: post.content,
          mediaUrls: post.media_urls,
          scheduledFor,
        });

        // Add to database queue
        await supabase.from("scheduling_queue").insert({
          post_id: postId,
          user_id: user.id,
          platform,
          scheduled_for: scheduledFor,
          status: "pending",
        });

        results.push({ platform, success: true });
      } catch (error) {
        console.error(`Error scheduling for ${platform}:`, error);
        let errorMessage = "Unknown error";
        if (typeof error === "object" && error !== null && "message" in error) {
          errorMessage = String((error as { message?: string }).message);
        }
        results.push({ platform, success: false, error: errorMessage });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Post scheduled for ${scheduledDate.toLocaleString()}`,
      results,
    });
  } catch (error) {
    console.error("Schedule post API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify post ownership
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, status")
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status !== "scheduled") {
      return NextResponse.json(
        { error: "Only scheduled posts can be unscheduled" },
        { status: 400 }
      );
    }

    // Remove from scheduling queue
    await supabase.from("scheduling_queue").delete().eq("post_id", postId);

    // Update post status to draft
    await supabase
      .from("posts")
      .update({
        status: "draft",
        scheduled_for: null,
      })
      .eq("id", postId);

    return NextResponse.json({
      success: true,
      message: "Post unscheduled successfully",
    });
  } catch (error) {
    console.error("Unschedule post API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
