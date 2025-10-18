import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { TwitterPlatform } from "@/lib/social/platforms/twitter";

export async function POST(req: Request) {
  try {
    console.log("[Twitter Publish] Request received");
    const {
      content,
      mediaUrls = [],
      isThread = false,
      threadContent = [],
    } = await req.json();

    console.log("[Twitter Publish] Content length:", content?.length);
    console.log("[Twitter Publish] Media count:", mediaUrls?.length);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Twitter Publish] Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Twitter Publish] User authenticated:", user.id);

    // Get Twitter account
    console.log("[Twitter Publish] Looking for Twitter account...");
    const { data: account, error: accountError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", "twitter")
      .eq("is_active", true)
      .single();

    if (accountError || !account) {
      console.error("[Twitter Publish] No account found:", accountError);
      return NextResponse.json(
        {
          success: false,
          error:
            "No Twitter account connected. Please connect your Twitter account in Social Accounts settings.",
        },
        { status: 400 }
      );
    }

    console.log("[Twitter Publish] Account found:", {
      id: account.id,
      username: account.username,
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
    });

    // Validate content
    if (isThread) {
      if (!threadContent || threadContent.length === 0) {
        return NextResponse.json(
          {
            error: "Thread content is required for thread posts",
          },
          { status: 400 }
        );
      }

      for (let i = 0; i < threadContent.length; i++) {
        if (threadContent[i].length > 280) {
          return NextResponse.json(
            {
              error: `Tweet ${i + 1} in thread exceeds 280 character limit`,
            },
            { status: 400 }
          );
        }
      }
    } else {
      if (content.length > 280) {
        return NextResponse.json(
          {
            error: "Tweet content exceeds 280 character limit",
          },
          { status: 400 }
        );
      }
    }

    if (mediaUrls.length > 4) {
      return NextResponse.json(
        {
          error: "Twitter supports maximum 4 media files per tweet",
        },
        { status: 400 }
      );
    }

    // Create Twitter platform instance
    console.log("[Twitter Publish] Creating Twitter client...");
    const twitter = new TwitterPlatform(
      account.access_token,
      account.refresh_token || ""
    );

    // Validate connection before publishing
    console.log("[Twitter Publish] Validating connection...");
    const isValid = await twitter.validateConnection();
    if (!isValid) {
      console.error("[Twitter Publish] Connection validation failed");
      return NextResponse.json(
        {
          success: false,
          error:
            "Twitter connection is invalid. Please reconnect your account.",
        },
        { status: 401 }
      );
    }

    console.log("[Twitter Publish] Connection validated successfully");

    // Publish content
    console.log("[Twitter Publish] Publishing content...");
    let result;
    if (isThread) {
      console.log("[Twitter Publish] Publishing as thread");
      result = await twitter.publishThread(threadContent, mediaUrls);
    } else {
      console.log("[Twitter Publish] Publishing as single tweet");
      result = await twitter.publishPost(content, mediaUrls);
    }

    console.log("[Twitter Publish] Result:", result);

    if (result.success) {
      console.log(
        "[Twitter Publish] SUCCESS! Tweet ID:",
        result.platformPostId
      );
      console.log("[Twitter Publish] Tweet URL:", result.url);
      return NextResponse.json({
        success: true,
        platformPostId: result.platformPostId,
        url: result.url,
        message: `${isThread ? "Thread" : "Tweet"} published successfully!`,
        metadata: result.metadata || {},
      });
    } else {
      console.error("[Twitter Publish] FAILED:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to publish to Twitter",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[Twitter Publish] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to publish to Twitter",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
