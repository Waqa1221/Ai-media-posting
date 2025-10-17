import { NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'

/**
 * Twitter API Health Check Endpoint
 * Tests Twitter API configuration and connectivity with enhanced debugging
 */
export async function GET() {
  const debugLog = []
  
  try {
    debugLog.push('Starting Twitter health check')
    
    // Check environment variables
    const apiKey = process.env.TWITTER_API_KEY
    const apiSecret = process.env.TWITTER_API_SECRET
    const bearerToken = process.env.TWITTER_BEARER_TOKEN
    
    debugLog.push(`Environment check: API Key ${apiKey ? 'present' : 'missing'}, API Secret ${apiSecret ? 'present' : 'missing'}, Bearer Token ${bearerToken ? 'present' : 'missing'}`)
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Twitter API credentials not configured',
        debugLog,
        instructions: [
          'Add TWITTER_API_KEY to your environment variables',
          'Add TWITTER_API_SECRET to your environment variables',
          'Add TWITTER_BEARER_TOKEN to your environment variables (recommended for production)',
          'Get credentials from developer.twitter.com',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Check for placeholder values
    if (apiKey === 'your_twitter_api_key' || apiSecret === 'your_twitter_api_secret') {
      return NextResponse.json({
        success: false,
        error: 'PLACEHOLDER_CREDENTIALS',
        message: 'Twitter API credentials are using placeholder values',
        debugLog,
        instructions: [
          'Replace placeholder values with actual Twitter app credentials',
          'Get credentials from developer.twitter.com',
          'Create a Twitter app and get API Key and Secret',
          'Update your .env.local file',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Validate credential format
    if (apiKey.length < 20 || apiSecret.length < 40) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Twitter API credentials appear to be invalid',
        debugLog,
        instructions: [
          'Verify your Twitter API Key from the Twitter Developer Console',
          'API Key should be ~25 characters, API Secret should be ~50 characters',
          'Ensure you copied the complete credentials',
          'Check for any extra spaces or characters',
          'Regenerate credentials if necessary'
        ]
      }, { status: 500 })
    }

    debugLog.push('Credentials validation passed')

    // Test basic connectivity with app-only authentication
    try {
      if (bearerToken && bearerToken !== 'your_twitter_bearer_token') {
        debugLog.push('Testing app-only authentication with bearer token')
        
        const appOnlyClient = new TwitterApi(bearerToken)
        
        // Test a simple API call that doesn't require user context
        const testResponse = await appOnlyClient.v2.tweets('20', {
          'tweet.fields': ['created_at']
        })
        
        debugLog.push('App-only authentication test successful')
        
        return NextResponse.json({
          success: true,
          message: 'Twitter API configuration is valid',
          debugLog,
          details: {
            apiKeyConfigured: true,
            apiSecretConfigured: true,
            bearerTokenConfigured: true,
            credentialsValid: true,
            connectionTest: 'passed',
            appOnlyAuth: 'working'
          }
        })
      }

      // Fallback test without bearer token
      debugLog.push('Testing basic client initialization')
      
      const basicClient = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
      })

      // We can't test much without user tokens, but we can verify the client initializes
      debugLog.push('Basic client initialization successful')

      return NextResponse.json({
        success: true,
        message: 'Twitter API credentials appear valid',
        debugLog,
        details: {
          apiKeyConfigured: true,
          apiSecretConfigured: true,
          bearerTokenConfigured: !!bearerToken,
          credentialsValid: true,
          connectionTest: 'partial',
          note: 'Full testing requires user authentication'
        },
        recommendations: [
          'Add TWITTER_BEARER_TOKEN for enhanced testing capabilities',
          'Test the full OAuth flow to verify complete functionality',
          'Monitor production logs for specific error messages'
        ]
      })

    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error'
      debugLog.push(`API test failed: ${errorMessage}`)
      
      let errorType = 'API_CONNECTION_FAILED'
      let instructions = [
        'Check your internet connection',
        'Verify Twitter API is not blocked by firewall',
        'Ensure your app is not restricted or suspended',
        'Try again in a few minutes'
      ]

      if (errorMessage.includes('401')) {
        errorType = 'INVALID_CREDENTIALS'
        instructions = [
          'Verify your API credentials in Twitter Developer Console',
          'Ensure you copied the complete API Key and Secret',
          'Check that your app is not suspended',
          'Regenerate credentials if necessary'
        ]
      } else if (errorMessage.includes('403')) {
        errorType = 'INSUFFICIENT_PERMISSIONS'
        instructions = [
          'Check your app permissions in Twitter Developer Console',
          'Ensure your app has "Read and Write" permissions',
          'Apply for Elevated access if required',
          'Verify your app is approved and active'
        ]
      } else if (errorMessage.includes('429')) {
        errorType = 'RATE_LIMITED'
        instructions = [
          'You are being rate limited by Twitter',
          'Wait 15 minutes before trying again',
          'Consider implementing exponential backoff',
          'Monitor your API usage in Twitter Developer Console'
        ]
      }

      return NextResponse.json({
        success: false,
        error: errorType,
        message: 'Twitter API test failed',
        debugLog,
        details: {
          apiError: errorMessage,
          code: apiError instanceof Error && 'code' in apiError ? (apiError as any).code : undefined,
          data: apiError instanceof Error && 'data' in apiError ? (apiError as any).data : undefined
        },
        instructions
      }, { status: 500 })
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    debugLog.push(`Health check failed: ${errorMessage}`)
    
    return NextResponse.json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'Twitter health check failed',
      debugLog,
      details: errorMessage
    }, { status: 500 })
  }
}