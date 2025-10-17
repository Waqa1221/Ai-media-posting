// // app/api/auth/twitter/callback/route.ts
// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import { cookies } from "next/headers";

// export async function GET(req: Request) {
//   try {
//     console.log("🌐 Twitter OAuth callback started");

//     const { searchParams } = new URL(req.url);
//     const code = searchParams.get("code");
//     const error = searchParams.get("error");
//     const error_description = searchParams.get("error_description");

//     const siteUrl =
//       process.env.NEXT_PUBLIC_SITE_URL || "https://mntomfordigitalllc.com";
//     const clientId = process.env.TWITTER_CLIENT_ID;
//     const clientSecret = process.env.TWITTER_CLIENT_SECRET;

//     if (!clientId || !clientSecret) {
//       console.error("❌ Missing Twitter API credentials");
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_config&message=${encodeURIComponent(
//             "Twitter API credentials not configured"
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     const cookieStore = cookies();
//     const supabase = createClient(cookieStore);

//     // Handle OAuth errors from Twitter
//     if (error) {
//       console.error("❌ Twitter OAuth error:", error, error_description);
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_${error}&message=${encodeURIComponent(
//             error_description || error
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     if (!code) {
//       console.error("❌ No code parameter in callback");
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_no_code&message=${encodeURIComponent(
//             "Authentication failed: no authorization code received"
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     // Get stored values from cookies
//     const storedState = cookieStore.get("twitter_oauth_state")?.value;
//     const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

//     console.log("📦 Retrieved from cookies:", {
//       hasState: !!storedState,
//       hasVerifier: !!codeVerifier,
//     });

//     if (!storedState || !codeVerifier) {
//       console.error("❌ Missing OAuth session data");
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_session&message=${encodeURIComponent(
//             "Authentication session expired. Please try again."
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     // Exchange code for tokens
//     console.log("🔄 Exchanging code for tokens");

//     const tokenParams = new URLSearchParams({
//       grant_type: "authorization_code",
//       code: code,
//       redirect_uri: `${siteUrl}/api/auth/twitter/callback`,
//       code_verifier: codeVerifier,
//       client_id: clientId,
//     });

//     const tokenResponse = await fetch(
//       "https://api.twitter.com/2/oauth2/token",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization: `Basic ${Buffer.from(
//             `${clientId}:${clientSecret}`
//           ).toString("base64")}`,
//         },
//         body: tokenParams,
//       }
//     );

//     const responseText = await tokenResponse.text();
//     console.log("📊 Token response:", {
//       status: tokenResponse.status,
//       statusText: tokenResponse.statusText,
//     });

//     if (!tokenResponse.ok) {
//       console.error("❌ Token exchange failed:", responseText);
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_token&message=${encodeURIComponent(
//             "Failed to authenticate with Twitter"
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     const tokenData = JSON.parse(responseText);
//     console.log("✅ Token exchange successful");

//     // Get user profile
//     const profileResponse = await fetch(
//       "https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified,username,name,public_metrics,description",
//       {
//         headers: {
//           Authorization: `Bearer ${tokenData.access_token}`,
//         },
//       }
//     );

//     if (!profileResponse.ok) {
//       console.error("❌ Profile fetch failed");
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_profile&message=${encodeURIComponent(
//             "Failed to fetch Twitter profile"
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     const profileData = await profileResponse.json();

//     if (!profileData.data) {
//       console.error("❌ No profile data:", profileData);
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_profile_data&message=${encodeURIComponent(
//             "Twitter profile data is missing"
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     // Save to database
//     const { error: dbError } = await supabase.from("social_accounts").upsert({
//       user_id: storedState,
//       platform: "twitter",
//       platform_user_id: profileData.data.id,
//       username: profileData.data.username,
//       platform_display_name: profileData.data.name,
//       platform_username: profileData.data.username,
//       avatar_url: profileData.data.profile_image_url,
//       access_token: tokenData.access_token,
//       refresh_token: tokenData.refresh_token,
//       token_type: tokenData.token_type,
//       expires_at: new Date(
//         Date.now() + tokenData.expires_in * 1000
//       ).toISOString(),
//       scope: tokenData.scope ? tokenData.scope.split(' ') : [],
//       connection_status: "connected",
//       is_active: true,
//       platform_data: profileData.data,
//       follower_count: profileData.data.public_metrics?.followers_count || 0,
//       following_count: profileData.data.public_metrics?.following_count || 0,
//       posts_count: profileData.data.public_metrics?.tweet_count || 0,
//     }, {
//       onConflict: 'user_id,platform,platform_user_id'
//     });

//     if (dbError) {
//       console.error("❌ Database error:", dbError);
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_database&message=${encodeURIComponent(
//             "Failed to save Twitter account"
//           )}`,
//           siteUrl
//         )
//       );
//     }

//     console.log("✅ Twitter account connected successfully");

//     // Success redirect
//     const response = NextResponse.redirect(
//       new URL(
//         `/dashboard/social-accounts?connected=twitter&message=${encodeURIComponent(
//           `Twitter account @${profileData.data.username} connected successfully!`
//         )}`,
//         siteUrl
//       )
//     );

//     // Clear cookies
//     response.cookies.set("twitter_code_verifier", "", {
//       maxAge: -1,
//       path: "/",
//     });
//     response.cookies.set("twitter_oauth_state", "", { maxAge: -1, path: "/" });

//     return response;
//   } catch (err) {
//     console.error("💥 Unexpected error in callback:", err);
//     const siteUrl =
//       process.env.NEXT_PUBLIC_SITE_URL || "https://mntomfordigitalllc.com";
//     return NextResponse.redirect(
//       new URL(
//         `/dashboard/social-accounts?error=twitter_general&message=${encodeURIComponent(
//           "An unexpected error occurred during authentication"
//         )}`,
//         siteUrl
//       )
//     );
//   }
// }
// app/api/auth/twitter/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    console.log("🌐 Twitter OAuth callback started");

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://mntomfordigitalllc.com";
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("❌ Missing Twitter API credentials");
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_config&message=${encodeURIComponent(
            "Twitter API credentials not configured"
          )}`,
          siteUrl
        )
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Handle OAuth errors from Twitter
    if (error) {
      console.error("❌ Twitter OAuth error:", error, error_description);
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_${error}&message=${encodeURIComponent(
            error_description || error
          )}`,
          siteUrl
        )
      );
    }

    if (!code) {
      console.error("❌ No code parameter in callback");
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_no_code&message=${encodeURIComponent(
            "Authentication failed: no authorization code received"
          )}`,
          siteUrl
        )
      );
    }

    // Get stored values from cookies
    const storedState = cookieStore.get("twitter_oauth_state")?.value;
    const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

    console.log("📦 Retrieved from cookies:", {
      hasState: !!storedState,
      hasVerifier: !!codeVerifier,
    });

    if (!storedState || !codeVerifier) {
      console.error("❌ Missing OAuth session data");
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_session&message=${encodeURIComponent(
            "Authentication session expired. Please try again."
          )}`,
          siteUrl
        )
      );
    }

    // Exchange code for tokens
    console.log("🔄 Exchanging code for tokens");

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: `${siteUrl}/api/auth/twitter/callback`,
      code_verifier: codeVerifier,
      client_id: clientId,
    });

    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
        body: tokenParams,
      }
    );

    const responseText = await tokenResponse.text();
    console.log("📊 Token response:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
    });

    if (!tokenResponse.ok) {
      console.error("❌ Token exchange failed:", responseText);
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_token&message=${encodeURIComponent(
            "Failed to authenticate with Twitter"
          )}`,
          siteUrl
        )
      );
    }

    const tokenData = JSON.parse(responseText);
    console.log("✅ Token exchange successful");

    // Get user profile
    const profileResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified,username,name,public_metrics,description",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      console.error("❌ Profile fetch failed");
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_profile&message=${encodeURIComponent(
            "Failed to fetch Twitter profile"
          )}`,
          siteUrl
        )
      );
    }

    const profileData = await profileResponse.json();

    if (!profileData.data) {
      console.error("❌ No profile data:", profileData);
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_profile_data&message=${encodeURIComponent(
            "Twitter profile data is missing"
          )}`,
          siteUrl
        )
      );
    }

    // Ensure user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", storedState)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("❌ Profile not found:", profileError);
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_profile_missing&message=${encodeURIComponent(
            "User profile not found. Please complete onboarding first."
          )}`,
          siteUrl
        )
      );
    }

    // Save to database
    const { error: dbError } = await supabase.from("social_accounts").upsert(
      {
        user_id: storedState,
        platform: "twitter",
        platform_user_id: profileData.data.id,
        username: profileData.data.username,
        display_name: profileData.data.name,
        avatar_url: profileData.data.profile_image_url,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || "Bearer",
        expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString(),
        connection_status: "connected",
        is_active: true,
        platform_data: profileData.data,
        follower_count: profileData.data.public_metrics?.followers_count || 0,
        following_count: profileData.data.public_metrics?.following_count || 0,
        posts_count: profileData.data.public_metrics?.tweet_count || 0,
      },
      {
        onConflict: "user_id,platform,platform_user_id",
      }
    );

    if (dbError) {
      console.error("❌ Database error:", dbError);
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-accounts?error=twitter_database&message=${encodeURIComponent(
            `Failed to save Twitter account: ${dbError.message}`
          )}`,
          siteUrl
        )
      );
    }

    console.log("✅ Twitter account connected successfully");

    // Success redirect
    const response = NextResponse.redirect(
      new URL(
        `/dashboard/social-accounts?connected=twitter&message=${encodeURIComponent(
          `Twitter account @${profileData.data.username} connected successfully!`
        )}`,
        siteUrl
      )
    );

    // Clear cookies
    response.cookies.set("twitter_code_verifier", "", {
      maxAge: -1,
      path: "/",
    });
    response.cookies.set("twitter_oauth_state", "", { maxAge: -1, path: "/" });

    return response;
  } catch (err) {
    console.error("💥 Unexpected error in callback:", err);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://mntomfordigitalllc.com";
    return NextResponse.redirect(
      new URL(
        `/dashboard/social-accounts?error=twitter_general&message=${encodeURIComponent(
          "An unexpected error occurred during authentication"
        )}`,
        siteUrl
      )
    );
  }
}
