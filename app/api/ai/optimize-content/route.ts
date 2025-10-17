import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { openaiClient } from "@/lib/ai/openai-client";

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

    const {
      content,
      hashtags = [],
      platforms = [],
      mediaCount = 0,
    } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        enhancedContent: content,
        suggestedHashtags: [],
        improvements: ["OpenAI API key not configured"],
      });
    }

    const platformText =
      platforms.length > 0 ? platforms.join(", ") : "general social media";

    const prompt = `You are a social media content optimization expert.

Analyze and optimize this social media post for ${platformText}:

"${content}"

Current hashtags: ${hashtags.join(", ") || "none"}
Media files: ${mediaCount}

Provide:
1. An enhanced version of the content (maintain the core message but make it more engaging)
2. 3-5 additional relevant hashtags (only suggest NEW ones, not duplicates)
3. 2-3 specific improvements made

Return ONLY valid JSON in this exact format:
{
  "enhancedContent": "improved post text here",
  "suggestedHashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "improvements": ["improvement 1", "improvement 2"]
}

Rules:
- Keep the enhanced content authentic and natural
- Don't add emojis unless the original had them
- Ensure hashtags are relevant and trending
- Keep improvements concise and specific
- Don't repeat existing hashtags`;

    try {
      const result = await openaiClient.optimizeContent(
        prompt,
        "gpt-3.5-turbo"
      );

      if (!result.content) {
        throw new Error("No response from OpenAI");
      }

      const optimizations = JSON.parse(result.content);

      return NextResponse.json({
        ...optimizations,
        tokensUsed: result.tokensUsed || 0,
      });
    } catch (aiError) {
      console.error("AI optimization error:", aiError);
      return NextResponse.json({
        enhancedContent: content,
        suggestedHashtags: [],
        improvements: ["AI optimization unavailable. Using original content."],
        error: "AI service temporarily unavailable",
      });
    }
  } catch (error) {
    console.error("Optimize content API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        enhancedContent: "",
        suggestedHashtags: [],
        improvements: [],
      },
      { status: 500 }
    );
  }
}