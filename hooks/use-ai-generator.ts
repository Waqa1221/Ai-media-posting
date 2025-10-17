import { useState, useCallback, useRef, useMemo } from 'react'
import type { ContentBrief, GenerationResult } from '@/lib/ai/types'

export type LoadingStage = 'analyzing' | 'generating' | 'images' | 'optimization' | 'complete'

interface UseAIGeneratorOptions {
  onSuccess?: (result: GenerationResult) => void
  onError?: (error: string) => void
}

interface UseAIGeneratorReturn {
  generateContent: (brief: ContentBrief, model: 'gpt-4' | 'gpt-3.5-turbo') => Promise<void>
  regenerateContent: (brief: ContentBrief, model: 'gpt-4' | 'gpt-3.5-turbo') => Promise<void>
  isGenerating: boolean
  loadingStage: LoadingStage
  lastGeneration: GenerationResult | null
  error: string | null
}

export function useAIGenerator(options: UseAIGeneratorOptions = {}): UseAIGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('analyzing')
  const [lastGeneration, setLastGeneration] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoize the options to prevent infinite re-renders
  const memoizedOptions = useMemo(() => options, [options.onSuccess, options.onError])
  const generateContent = useCallback(async (brief: ContentBrief, model: 'gpt-4' | 'gpt-3.5-turbo') => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      setIsGenerating(true)
      setError(null)
      setLoadingStage('analyzing')

      // Simulate loading stages
      const stageTimeouts = [
        setTimeout(() => setLoadingStage('generating'), 800),
        setTimeout(() => setLoadingStage('images'), 2500),
        setTimeout(() => setLoadingStage('optimization'), 4000)
      ]

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brief,
          model,
        }),
        signal: abortControllerRef.current.signal,
      })

      // Clear timeouts
      stageTimeouts.forEach(timeout => clearTimeout(timeout))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Generation failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      setLoadingStage('complete')
      
      // Small delay to show completion state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLastGeneration(result)
      memoizedOptions.onSuccess?.(result)

    } catch (err: any) {
      // Don't show error for aborted requests
      if (err.name === 'AbortError') {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      memoizedOptions.onError?.(errorMessage)
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }, [memoizedOptions])

  const regenerateContent = useCallback(async (brief: ContentBrief, model: 'gpt-4' | 'gpt-3.5-turbo') => {
    // Clear previous generation before regenerating
    setLastGeneration(null)
    await generateContent(brief, model)
  }, [generateContent])

  return {
    generateContent,
    regenerateContent,
    isGenerating,
    loadingStage,
    lastGeneration,
    error,
  }
}