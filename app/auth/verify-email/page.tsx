'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Mail, CircleCheck as CheckCircle, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const token = searchParams.get('token')
    
    if (emailParam) {
      setEmail(emailParam)
    }

    // If there's a token in the URL, verify it automatically
    if (token) {
      verifyToken(token)
    }
  }, [searchParams])

  const verifyToken = async (token: string) => {
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      })

      if (error) {
        setError('Invalid or expired verification link. Please request a new one.')
        return
      }

      if (data.user) {
        setSuccess('Email verified successfully! Redirecting to your dashboard...')
        toast.success('Email verified successfully!')
        
        setTimeout(() => {
          router.push('/onboarding')
        }, 2000)
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('An error occurred during verification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setError('Email address is required to resend verification.')
      return
    }

    setIsResending(true)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Verification email sent! Please check your inbox.')
      toast.success('Verification email sent!')
    } catch (error) {
      console.error('Resend error:', error)
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SocialAI</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              {email ? (
                <>We've sent a verification link to <strong>{email}</strong></>
              ) : (
                'Please check your email for a verification link'
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-4">
                  Click the verification link in your email to activate your account.
                </p>
                <p>
                  Didn't receive the email? Check your spam folder or request a new one.
                </p>
              </div>

              <Button
                onClick={resendVerification}
                disabled={isResending || !email}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link 
                  href="/auth/signin" 
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-2">Need help?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email address</li>
                <li>• Verification links expire after 24 hours</li>
                <li>• Contact support if you continue having issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}