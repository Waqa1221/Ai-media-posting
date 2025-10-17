import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { generateAIContent } from "@/lib/queue/client";

export async function POST(req: Request) {
  try {
    const onboardingData = await req.json();

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

    // Generate content suggestions based on onboarding data
    const suggestions = [];

    // Generate sample posts
    if (onboardingData.businessInfo && onboardingData.brandVoice) {
      const prompt = `Create 3 social media post ideas for a ${
        onboardingData.businessInfo.industry
      } company called ${onboardingData.businessInfo.companyName}. 
      Target audience: ${
        onboardingData.audience?.primaryAgeRange
      } interested in ${onboardingData.audience?.interests
        ?.slice(0, 3)
        .join(", ")}.
      Brand voice: ${
        onboardingData.brandVoice.tone > 50 ? "casual" : "formal"
      } and ${
        onboardingData.brandVoice.personality > 50 ? "humorous" : "serious"
      }.
      Content types: ${onboardingData.brandVoice.contentTypes?.join(", ")}.`;

      // Queue AI generation job
      await generateAIContent({
        userId: user.id,
        type: "text",
        prompt,
        model: "gpt-3.5-turbo",
      });

      suggestions.push({
        type: "posts",
        count: 3,
        status: "generating",
      });
    }

    // Generate hashtag suggestions
    if (onboardingData.businessInfo && onboardingData.audience) {
      const hashtagPrompt = `Generate 10 relevant hashtags for a ${
        onboardingData.businessInfo.industry
      } business targeting ${
        onboardingData.audience.primaryAgeRange
      } audience interested in ${onboardingData.audience.interests
        ?.slice(0, 5)
        .join(", ")}.`;

      await generateAIContent({
        userId: user.id,
        type: "hashtags",
        prompt: hashtagPrompt,
      });

      suggestions.push({
        type: "hashtags",
        count: 10,
        status: "generating",
      });
    }

    return NextResponse.json({
      success: true,
      suggestions,
      message:
        "AI suggestions are being generated and will appear in your dashboard shortly.",
    });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
