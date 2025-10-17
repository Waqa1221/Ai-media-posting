import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    // Only initialize if we have a valid PostHog key
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
    
    if (!posthogKey || posthogKey === 'your-posthog-key' || posthogKey.trim() === '') {
      console.warn('PostHog not initialized: Missing or invalid NEXT_PUBLIC_POSTHOG_KEY')
      return
    }
    
    posthog.init(posthogKey, {
      api_host: posthogHost,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      disable_session_recording: true, // Disable session recording in development
      opt_out_capturing_by_default: process.env.NODE_ENV === 'development', // Opt out in development
    })
  }
}

export { posthog }
export { PostHogProvider }