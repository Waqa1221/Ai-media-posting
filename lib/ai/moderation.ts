import { openaiClient } from './openai-client'
import { BANNED_KEYWORDS, AI_CONFIG } from './config'
import type { ModerationResult } from './types'

class ContentModerator {
  private static instance: ContentModerator

  static getInstance(): ContentModerator {
    if (!ContentModerator.instance) {
      ContentModerator.instance = new ContentModerator()
    }
    return ContentModerator.instance
  }

  async moderateContent(text: string): Promise<ModerationResult> {
    try {
      // Check banned keywords first
      const keywordCheck = this.checkBannedKeywords(text)
      if (keywordCheck.flagged) {
        return keywordCheck
      }

      // Check for PII
      const piiCheck = this.checkPII(text)
      if (piiCheck.flagged) {
        return piiCheck
      }

      // Use OpenAI moderation if enabled
      if (AI_CONFIG.moderation.enabled) {
        const openaiResult = await openaiClient.moderateContent(text)
        if (openaiResult.flagged && openaiResult.confidence > AI_CONFIG.moderation.threshold) {
          return openaiResult
        }
      }

      return {
        flagged: false,
        categories: [],
        confidence: 0,
      }
    } catch (error) {
      console.error('Content moderation error:', error)
      return {
        flagged: true,
        categories: ['error'],
        confidence: 1,
      }
    }
  }

  private checkBannedKeywords(text: string): ModerationResult {
    const lowerText = text.toLowerCase()
    const foundKeywords = BANNED_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    )

    return {
      flagged: foundKeywords.length > 0,
      categories: foundKeywords.length > 0 ? ['banned_keywords'] : [],
      confidence: foundKeywords.length > 0 ? 1 : 0,
    }
  }

  private checkPII(text: string): ModerationResult {
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    }

    const foundPII = Object.entries(patterns).filter(([_, pattern]) => 
      pattern.test(text)
    )

    return {
      flagged: foundPII.length > 0,
      categories: foundPII.length > 0 ? ['pii'] : [],
      confidence: foundPII.length > 0 ? 1 : 0,
    }
  }

  redactPII(text: string): string {
    const patterns = {
      email: { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
      phone: { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE]' },
      ssn: { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN]' },
      creditCard: { regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CARD]' },
    }

    let redactedText = text
    Object.values(patterns).forEach(({ regex, replacement }) => {
      redactedText = redactedText.replace(regex, replacement)
    })

    return redactedText
  }
}

export const contentModerator = ContentModerator.getInstance()