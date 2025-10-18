import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the Twitter account
    const { data: account, error: fetchError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", "twitter")
      .maybeSingle();

    if (fetchError || !account) {
      return NextResponse.json(
        {
          error: "Twitter account not found",
          details: fetchError?.message,
        },
        { status: 404 }
      );
    }

    // Check if tokens are base64 encoded
    const accessToken = account.access_token;
    const refreshToken = account.refresh_token;

    let decodedAccessToken = accessToken;
    let decodedRefreshToken = refreshToken;

    // Try to decode if they look like base64
    try {
      if (accessToken && /^[A-Za-z0-9+/=]+$/.test(accessToken)) {
        const decoded = Buffer.from(accessToken, "base64").toString("utf-8");
        // Check if decoded looks like a valid token (not binary gibberish)
        if (/^[\x20-\x7E]+$/.test(decoded)) {
          decodedAccessToken = decoded;
        }
      }
    } catch (e) {
      // Not base64 or invalid
    }

    try {
      if (refreshToken && /^[A-Za-z0-9+/=]+$/.test(refreshToken)) {
        const decoded = Buffer.from(refreshToken, "base64").toString("utf-8");
        if (/^[\x20-\x7E]+$/.test(decoded)) {
          decodedRefreshToken = decoded;
        }
      }
    } catch (e) {
      // Not base64 or invalid
    }

    // Update if we decoded something
    if (
      decodedAccessToken !== accessToken ||
      decodedRefreshToken !== refreshToken
    ) {
      const { error: updateError } = await supabase
        .from("social_accounts")
        .update({
          access_token: decodedAccessToken,
          refresh_token: decodedRefreshToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", account.id);

      if (updateError) {
        return NextResponse.json(
          {
            error: "Failed to update tokens",
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Tokens decoded and updated",
        accessTokenChanged: decodedAccessToken !== accessToken,
        refreshTokenChanged: decodedRefreshToken !== refreshToken,
        decodedAccessTokenLength: decodedAccessToken.length,
        decodedRefreshTokenLength: decodedRefreshToken?.length || 0,
      });
    }

    return NextResponse.json({
      message: "Tokens don't appear to be base64 encoded",
      recommendation:
        "Please reconnect your Twitter account to get fresh tokens",
      disconnectUrl: "/api/social/twitter/disconnect",
      connectUrl: "/api/auth/twitter",
    });
  } catch (error: any) {
    console.error("Error fixing tokens:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
