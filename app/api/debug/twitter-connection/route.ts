import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { TwitterApi } from "twitter-api-v2";

interface DebugInfo {
  timestamp: string;
  environment: string;
  checks: {
    environmentVariables?: any;
    apiConnectivity?: any;
    clientInitialization?: any;
    callbackUrl?: any;
    database?: any;
    socialAccountsTable?: any;
    sslConfiguration?: any;
  };
  errors: string[];
  recommendations: string[];
}

/**
 * Twitter Connection Debug Endpoint
 * Comprehensive debugging for Twitter API authentication issues
 */
export async function GET(req: Request) {
  const debugInfo: DebugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
    errors: [],
    recommendations: [],
  };

  try {
    // 1. Environment Variables Check
    debugInfo.checks.environmentVariables = {
      TWITTER_API_KEY: {
        present: !!process.env.TWITTER_API_KEY,
        length: process.env.TWITTER_API_KEY?.length || 0,
        isPlaceholder: process.env.TWITTER_API_KEY === "your_twitter_api_key",
      },
      TWITTER_API_SECRET: {
        present: !!process.env.TWITTER_API_SECRET,
        length: process.env.TWITTER_API_SECRET?.length || 0,
        isPlaceholder:
          process.env.TWITTER_API_SECRET === "your_twitter_api_secret",
      },
      TWITTER_BEARER_TOKEN: {
        present: !!process.env.TWITTER_BEARER_TOKEN,
        length: process.env.TWITTER_BEARER_TOKEN?.length || 0,
        isPlaceholder:
          process.env.TWITTER_BEARER_TOKEN === "your_twitter_bearer_token",
      },
      NEXT_PUBLIC_SITE_URL: {
        present: !!process.env.NEXT_PUBLIC_SITE_URL,
        value: process.env.NEXT_PUBLIC_SITE_URL,
        isProduction: process.env.NEXT_PUBLIC_SITE_URL?.includes(
          "mntomfordigitalllc.com"
        ),
      },
    };

    // 2. Twitter API Connectivity Test
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
      try {
        const twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY,
          appSecret: process.env.TWITTER_API_SECRET,
        });

        // Test basic connectivity with app-only auth
        if (process.env.TWITTER_BEARER_TOKEN) {
          const appOnlyClient = new TwitterApi(
            process.env.TWITTER_BEARER_TOKEN
          );
          const testResponse = await appOnlyClient.v2.me();

          debugInfo.checks.apiConnectivity = {
            success: false,
            error: "App-only auth cannot access user context",
            note: "This is expected - we need user tokens for profile access",
          };
        }

        debugInfo.checks.clientInitialization = {
          success: true,
          message: "Twitter client initialized successfully",
        };
      } catch (error) {
        let errorMessage = "Unknown error";
        let errorCode = undefined;
        if (typeof error === "object" && error !== null && "message" in error) {
          errorMessage = String((error as { message?: string }).message);
        }
        if (typeof error === "object" && error !== null && "code" in error) {
          errorCode = (error as { code?: string | number }).code;
        }
        debugInfo.checks.apiConnectivity = {
          success: false,
          error: errorMessage,
          code: errorCode,
        };
        debugInfo.errors.push(`API connectivity failed: ${errorMessage}`);
      }
    }

    // 3. Callback URL Validation
    const expectedCallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/twitter`;
    debugInfo.checks.callbackUrl = {
      expected: expectedCallbackUrl,
      isHttps: expectedCallbackUrl.startsWith("https://"),
      domain: new URL(expectedCallbackUrl).hostname,
      isProduction: expectedCallbackUrl.includes("mntomfordigitalllc.com"),
    };

    // 4. Database Connection Test
    try {
      // Get cookies and create Supabase client
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      debugInfo.checks.database = {
        connected: true,
        hasUser: !!user,
        userId: user?.id,
      };

      if (user) {
        // Test social accounts table access
        const { data: accounts, error } = await supabase
          .from("social_accounts")
          .select("id, platform")
          .eq("user_id", user.id)
          .limit(1);

        debugInfo.checks.socialAccountsTable = {
          accessible: !error,
          error: error?.message,
          accountCount: accounts?.length || 0,
        };
      }
    } catch (error) {
      let errorMessage = "Unknown error";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      debugInfo.checks.database = {
        connected: false,
        error: errorMessage,
      };
      debugInfo.errors.push(`Database connection failed: ${errorMessage}`);
    }

    // 5. SSL/TLS Configuration Check (Production)
    if (process.env.NODE_ENV === "production") {
      try {
        const sslTest = await fetch("https://api.twitter.com/2/", {
          method: "HEAD",
        });

        debugInfo.checks.sslConfiguration = {
          canConnectToTwitter: sslTest.status !== 0,
          status: sslTest.status,
          statusText: sslTest.statusText,
        };
      } catch (error) {
        let errorMessage = "Unknown error";
        if (typeof error === "object" && error !== null && "message" in error) {
          errorMessage = String((error as { message?: string }).message);
        }
        debugInfo.checks.sslConfiguration = {
          canConnectToTwitter: false,
          error: errorMessage,
        };
        debugInfo.errors.push(`SSL/Network issue: ${errorMessage}`);
      }
    }

    // 6. Generate Recommendations
    if (debugInfo.checks.environmentVariables?.TWITTER_API_KEY?.isPlaceholder) {
      debugInfo.recommendations.push(
        "Replace placeholder Twitter API credentials with actual values from developer.twitter.com"
      );
    }

    if (
      !debugInfo.checks.environmentVariables?.TWITTER_BEARER_TOKEN?.present &&
      process.env.NODE_ENV === "production"
    ) {
      debugInfo.recommendations.push(
        "Add TWITTER_BEARER_TOKEN for production environment - required for some API operations"
      );
    }

    if (
      !debugInfo.checks.callbackUrl?.isHttps &&
      process.env.NODE_ENV === "production"
    ) {
      debugInfo.recommendations.push(
        "Ensure callback URL uses HTTPS in production"
      );
    }

    if (debugInfo.checks.environmentVariables?.TWITTER_API_KEY?.length < 20) {
      debugInfo.recommendations.push(
        "Twitter API Key appears too short - verify you copied the complete key"
      );
    }

    if (
      debugInfo.checks.environmentVariables?.TWITTER_API_SECRET?.length < 40
    ) {
      debugInfo.recommendations.push(
        "Twitter API Secret appears too short - verify you copied the complete secret"
      );
    }

    // 7. Production-specific checks
    if (process.env.NODE_ENV === "production") {
      if (!process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")) {
        debugInfo.errors.push(
          "NEXT_PUBLIC_SITE_URL must use HTTPS in production"
        );
        debugInfo.recommendations.push(
          "Update NEXT_PUBLIC_SITE_URL to use https:// protocol"
        );
      }

      if (process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) {
        debugInfo.errors.push(
          "NEXT_PUBLIC_SITE_URL still points to localhost in production"
        );
        debugInfo.recommendations.push(
          "Update NEXT_PUBLIC_SITE_URL to your production domain"
        );
      }
    }

    return NextResponse.json({
      success: debugInfo.errors.length === 0,
      debugInfo,
      summary: {
        totalChecks: Object.keys(debugInfo.checks).length,
        passedChecks: Object.values(debugInfo.checks).filter(
          (check) =>
            typeof check === "object" &&
            (check.success || check.connected || check.accessible)
        ).length,
        errorCount: debugInfo.errors.length,
        recommendationCount: debugInfo.recommendations.length,
      },
    });
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorCode: string | number | undefined = undefined;
    let errorDetails: any = undefined;
    if (typeof error === "object" && error !== null) {
      if ("message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      if ("code" in error) {
        errorCode = (error as { code?: string | number }).code;
      }
      if ("data" in error) {
        errorDetails = (error as { data?: any }).data;
      }
    }
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { testType } = await req.json();

    // Get cookies and create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (testType) {
      case "profile_fetch":
        return await testProfileFetch(user.id, cookieStore);
      case "token_validation":
        return await testTokenValidation(user.id, cookieStore);
      case "api_permissions":
        return await testApiPermissions(user.id, cookieStore);
      default:
        return NextResponse.json(
          { error: "Invalid test type" },
          { status: 400 }
        );
    }
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorCode: string | number | undefined = undefined;
    let errorDetails: any = undefined;
    if (typeof error === "object" && error !== null) {
      if ("message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      if ("code" in error) {
        errorCode = (error as { code?: string | number }).code;
      }
      if ("data" in error) {
        errorDetails = (error as { data?: any }).data;
      }
    }
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}

async function testProfileFetch(userId: string, cookieStore: any) {
  try {
    const supabase = createClient(cookieStore);

    // Get user's Twitter account
    const { data: account, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "twitter")
      .eq("is_active", true)
      .single();

    if (error || !account) {
      return NextResponse.json({
        success: false,
        error: "No Twitter account found for user",
      });
    }

    // Test profile fetch
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: account.access_token,
      accessSecret: account.refresh_token,
    });

    const profile = await twitterClient.v2.me({
      "user.fields": ["profile_image_url", "public_metrics", "verified"],
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.data.id,
        username: profile.data.username,
        name: profile.data.name,
        verified: profile.data.verified,
        followers: profile.data.public_metrics?.followers_count,
      },
      message: "Profile fetch test successful",
    });
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorCode: string | number | undefined = undefined;
    let errorDetails: any = undefined;
    if (typeof error === "object" && error !== null) {
      if ("message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      if ("code" in error) {
        errorCode = (error as { code?: string | number }).code;
      }
      if ("data" in error) {
        errorDetails = (error as { data?: any }).data;
      }
    }
    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: errorCode,
      details: errorDetails,
    });
  }
}

async function testTokenValidation(userId: string, cookieStore: any) {
  try {
    const supabase = createClient(cookieStore);

    const { data: account, error } = await supabase
      .from("social_accounts")
      .select("access_token, refresh_token, created_at")
      .eq("user_id", userId)
      .eq("platform", "twitter")
      .eq("is_active", true)
      .single();

    if (error || !account) {
      return NextResponse.json({
        success: false,
        error: "No Twitter account found",
      });
    }

    // Test token validity
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: account.access_token,
      accessSecret: account.refresh_token,
    });

    // Simple API call to test token
    await twitterClient.v1.verifyCredentials();

    return NextResponse.json({
      success: true,
      tokenInfo: {
        hasAccessToken: !!account.access_token,
        hasAccessSecret: !!account.refresh_token,
        accountAge: Math.floor(
          (Date.now() - new Date(account.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
      message: "Token validation successful",
    });
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorCode: string | number | undefined = undefined;
    let errorDetails: any = undefined;
    if (typeof error === "object" && error !== null) {
      if ("message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      if ("code" in error) {
        errorCode = (error as { code?: string | number }).code;
      }
      if ("data" in error) {
        errorDetails = (error as { data?: any }).data;
      }
    }
    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: errorCode,
      details: errorDetails,
      recommendation:
        errorCode === 89
          ? "Token expired - user needs to reconnect"
          : "Check API credentials",
    });
  }
}

async function testApiPermissions(userId: string, cookieStore: any) {
  try {
    const supabase = createClient(cookieStore);

    const { data: account, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "twitter")
      .eq("is_active", true)
      .single();

    if (error || !account) {
      return NextResponse.json({
        success: false,
        error: "No Twitter account found",
      });
    }

    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: account.access_token,
      accessSecret: account.refresh_token,
    });

    const permissions = {
      canReadProfile: false,
      canTweet: false,
      canReadTweets: false,
      canUploadMedia: false,
    };

    // Test profile read
    try {
      await twitterClient.v2.me();
      permissions.canReadProfile = true;
    } catch (error) {
      let errorMessage = "Unknown error";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      console.warn("Cannot read profile:", errorMessage);
    }

    // Test tweet read
    try {
      await twitterClient.v2.userTimeline(account.platform_user_id, {
        max_results: 5,
      });
      permissions.canReadTweets = true;
    } catch (error) {
      let errorMessage = "Unknown error";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      console.warn("Cannot read tweets:", errorMessage);
    }

    return NextResponse.json({
      success: true,
      permissions,
      message: "Permission test completed",
    });
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorCode: string | number | undefined = undefined;
    let errorDetails: any = undefined;
    if (typeof error === "object" && error !== null) {
      if ("message" in error) {
        errorMessage = String((error as { message?: string }).message);
      }
      if ("code" in error) {
        errorCode = (error as { code?: string | number }).code;
      }
      if ("data" in error) {
        errorDetails = (error as { data?: any }).data;
      }
    }
    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: errorCode,
      details: errorDetails,
    });
  }
}
