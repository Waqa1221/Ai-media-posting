import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    console.log("[Twitter Debug] Checking Twitter connection status...");

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: "User not authenticated",
        details: authError,
      });
    }

    console.log("[Twitter Debug] User ID:", user.id);

    // Check for Twitter account
    const { data: account, error: accountError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", "twitter")
      .maybeSingle();

    const envCheck = {
      TWITTER_API_KEY: !!process.env.TWITTER_API_KEY,
      TWITTER_API_SECRET: !!process.env.TWITTER_API_SECRET,
      TWITTER_BEARER_TOKEN: !!process.env.TWITTER_BEARER_TOKEN,
      TWITTER_CLIENT_ID: !!process.env.TWITTER_CLIENT_ID,
      TWITTER_CLIENT_SECRET: !!process.env.TWITTER_CLIENT_SECRET,
    };

    console.log("[Twitter Debug] Environment variables:", envCheck);

    if (accountError) {
      console.error("[Twitter Debug] Database error:", accountError);
      return NextResponse.json({
        authenticated: true,
        userId: user.id,
        twitterConnected: false,
        error: "Database error checking Twitter account",
        details: accountError,
        envCheck,
      });
    }

    if (!account) {
      console.log("[Twitter Debug] No Twitter account found");
      return NextResponse.json({
        authenticated: true,
        userId: user.id,
        twitterConnected: false,
        message:
          "No Twitter account connected. Please go to Social Accounts page and connect your Twitter account.",
        envCheck,
      });
    }

    console.log("[Twitter Debug] Account found:", {
      id: account.id,
      username: account.username,
      platform_user_id: account.platform_user_id,
      is_active: account.is_active,
    });

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      twitterConnected: true,
      account: {
        id: account.id,
        username: account.username,
        displayName: account.display_name,
        platformUserId: account.platform_user_id,
        isActive: account.is_active,
        isVerified: account.is_verified,
        connectionStatus: account.connection_status,
        lastSyncAt: account.last_sync_at,
        hasAccessToken: !!account.access_token,
        hasRefreshToken: !!account.refresh_token,
        followerCount: account.follower_count,
        followingCount: account.following_count,
        postsCount: account.posts_count,
        errorCount: account.error_count,
        lastError: account.error_message,
      },
      envCheck,
    });
  } catch (error) {
    console.error("[Twitter Debug] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Failed to check Twitter connection",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
