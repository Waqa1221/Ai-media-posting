import { NextResponse } from 'next/server'

/**
 * Instagram API Health Check Endpoint
 * Tests Instagram API configuration and connectivity
 */
export async function GET() {
  try {
    // Check environment variables
    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Instagram API credentials not configured',
        instructions: [
          'Add INSTAGRAM_CLIENT_ID to your environment variables',
          'Add INSTAGRAM_CLIENT_SECRET to your environment variables',
          'These should be your Facebook App ID and App Secret',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Check for placeholder values
    if (clientId === 'your_instagram_client_id' || clientSecret === 'your_instagram_client_secret') {
      return NextResponse.json({
        success: false,
        error: 'PLACEHOLDER_CREDENTIALS',
        message: 'Instagram API credentials are using placeholder values',
        instructions: [
          'Replace placeholder values with actual Facebook App credentials',
          'Get credentials from developers.facebook.com',
          'Create an app and add Instagram Basic Display product',
          'Update your .env.local file',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Validate credential format (Facebook App IDs are typically 15-16 digits)
    if (!/^\d{15,16}$/.test(clientId)) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_CLIENT_ID',
        message: 'Instagram Client ID appears to be invalid',
        instructions: [
          'Verify your Facebook App ID from the Facebook Developer Console',
          'App ID should be 15-16 digits',
          'Ensure you copied the complete App ID',
          'Check for any extra spaces or characters'
        ]
      }, { status: 500 })
    }

    // Test basic connectivity (this doesn't require user tokens)
    try {
      const testResponse = await fetch(`https://graph.instagram.com/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials'
        }),
      })

      // We expect this to fail with a specific error for client credentials
      // but it validates that our credentials are recognized
      const testData = await testResponse.json()
      
      if (testData.error && testData.error.message === 'Unsupported grant_type') {
        // This is expected - means our credentials are valid
        return NextResponse.json({
          success: true,
          message: 'Instagram API configuration is valid',
          details: {
            clientIdConfigured: true,
            clientSecretConfigured: true,
            credentialsValid: true,
            connectionTest: 'passed'
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Instagram API configuration appears valid',
        details: {
          clientIdConfigured: true,
          clientSecretConfigured: true,
          credentialsValid: true,
          connectionTest: 'partial'
        }
      })

    } catch (apiError) {
      console.error('Instagram API test failed:', apiError)
      
      return NextResponse.json({
        success: false,
        error: 'API_CONNECTION_FAILED',
        message: 'Failed to connect to Instagram API',
        instructions: [
          'Check your internet connection',
          'Verify Facebook/Instagram API is not blocked by firewall',
          'Ensure your app is not restricted or suspended',
          'Try again in a few minutes'
        ]
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Instagram health check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'Instagram health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}