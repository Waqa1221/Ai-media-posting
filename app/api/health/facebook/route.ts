import { NextResponse } from 'next/server'

/**
 * Facebook API Health Check Endpoint
 * Tests Facebook API configuration and connectivity
 */
export async function GET() {
  try {
    // Check environment variables
    const appId = process.env.FACEBOOK_APP_ID
    const appSecret = process.env.FACEBOOK_APP_SECRET
    
    if (!appId || !appSecret) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Facebook API credentials not configured',
        instructions: [
          'Add FACEBOOK_APP_ID to your environment variables',
          'Add FACEBOOK_APP_SECRET to your environment variables',
          'Get credentials from developers.facebook.com',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Check for placeholder values
    if (appId === 'your_facebook_app_id' || appSecret === 'your_facebook_app_secret') {
      return NextResponse.json({
        success: false,
        error: 'PLACEHOLDER_CREDENTIALS',
        message: 'Facebook API credentials are using placeholder values',
        instructions: [
          'Replace placeholder values with actual Facebook app credentials',
          'Get credentials from developers.facebook.com',
          'Create a Facebook app and get App ID and App Secret',
          'Update your .env.local file',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Validate credential format (Facebook App IDs are typically 15-16 digits)
    if (!/^\d{15,16}$/.test(appId)) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_APP_ID',
        message: 'Facebook App ID appears to be invalid',
        instructions: [
          'Verify your Facebook App ID from the Facebook Developer Console',
          'App ID should be 15-16 digits',
          'Ensure you copied the complete App ID',
          'Check for any extra spaces or characters'
        ]
      }, { status: 500 })
    }

    // Test basic connectivity with Facebook Graph API
    try {
      const testResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          grant_type: 'client_credentials'
        }),
      })

      if (testResponse.ok) {
        const testData = await testResponse.json()
        
        if (testData.access_token) {
          return NextResponse.json({
            success: true,
            message: 'Facebook API configuration is valid',
            details: {
              appIdConfigured: true,
              appSecretConfigured: true,
              credentialsValid: true,
              connectionTest: 'passed',
              appAccessToken: 'generated'
            }
          })
        }
      }

      const errorData = await testResponse.json()
      
      if (errorData.error && errorData.error.code === 101) {
        return NextResponse.json({
          success: false,
          error: 'INVALID_API_KEY',
          message: 'Facebook App ID or App Secret is invalid',
          instructions: [
            'Verify your App ID and App Secret in Facebook Developer Console',
            'Ensure you copied the complete credentials',
            'Check that your app is not restricted or suspended',
            'Regenerate App Secret if necessary'
          ]
        }, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        error: 'API_ERROR',
        message: errorData.error?.message || 'Facebook API returned an error',
        instructions: [
          'Check Facebook Developer Console for app status',
          'Verify app is published and active',
          'Ensure app has necessary permissions',
          'Contact Facebook Developer Support if needed'
        ]
      }, { status: 500 })

    } catch (apiError) {
      console.error('Facebook API test failed:', apiError)
      
      return NextResponse.json({
        success: false,
        error: 'API_CONNECTION_FAILED',
        message: 'Failed to connect to Facebook API',
        instructions: [
          'Check your internet connection',
          'Verify Facebook API is not blocked by firewall',
          'Ensure your app is not restricted or suspended',
          'Try again in a few minutes'
        ]
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Facebook health check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'Facebook health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}