import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Get cookies and create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Call the verify_user_email function
    const { data, error } = await supabase.rpc('verify_user_email', {
      token: token
    })

    if (error) {
      console.error('Email verification error:', error)
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}