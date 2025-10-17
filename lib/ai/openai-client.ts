import OpenAI from "openai";
import { AI_CONFIG } from "./config";

class OpenAIClient {
  private client: OpenAI | null = null;
  private static instance: OpenAIClient;

  private constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.warn(
        "OpenAI API key not found. AI generation will use fallback responses."
      );
    }
  }

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  async generateContent(
    prompt: string,
    model: string = AI_CONFIG.models.primary
  ) {
    if (!this.client || !process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      // Only use JSON response format for models that support it
      const supportsJsonMode = [
        "gpt-4-turbo-preview",
        "gpt-3.5-turbo-0125",
        "gpt-4-1106-preview",
        "gpt-3.5-turbo-1106",
      ].includes(model);

      const requestOptions: any = {
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert social media content creator. Generate engaging, platform-optimized content that drives engagement and conversions." +
              (supportsJsonMode
                ? " Respond with valid JSON containing caption, hashtags, and platform fields."
                : ""),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: AI_CONFIG.limits.maxTokens,
        temperature: AI_CONFIG.limits.temperature,
      };

      if (supportsJsonMode) {
        requestOptions.response_format = { type: "json_object" };
      }

      const response = await this.client.chat.completions.create({
        ...requestOptions,
      });

      return {
        content: response.choices[0]?.message?.content || "",
        tokensUsed: response.usage?.total_tokens || 0,
        model: response.model,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  async generateImages(prompt: string, count: number = 2): Promise<string[]> {
    if (!this.client || !process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const response = await this.client.images.generate({
        model: "dall-e-2",
        prompt: prompt,
        n: Math.min(count, 4),
        size: "1024x1024",
      });

      return (response.data || [])
        .map((image) => image.url)
        .filter((url): url is string => url !== null && url !== undefined);
    } catch (error) {
      console.error("OpenAI image generation error:", error);
      // Return placeholder images on error
      return [
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1024&h=1024&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop",
      ];
    }
  }
  async moderateContent(text: string) {
    if (!this.client || !process.env.OPENAI_API_KEY) {
      return {
        flagged: false,
        categories: [],
        confidence: 0,
      };
    }

    try {
      const response = await this.client.moderations.create({
        input: text,
      });

      const result = response.results[0];
      return {
        flagged: result.flagged,
        categories: Object.entries(result.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category]) => category),
        confidence: Math.max(...Object.values(result.category_scores)),
      };
    } catch (error) {
      console.error("OpenAI moderation error:", error);
      return {
        flagged: false,
        categories: [],
        confidence: 0,
      };
    }
  }

  async optimizeContent(prompt: string, model: string = "gpt-3.5-turbo") {
    if (!this.client || !process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a social media optimization expert. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      return {
        content: completion.choices[0]?.message?.content || "",
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model,
      };
    } catch (error) {
      console.error("OpenAI optimization error:", error);
      throw error;
    }
  }
}

export const openaiClient = OpenAIClient.getInstance();
