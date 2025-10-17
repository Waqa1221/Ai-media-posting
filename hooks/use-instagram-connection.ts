'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface InstagramAccount {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  account_type?: string
  metadata?: any
}

export function useInstagramConnection() {
  const [account, setAccount] = useState<InstagramAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadAccount = useCallback(async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setAccount(data)
    } catch (error) {
      console.error('Error loading Instagram account:', error)
      setError('Failed to load Instagram account')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadAccount()
  }, [loadAccount])

  const connectAccount = useCallback(async () => {
    try {
      setIsConnecting(true)
      setError(null)

      // Check environment configuration
      const healthResponse = await fetch('/api/health/check-keys')
      const healthData = await healthResponse.json()
      
      if (!healthData.instagram) {
        throw new Error('Instagram integration not configured. Please contact support.')
      }

      // Redirect to Instagram OAuth
      window.location.href = '/api/auth/instagram'
    } catch (error) {
      console.error('Error connecting Instagram:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect Instagram account')
      toast.error('Failed to connect Instagram account')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectAccount = useCallback(async () => {
    if (!account) return

    try {
      const response = await fetch('/api/social/instagram/disconnect', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect account')
      }

      setAccount(null)
      toast.success('Instagram account disconnected')
    } catch (error) {
      console.error('Error disconnecting Instagram:', error)
      toast.error('Failed to disconnect Instagram account')
      throw error
    }
  }, [account])

  const refreshAccount = useCallback(async () => {
    if (!account) return

    try {
      const response = await fetch('/api/social/instagram/refresh', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresReconnection) {
          setAccount(null)
          toast.error('Instagram token expired. Please reconnect your account.')
          return
        }
        throw new Error(data.error || 'Failed to refresh account')
      }

      // Reload account data
      await loadAccount()
      toast.success('Instagram account refreshed')
    } catch (error) {
      console.error('Error refreshing Instagram:', error)
      toast.error('Failed to refresh Instagram account')
      throw error
    }
  }, [account, loadAccount])

  const publishPost = useCallback(async (postData: {
    content: string
    mediaUrls: string[]
    hashtags?: string[]
    location?: string
    postType?: string
  }) => {
    if (!account) {
      throw new Error('No Instagram account connected')
    }

    try {
      const response = await fetch('/api/social/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish to Instagram')
      }

      return result
    } catch (error) {
      console.error('Error publishing to Instagram:', error)
      throw error
    }
  }, [account])

  const getAnalytics = useCallback(async (postId?: string, timeframe: string = '7d') => {
    if (!account) {
      throw new Error('No Instagram account connected')
    }

    try {
      const params = new URLSearchParams({ timeframe })
      if (postId) params.set('postId', postId)

      const response = await fetch(`/api/social/instagram/analytics?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      return data
    } catch (error) {
      console.error('Error fetching Instagram analytics:', error)
      throw error
    }
  }, [account])

  return {
    account,
    isLoading,
    isConnecting,
    error,
    connectAccount,
    disconnectAccount,
    refreshAccount,
    publishPost,
    getAnalytics,
    reload: loadAccount
  }
}