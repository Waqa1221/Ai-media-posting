import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FacebookAccount {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  account_type?: string
}

export function useFacebookConnection() {
  const [account, setAccount] = useState<FacebookAccount | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAccount()
  }, [])

  const loadAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'facebook')
        .eq('is_active', true)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setAccount(data)
    } catch (error) {
      console.error('Error loading Facebook account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectAccount = async () => {
    setIsConnecting(true)
    try {
      window.location.href = '/api/social/oauth/initiate?platform=facebook'
    } catch (error) {
      toast.error('Failed to initiate Facebook connection')
      setIsConnecting(false)
    }
  }

  const disconnectAccount = async () => {
    if (!account) return

    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', account.id)

      if (error) throw error

      setAccount(null)
      toast.success('Facebook account disconnected')
    } catch (error) {
      console.error('Error disconnecting Facebook account:', error)
      throw error
    }
  }

  const refreshAccount = async () => {
    try {
      const response = await fetch('/api/social/facebook/refresh', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to refresh Facebook account')
      }

      await loadAccount()
    } catch (error) {
      console.error('Error refreshing Facebook account:', error)
      throw error
    }
  }

  return {
    account,
    isConnecting,
    isLoading,
    connectAccount,
    disconnectAccount,
    refreshAccount,
    reload: loadAccount
  }
}