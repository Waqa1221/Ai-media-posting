import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { openaiClient } from "@/lib/ai/openai-client";
import { aiRateLimiter } from "@/lib/ai/rate-limiter";
import { checkUsageLimit } from "@/lib/stripe/server";

export async function POST(req: Request) {
  try {
    // Get cookies and create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, platforms, currentHashtags } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check rate limits
    const rateLimitResult = await aiRateLimiter.checkLimit(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Check usage limits
    try {
      const canGenerate = await checkUsageLimit(
        user.id,
        "ai_generations_per_month",
        supabase
      );
      if (!canGenerate) {
        return NextResponse.json(
          { error: "AI generation limit exceeded. Please upgrade your plan." },
          { status: 429 }
        );
      }
    } catch (limitError) {
      console.warn(
        "Usage limit check failed, proceeding with generation:",
        limitError
      );
    }

    // Create enhancement prompt
    const platformsText =
      platforms?.length > 0 ? platforms.join(", ") : "general social media";
    const currentHashtagsText =
      currentHashtags?.length > 0 ? currentHashtags.join(", ") : "none";

    const prompt = `
Enhance this social media content for ${platformsText} platforms:

Original Content: "${content}"
Current Hashtags: ${currentHashtagsText}

Please provide:
1. Enhanced version of the content (keep the core message but make it more engaging)
2. 5-10 additional relevant hashtags (don't repeat existing ones)
3. Brief explanation of improvements made

Respond in JSON format:
{
  "enhancedContent": "improved content here",
  "suggestedHashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "improvements": "brief explanation of what was improved"
}

Make the content more engaging while keeping it authentic and platform-appropriate.
    `.trim();

    try {
      const result = await openaiClient.generateContent(
        prompt,
        "gpt-3.5-turbo"
      );

      let parsedResult;
      try {
        parsedResult = JSON.parse(result.content);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        parsedResult = {
          enhancedContent: content,
          suggestedHashtags: ["engagement", "socialmedia", "content"],
          improvements: "Content enhancement completed",
        };
      }

      // Store generation record
      await supabase.from("ai_generations").insert({
        user_id: user.id,
        type: "text",
        prompt: prompt,
        result: JSON.stringify(parsedResult),
        tokens_used: result.tokensUsed,
        cost_cents: Math.ceil((result.tokensUsed / 1000) * 0.002 * 100),
        model_used: result.model,
      });

      // Update usage limits
      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_limit_type: "ai_generations_per_month",
      });

      return NextResponse.json({
        enhancedContent: parsedResult.enhancedContent || content,
        suggestedHashtags: parsedResult.suggestedHashtags || [],
        improvements:
          parsedResult.improvements || "Content enhanced successfully",
        tokensUsed: result.tokensUsed,
      });
    } catch (aiError) {
      console.error("AI enhancement failed:", aiError);

      // Return fallback enhancement
      const fallbackHashtags = platforms?.includes("instagram")
        ? ["instagram", "content", "engagement", "social"]
        : platforms?.includes("linkedin")
        ? ["linkedin", "professional", "business", "networking"]
        : ["socialmedia", "content", "engagement"];

      return NextResponse.json({
        enhancedContent: content,
        suggestedHashtags: fallbackHashtags.filter(
          (tag) => !currentHashtags?.includes(tag)
        ),
        improvements: "Basic hashtag suggestions provided",
        tokensUsed: 0,
      });
    }
  } catch (error) {
    console.error("Content enhancement API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
