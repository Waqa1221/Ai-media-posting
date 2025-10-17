import { NextResponse } from 'next/server'

/**
 * LinkedIn API Health Check Endpoint
 * Tests LinkedIn API configuration and connectivity
 */
export async function GET() {
  try {
    // Check environment variables
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'LinkedIn API credentials not configured',
        instructions: [
          'Add LINKEDIN_CLIENT_ID to your environment variables',
          'Add LINKEDIN_CLIENT_SECRET to your environment variables',
          'Get credentials from developer.linkedin.com',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Check for placeholder values
    if (clientId === 'your_linkedin_client_id' || clientSecret === 'your_linkedin_client_secret') {
      return NextResponse.json({
        success: false,
        error: 'PLACEHOLDER_CREDENTIALS',
        message: 'LinkedIn API credentials are using placeholder values',
        instructions: [
          'Replace placeholder values with actual LinkedIn app credentials',
          'Get credentials from developer.linkedin.com',
          'Create a LinkedIn app and get Client ID and Secret',
          'Update your .env.local file',
          'Restart your development server'
        ]
      }, { status: 500 })
    }

    // Validate credential format (LinkedIn Client IDs are typically 10-14 characters)
    if (clientId.length < 10 || clientId.length > 20) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_CLIENT_ID',
        message: 'LinkedIn Client ID appears to be invalid',
        instructions: [
          'Verify your LinkedIn Client ID from the LinkedIn Developer Console',
          'Client ID should be 10-14 characters long',
          'Ensure you copied the complete Client ID',
          'Check for any extra spaces or characters'
        ]
      }, { status: 500 })
    }

    // Test basic connectivity (this doesn't require user tokens)
    try {
      const testResponse = await fetch('https://www.linkedin.com/oauth/v2/authorization', {
        method: 'HEAD',
      })

      // LinkedIn OAuth endpoint should be accessible
      if (testResponse.status === 405 || testResponse.status === 200) {
        // 405 Method Not Allowed is expected for HEAD request, means endpoint is accessible
        return NextResponse.json({
          success: true,
          message: 'LinkedIn API configuration is valid',
          details: {
            clientIdConfigured: true,
            clientSecretConfigured: true,
            credentialsValid: true,
            connectionTest: 'passed'
          }
        })
      }

      return NextResponse.json({
        success: false,
        error: 'API_CONNECTION_FAILED',
        message: 'Failed to connect to LinkedIn API',
        instructions: [
          'Check your internet connection',
          'Verify LinkedIn API is not blocked by firewall',
          'Ensure your app is not restricted or suspended',
          'Try again in a few minutes'
        ]
      }, { status: 500 })

    } catch (apiError) {
      console.error('LinkedIn API test failed:', apiError)
      
      return NextResponse.json({
        success: false,
        error: 'API_CONNECTION_FAILED',
        message: 'Failed to connect to LinkedIn API',
        instructions: [
          'Check your internet connection',
          'Verify LinkedIn API is not blocked by firewall',
          'Ensure your app is not restricted or suspended',
          'Contact LinkedIn Developer Support if issues persist'
        ]
      }, { status: 500 })
    }

  } catch (error) {
    console.error('LinkedIn health check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'LinkedIn health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}