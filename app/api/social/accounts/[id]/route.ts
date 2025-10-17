import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlatformClientFactory } from "@/lib/social/platform-clients";
import { OAuthManager } from "@/lib/social/oauth-manager";

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

    const { data: account, error } = await supabase
      .from("social_accounts")
      .select(
        `
        *,
        social_platforms!inner(
          display_name,
          description,
          max_post_length,
          supports_media,
          supports_scheduling
        )
      `
      )
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !account) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Social account fetch error:", error);
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

    // Get the account
    const { data: account, error: fetchError } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !account) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    if (action === "refresh_token") {
      if (!account.refresh_token) {
        return NextResponse.json(
          { error: "No refresh token available for this account" },
          { status: 400 }
        );
      }

      try {
        const oauthManager = new OAuthManager();
        const tokenResponse = await oauthManager.refreshAccessToken(
          account.platform,
          account.refresh_token
        );

        // Update account with new tokens
        const { error: updateError } = await supabase
          .from("social_accounts")
          .update({
            access_token: tokenResponse.accessToken,
            refresh_token: tokenResponse.refreshToken || account.refresh_token,
            expires_at: tokenResponse.expiresAt?.toISOString(),
            connection_status: "connected",
            error_message: null,
            error_count: 0,
            last_sync_at: new Date().toISOString(),
          })
          .eq("id", params.id);

        if (updateError) {
          throw new Error("Failed to update account tokens");
        }

        return NextResponse.json({
          message: "Token refreshed successfully",
          expires_at: tokenResponse.expiresAt,
        });
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);

        // Mark account as having token issues
        await supabase
          .from("social_accounts")
          .update({
            connection_status: "error",
            error_message:
              refreshError instanceof Error
                ? refreshError.message
                : "Token refresh failed",
            error_count: (account.error_count || 0) + 1,
            last_error_at: new Date().toISOString(),
          })
          .eq("id", params.id);

        let errorMessage = "Token refresh failed";
        if (
          typeof refreshError === "object" &&
          refreshError !== null &&
          "message" in refreshError
        ) {
          errorMessage = `Token refresh failed: ${(refreshError as { message?: string }).message}`;
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
    }

    if (action === "sync_profile") {
      try {
        const platformClient = PlatformClientFactory.createClient(
          account.platform,
          account.access_token
        );

        const profile = await platformClient.getProfile();

        // Update account with fresh profile data
        const { error: updateError } = await supabase
          .from("social_accounts")
          .update({
            username: profile.username,
            display_name: profile.displayName,
            avatar_url: profile.avatarUrl,
            follower_count: profile.followerCount || 0,
            following_count: profile.followingCount || 0,
            posts_count: profile.postsCount || 0,
            platform_data: profile.platformData || {},
            last_sync_at: new Date().toISOString(),
            connection_status: "connected",
            error_message: null,
            error_count: 0,
          })
          .eq("id", params.id);

        if (updateError) {
          throw new Error("Failed to update profile data");
        }

        return NextResponse.json({
          message: "Profile synced successfully",
          profile,
        });
      } catch (syncError) {
        console.error("Profile sync error:", syncError);

        await supabase
          .from("social_accounts")
          .update({
            connection_status: "error",
            error_message:
              syncError instanceof Error
                ? syncError.message
                : "Profile sync failed",
            error_count: (account.error_count || 0) + 1,
            last_error_at: new Date().toISOString(),
          })
          .eq("id", params.id);

        let errorMessage = "Profile sync failed";
        if (
          typeof syncError === "object" &&
          syncError !== null &&
          "message" in syncError
        ) {
          errorMessage = `Profile sync failed: ${(syncError as { message?: string }).message}`;
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
    }

    // Handle regular updates
    const allowedUpdates = ["is_active", "sync_frequency_hours"];
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

    const { data: updatedAccount, error: updateError } = await supabase
      .from("social_accounts")
      .update(filteredUpdates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update social account" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error("Social account update error:", error);
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
      .from("social_accounts")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting social account:", error);
      return NextResponse.json(
        { error: "Failed to delete social account" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Social account disconnected successfully",
    });
  } catch (error) {
    console.error("Social account deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
