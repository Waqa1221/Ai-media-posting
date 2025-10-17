import { NextResponse } from 'next/server'
import { openaiClient } from '@/lib/ai/openai-client'

export async function GET() {
  try {
    // Test if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured',
        message: 'Please add your OpenAI API key to the .env.local file'
      }, { status: 500 })
    }

    // Test a simple completion
    const testPrompt = 'Generate a simple test response in JSON format to verify the OpenAI API is working. Just respond with "OpenAI API is working correctly!"'
    
    const result = await openaiClient.generateContent(testPrompt, 'gpt-3.5-turbo')
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API is working correctly!',
      result: {
        content: result.content,
        tokensUsed: result.tokensUsed,
        model: result.model
      }
    })
  } catch (error) {
    console.error('OpenAI test error:', error)
    
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      message: 'OpenAI API test failed. Please check your API key and billing setup.'
    }, { status: 500 })
  }
}