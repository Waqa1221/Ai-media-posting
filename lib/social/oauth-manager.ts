import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import crypto from "crypto";

export interface OAuthState {
  userId: string;
  platform: string;
  stateToken: string;
  codeVerifier?: string;
  codeChallenge?: string;
  redirectUri: string;
  scopes: string[];
  ipAddress?: string;
  userAgent?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string[];
}

export interface PlatformConfig {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  usePKCE?: boolean;
}

export class OAuthManager {
  private supabase = createClient();

  // Generate secure OAuth state with PKCE support
  async generateState(
    userId: string,
    platform: string,
    redirectUri: string,
    scopes: string[],
    usePKCE: boolean = true,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    stateToken: string;
    codeVerifier?: string;
    codeChallenge?: string;
  }> {
    const stateToken = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    if (usePKCE) {
      codeVerifier = crypto.randomBytes(32).toString("base64url");
      codeChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");
    }

    const { error } = await this.supabase.from("oauth_states").insert({
      user_id: userId,
      platform: platform as any,
      state_token: stateToken,
      code_verifier: codeVerifier,
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
      scopes: scopes,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error("Error saving OAuth state:", error);
      throw new Error("Failed to generate OAuth state");
    }

    return { stateToken, codeVerifier, codeChallenge };
  }

  // Validate OAuth state and return state data
  async validateState(
    stateToken: string,
    platform: string
  ): Promise<OAuthState | null> {
    const { data, error } = await this.supabase
      .from("oauth_states")
      .select("*")
      .eq("state_token", stateToken)
      .eq("platform", platform)
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      console.error("Error validating OAuth state:", error);
      return null;
    }

    // Mark state as completed to prevent reuse
    await this.supabase
      .from("oauth_states")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("state_token", stateToken);

    return {
      userId: data.user_id,
      platform: data.platform,
      stateToken: data.state_token,
      codeVerifier: data.code_verifier,
      codeChallenge: data.code_challenge,
      redirectUri: data.redirect_uri,
      scopes: data.scopes,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
    };
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(
    platform: string,
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<TokenResponse> {
    const { data: platformConfig, error } = await this.supabase
      .from("social_platforms")
      .select("*")
      .eq("platform_name", platform)
      .eq("is_active", true)
      .single();

    if (error || !platformConfig) {
      throw new Error(`Platform ${platform} not found or not active`);
    }

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: platformConfig.client_id,
      client_secret: platformConfig.client_secret,
      code: code,
      redirect_uri: redirectUri,
    });

    if (codeVerifier) {
      tokenParams.append("code_verifier", codeVerifier);
    }

    try {
      const response = await fetch(platformConfig.oauth_token_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: tokenParams.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token exchange failed: ${response.status} ${errorText}`
        );
      }

      const tokenData = await response.json();

      if (tokenData.error) {
        throw new Error(
          `OAuth error: ${tokenData.error_description || tokenData.error}`
        );
      }

      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined;

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        tokenType: tokenData.token_type || "Bearer",
        scope: tokenData.scope ? tokenData.scope.split(" ") : undefined,
      };
    } catch (error) {
      console.error("Token exchange error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to exchange code for token: ${errorMessage}`);
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(
    platform: string,
    refreshToken: string
  ): Promise<TokenResponse> {
    const { data: platformConfig, error } = await this.supabase
      .from("social_platforms")
      .select("*")
      .eq("platform_name", platform)
      .eq("is_active", true)
      .single();

    if (error || !platformConfig) {
      throw new Error(`Platform ${platform} not found or not active`);
    }

    const refreshParams = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: platformConfig.client_id,
      client_secret: platformConfig.client_secret,
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch(platformConfig.oauth_token_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: refreshParams.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token refresh failed: ${response.status} ${errorText}`
        );
      }

      const tokenData = await response.json();

      if (tokenData.error) {
        throw new Error(
          `OAuth refresh error: ${
            tokenData.error_description || tokenData.error
          }`
        );
      }

      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined;

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken, // Some platforms don't return new refresh token
        expiresAt,
        tokenType: tokenData.token_type || "Bearer",
        scope: tokenData.scope ? tokenData.scope.split(" ") : undefined,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to refresh token: ${errorMessage}`);
    }
  }

  // Clean up expired OAuth states (should be called periodically)
  async cleanupExpiredStates(): Promise<number> {
    const { data, error } = await this.supabase
      .from("oauth_states")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("Error cleaning up expired OAuth states:", error);
      return 0;
    }

    return data?.length || 0;
  }

  // Get platform configuration
  async getPlatformConfig(platform: string): Promise<PlatformConfig | null> {
    const { data, error } = await this.supabase
      .from("social_platforms")
      .select("*")
      .eq("platform_name", platform)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      clientId: data.client_id,
      clientSecret: data.client_secret,
      authorizeUrl: data.oauth_authorize_url,
      tokenUrl: data.oauth_token_url,
      scopes: data.default_scopes,
      usePKCE: true, // Enable PKCE by default for security
    };
  }
}
