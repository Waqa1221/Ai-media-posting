'use client'

import { useEffect } from 'react'
import { PostHogProvider } from '@/lib/posthog'
import { initPostHog } from '@/lib/posthog'

function PostHogInit() {
  useEffect(() => {
    // Only initialize PostHog if we have a valid key
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (posthogKey && posthogKey !== 'your-posthog-key' && posthogKey.trim() !== '') {
      initPostHog()
    } else {
      console.log('PostHog initialization skipped: Invalid or missing API key')
    }
  }, [])
  return null
}

export default function AgencySetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PostHogInit />
      {children}
    </>
  )
}