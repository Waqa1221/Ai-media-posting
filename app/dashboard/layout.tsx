'use client'

import { useEffect, useState, useCallback, useRef, Suspense, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CircleAlert as AlertCircle } from 'lucide-react'

interface User {
  id: string
  email?: string
  user_metadata?: any
  [key: string]: any
}

function DashboardLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Skeleton className="w-8 h-8 rounded-full mr-2" />
            <Skeleton className="w-24 h-6" />
          </div>
          <div className="flex-1 px-4 py-6 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-10 rounded-md" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:pl-64">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Skeleton className="w-48 h-8" />
        </div>
        <main className="py-6">
          <div className="container max-w-7xl mx-auto py-8 px-4">
            <Skeleton className="w-full h-96" />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const userRef = useRef<User | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const checkUser = useCallback(async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Ensure user profile exists
      try {
        const { ensureUserProfile } = await import('@/lib/supabase/client')
        await ensureUserProfile(user.id, user.email || '', user.user_metadata?.full_name)
      } catch (profileError) {
        console.warn('Failed to ensure user profile exists:', profileError)
      }

      // Only update user state if the user has actually changed
      if (!userRef.current || userRef.current.id !== user.id) {
        userRef.current = user
        setUser(user)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Don't show error for trial column issues, just log them
      if (error instanceof Error && (error.message?.includes('trial_started_at') || error.message?.includes('trial_ends_at'))) {
        console.warn('Trial columns missing, but continuing with auth check')
      } else {
        setError('Authentication error. Please try refreshing the page.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    // Add a small delay to prevent flash of loading state
    const timer = setTimeout(() => {
      checkUser()
    }, 100)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        userRef.current = null
        setUser(null)
        router.push('/')
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Immediately set user to reduce loading time
        userRef.current = session.user
        setUser(session.user)
        setIsLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Handle token refresh silently
        userRef.current = session.user
        setUser(session.user)
      }
    })

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [checkUser, router, supabase])

  if (isLoading) {
    return (
      <DashboardLayoutSkeleton />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<DashboardLayoutSkeleton />}>
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader user={user} />
        <main className="py-6">
          <Suspense fallback={
            <div className="container max-w-7xl mx-auto py-8 px-4">
              <Skeleton className="w-full h-96" />
            </div>
          }>
          {children}
          </Suspense>
        </main>
      </div>
      </Suspense>
    </div>
  )
}