import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TwitterApi } from "twitter-api-v2";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Twitter account from database
    const { data: account, error: accountError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", "twitter")
      .eq("is_active", true)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        {
          error: "No Twitter account found",
          details: accountError,
        },
        { status: 400 }
      );
    }

    // Log what we have
    const debug = {
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      accessTokenLength: account.access_token?.length || 0,
      refreshTokenLength: account.refresh_token?.length || 0,
      accessTokenStart: account.access_token?.substring(0, 10) || "",
      refreshTokenStart: account.refresh_token?.substring(0, 10) || "",
      username: account.username,
      platform_user_id: account.platform_user_id,
      hasAppKey: !!process.env.TWITTER_API_KEY,
      hasAppSecret: !!process.env.TWITTER_API_SECRET,
    };

    // Try to create client and validate
    try {
      const twitter = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: account.access_token,
        accessSecret: account.refresh_token || "",
      });

      // Test the connection
      const me = await twitter.v2.me();

      return NextResponse.json({
        status: "success",
        debug,
        twitterMe: {
          id: me.data.id,
          username: me.data.username,
          name: me.data.name,
        },
        message: "Connection validated! Ready to publish.",
      });
    } catch (twitterError: any) {
      return NextResponse.json(
        {
          status: "twitter_error",
          debug,
          error: twitterError.message,
          code: twitterError.code,
          data: twitterError.data,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Fatal error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
