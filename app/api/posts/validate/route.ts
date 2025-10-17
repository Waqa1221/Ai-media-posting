import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlatformFactory } from "@/lib/social/platform-factory";

interface ValidationResults {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  platformChecks: Record<
    string,
    {
      platform: string;
      valid: boolean;
      errors: string[];
      warnings: string[];
    }
  >;
}

export async function POST(req: Request) {
  try {
    const { content, platforms, hashtags, mediaUrls } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validationResults: ValidationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      platformChecks: {},
    };

    // Basic validation
    if (!content?.trim()) {
      validationResults.isValid = false;
      validationResults.errors.push("Content is required");
    }

    if (!platforms || platforms.length === 0) {
      validationResults.isValid = false;
      validationResults.errors.push("At least one platform must be selected");
    }

    // Platform-specific validation
    if (platforms && platforms.length > 0) {
      for (const platform of platforms) {
        const requirements = PlatformFactory.getPlatformRequirements(platform);
        const platformCheck: {
          platform: string;
          valid: boolean;
          errors: string[];
          warnings: string[];
        } = {
          platform,
          valid: true,
          errors: [],
          warnings: [],
        };

        if (requirements) {
          // Check content length
          if (content && content.length > requirements.maxTextLength) {
            platformCheck.valid = false;
            platformCheck.errors.push(
              `Content exceeds ${platform} limit of ${requirements.maxTextLength} characters`
            );
          }

          // Check media requirements
          if (
            requirements.requiresMedia &&
            (!mediaUrls || mediaUrls.length === 0)
          ) {
            platformCheck.valid = false;
            platformCheck.errors.push(
              `${platform} requires at least one media file`
            );
          }

          // Check media count
          if (mediaUrls && mediaUrls.length > requirements.maxMediaCount) {
            platformCheck.valid = false;
            platformCheck.errors.push(
              `Too many media files for ${platform} (max ${requirements.maxMediaCount})`
            );
          }

          // Platform-specific warnings
          if (platform === "instagram" && hashtags && hashtags.length < 5) {
            platformCheck.warnings.push(
              "Instagram posts perform better with 5+ hashtags"
            );
          }

          if (platform === "linkedin" && content && content.length < 150) {
            platformCheck.warnings.push(
              "LinkedIn posts perform better with more detailed content"
            );
          }

          if (platform === "twitter" && content && content.length > 200) {
            platformCheck.warnings.push(
              "Consider breaking long content into a Twitter thread"
            );
          }
        }

        validationResults.platformChecks[platform] = platformCheck;

        if (!platformCheck.valid) {
          validationResults.isValid = false;
          validationResults.errors.push(...platformCheck.errors);
        }

        validationResults.warnings.push(...platformCheck.warnings);
      }
    }

    // Check connected accounts
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("platform")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .in("platform", platforms || []);

    if (accountsError) {
      console.warn("Error checking connected accounts:", accountsError);
      // Continue with validation but note the issue
    }

    const connectedPlatforms =
      connectedAccounts?.map((acc) => acc.platform) || [];
    const missingPlatforms = (platforms || []).filter(
      (p: string) => !connectedPlatforms.includes(p)
    );

    if (missingPlatforms.length > 0) {
      validationResults.isValid = false;
      validationResults.errors.push(
        `Please connect your ${missingPlatforms.join(", ")} account(s) first`
      );
    }

    // Hashtag validation
    if (hashtags && hashtags.length > 30) {
      validationResults.isValid = false;
      validationResults.errors.push("Maximum 30 hashtags allowed");
    }

    return NextResponse.json(validationResults);
  } catch (error) {
    console.error("Post validation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
