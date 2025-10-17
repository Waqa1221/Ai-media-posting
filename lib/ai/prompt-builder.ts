import { PLATFORM_CONFIGS, TONE_PROMPTS } from './config'
import type { ContentBrief } from './types'

class PromptBuilder {
  private static instance: PromptBuilder

  static getInstance(): PromptBuilder {
    if (!PromptBuilder.instance) {
      PromptBuilder.instance = new PromptBuilder()
    }
    return PromptBuilder.instance
  }

  buildPrompt(brief: ContentBrief): string {
    const platformConfig = PLATFORM_CONFIGS[brief.platform]
    const tonePrompt = TONE_PROMPTS[brief.tone]

    return `
Create engaging social media content for ${brief.platform} with the following requirements:

INDUSTRY: ${brief.industry}
TONE: ${brief.tone} - ${tonePrompt}
KEYWORDS: ${brief.keywords.join(', ')}
${brief.targetAudience ? `TARGET AUDIENCE: ${brief.targetAudience}` : ''}
${brief.brandVoice ? `BRAND VOICE: ${brief.brandVoice}` : ''}

PLATFORM CONSTRAINTS:
- Maximum caption length: ${platformConfig.maxCaptionLength} characters
- Maximum hashtags: ${platformConfig.maxHashtags}
- Optimal posting times: ${platformConfig.optimalTimes.join(', ')}
- Content types: ${platformConfig.contentTypes.join(', ')}

REQUIREMENTS:
1. Create a compelling caption that incorporates the keywords naturally
2. Generate relevant hashtags (mix of popular and niche)
3. Suggest an image prompt for visual content creation
4. Recommend optimal posting time from the available options
5. Include a call-to-action if appropriate
6. Ensure content aligns with the specified tone and industry

OUTPUT FORMAT (JSON):
{
  "caption": "Engaging caption text that tells a story and includes keywords",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "image_prompt": "Detailed description for image generation",
  "optimal_time": "HH:MM",
  "cta": "Learn more" | "Shop now" | "Sign up" | "Contact us" | null,
  "engagement_hooks": ["Hook 1", "Hook 2"],
  "content_pillars": ["Pillar 1", "Pillar 2"]
}

Make the content authentic, valuable, and platform-optimized for maximum engagement.
    `.trim()
  }

  buildImagePrompt(brief: ContentBrief, caption: string): string {
    return `
Create a professional, high-quality image for ${brief.platform} social media post.

Content context: "${caption}"
Industry: ${brief.industry}
Platform: ${brief.platform}
Tone: ${brief.tone}

Requirements:
- High resolution (1024x1024)
- Professional and visually appealing
- Platform-appropriate style for ${brief.platform}
- Brand-safe and engaging
- Modern, clean design
- Relevant to ${brief.industry} industry

Create an image that supports the message and encourages engagement while being scroll-stopping and shareable.
    `.trim()
  }

  buildHashtagPrompt(brief: ContentBrief): string {
    return `
Generate ${PLATFORM_CONFIGS[brief.platform].maxHashtags} relevant hashtags for ${brief.platform} content about ${brief.industry}.

Include:
- 3-5 popular hashtags (high volume)
- 5-10 medium hashtags (moderate competition)
- 5-10 niche hashtags (low competition, high relevance)
- Industry-specific hashtags
- Keywords: ${brief.keywords.join(', ')}

Return as JSON array: ["hashtag1", "hashtag2", ...]
    `.trim()
  }
}

export const promptBuilder = PromptBuilder.getInstance()