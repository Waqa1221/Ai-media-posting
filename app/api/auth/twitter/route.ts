// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import { cookies } from "next/headers";
// import crypto from "crypto";

// function generateCodeVerifier(): string {
//   return crypto.randomBytes(32).toString("base64url");
// }

// function generateCodeChallenge(verifier: string): string {
//   return crypto
//     .createHash("sha256")
//     .update(verifier)
//     .digest()
//     .toString("base64url");
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams, origin, hostname } = new URL(req.url);
//     const code = searchParams.get("code");
//     const error = searchParams.get("error");

//     // Check environment variables
//     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
//     const clientId = process.env.TWITTER_CLIENT_ID;
//     const clientSecret = process.env.TWITTER_CLIENT_SECRET;

//     if (!siteUrl || !clientId || !clientSecret) {
//       console.error("❌ Missing environment variables");
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_config&message=${encodeURIComponent(
//             "Configuration error. Please contact support."
//           )}`,
//           siteUrl || "https://mntomfordigitalllc.com"
//         )
//       );
//     }

//     const cookieStore = cookies();
//     const supabase = createClient(cookieStore);

//     // Handle OAuth errors from Twitter
//     if (error) {
//       console.error("❌ Twitter OAuth error:", error);
//       return NextResponse.redirect(
//         new URL(`/dashboard/social-accounts?error=twitter_${error}`, siteUrl)
//       );
//     }

//     // Step 1: Start OAuth - no code yet
//     if (!code) {
//       const {
//         data: { user },
//         error: authError,
//       } = await supabase.auth.getUser();

//       if (authError || !user) {
//         console.error("❌ No user session");
//         return NextResponse.redirect(
//           new URL(
//             `/auth/signin?redirect=${encodeURIComponent(req.url)}`,
//             siteUrl
//           )
//         );
//       }

//       const redirectUri = `${siteUrl}/api/auth/twitter`;
//       const scope = "tweet.read tweet.write users.read offline.access";

//       const codeVerifier = generateCodeVerifier();
//       const codeChallenge = generateCodeChallenge(codeVerifier);

//       const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
//         redirectUri
//       )}&scope=${encodeURIComponent(scope)}&state=${
//         user.id
//       }&code_challenge=${codeChallenge}&code_challenge_method=S256`;

//       const response = NextResponse.redirect(authUrl);

//       // Set cookies with secure flags for production
//       response.cookies.set("twitter_code_verifier", codeVerifier, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         maxAge: 600,
//         path: "/",
//       });

//       response.cookies.set("twitter_oauth_state", user.id, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         maxAge: 600,
//         path: "/",
//       });

//       return response;
//     }

//     // Step 2: Handle callback from Twitter
//     const storedState = cookieStore.get("twitter_oauth_state")?.value;
//     const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

//     if (!storedState || !codeVerifier) {
//       console.error("❌ Missing OAuth session data");
//       return NextResponse.redirect(
//         new URL(`/dashboard/social-accounts?error=twitter_session`, siteUrl)
//       );
//     }

//     // Exchange code for tokens
//     const tokenParams = new URLSearchParams({
//       grant_type: "authorization_code",
//       code: code,
//       redirect_uri: `${siteUrl}/api/auth/twitter`,
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

//     if (!tokenResponse.ok) {
//       console.error("❌ Token exchange failed");
//       return NextResponse.redirect(
//         new URL(`/dashboard/social-accounts?error=twitter_token`, siteUrl)
//       );
//     }

//     const tokenData = JSON.parse(responseText);

//     // Get user profile
//     const profileResponse = await fetch(
//       "https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified,username,name",
//       {
//         headers: {
//           Authorization: `Bearer ${tokenData.access_token}`,
//         },
//       }
//     );

//     if (!profileResponse.ok) {
//       console.error("❌ Profile fetch failed");
//       return NextResponse.redirect(
//         new URL(`/dashboard/social-accounts?error=twitter_profile`, siteUrl)
//       );
//     }

//     const profileData = await profileResponse.json();

//     if (!profileData.data) {
//       console.error("❌ No profile data");
//       return NextResponse.redirect(
//         new URL(
//           `/dashboard/social-accounts?error=twitter_profile_data`,
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
//       display_name: profileData.data.name,
//       avatar_url: profileData.data.profile_image_url,
//       access_token: tokenData.access_token,
//       refresh_token: tokenData.refresh_token,
//       expires_at: new Date(
//         Date.now() + tokenData.expires_in * 1000
//       ).toISOString(),
//       is_verified: profileData.data.verified || false,
//       connection_status: "connected",
//     }, {
//       onConflict: 'user_id,platform,platform_user_id'
//     });

//     if (dbError) {
//       console.error("❌ Database error:", dbError);
//       return NextResponse.redirect(
//         new URL(`/dashboard/social-accounts?error=twitter_database`, siteUrl)
//       );
//     }

//     // Success redirect
//     const response = NextResponse.redirect(
//       new URL("/dashboard/social-accounts?connected=twitter", siteUrl)
//     );

//     // Clear cookies
//     response.cookies.set("twitter_code_verifier", "", {
//       maxAge: -1,
//       path: "/",
//     });
//     response.cookies.set("twitter_oauth_state", "", { maxAge: -1, path: "/" });

//     return response;
//   } catch (err) {
//     console.error("💥 Unexpected error:", err);
//     const baseUrl =
//       process.env.NODE_ENV === "production"
//         ? process.env.NEXT_PUBLIC_SITE_URL!
//         : "http://localhost:3000";

//     return NextResponse.redirect(
//       new URL(`/dashboard/social-accounts?error=twitter_general`, baseUrl)
//     );
//   }
// }
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest()
    .toString("base64url");
}

export async function GET(req: Request) {
  try {
    console.log("🔵 Twitter OAuth initiation started");

    // Check environment variables
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://mntomfordigitalllc.com";
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    console.log("🔧 Config check:", {
      hasSiteUrl: !!siteUrl,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      siteUrl,
    });

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

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("👤 User check:", {
      hasUser: !!user,
      userId: user?.id,
      error: authError?.message,
    });

    if (authError || !user) {
      console.error("❌ No user session");
      return NextResponse.redirect(
        new URL(
          `/auth/signin?redirect=${encodeURIComponent(
            "/dashboard/social-accounts"
          )}`,
          siteUrl
        )
      );
    }

    const redirectUri = `${siteUrl}/api/auth/twitter/callback`;
    const scope = "tweet.read tweet.write users.read offline.access";

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&state=${
      user.id
    }&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    console.log("✅ Redirecting to Twitter:", { redirectUri });

    const response = NextResponse.redirect(authUrl);

    // Set cookies with secure flags for production
    response.cookies.set("twitter_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    response.cookies.set("twitter_oauth_state", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("💥 Unexpected error in Twitter OAuth initiation:", err);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://mntomfordigitalllc.com";

    return NextResponse.redirect(
      new URL(
        `/dashboard/social-accounts?error=twitter_general&message=${encodeURIComponent(
          err instanceof Error ? err.message : "Unknown error occurred"
        )}`,
        baseUrl
      )
    );
  }
}
