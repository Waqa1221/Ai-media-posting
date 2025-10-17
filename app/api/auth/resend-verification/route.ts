import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get cookies and create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if user exists and is not verified
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email_verified')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (profile.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID()

    // Update or insert verification record
    const { error: verificationError } = await supabase
      .from('email_verifications')
      .upsert({
        user_id: profile.id,
        email: email,
        verification_token: verificationToken,
        verified: false,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        attempts: 0
      }, {
        onConflict: 'user_id,email'
      })

    if (verificationError) {
      console.error('Verification record error:', verificationError)
      return NextResponse.json(
        { error: 'Failed to create verification record' },
        { status: 500 }
      )
    }

    // In a real application, you would send an email here
    // For now, we'll just return success
    console.log(`Verification email would be sent to ${email} with token: ${verificationToken}`)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Resend verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}