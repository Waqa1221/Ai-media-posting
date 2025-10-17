'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Mail, Lock, User, Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Building } from 'lucide-react'
import { toast } from 'sonner'
import { PasswordStrength } from '@/components/auth/password-strength'

interface SignUpFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
  industry: string
  companySize: string
  referralSource: string
}

const INDUSTRIES = [
  'technology',
  'healthcare',
  'finance',
  'retail',
  'education',
  'marketing',
  'real-estate',
  'food-beverage',
  'travel-tourism',
  'fitness-wellness',
  'other'
]

const COMPANY_SIZES = [
  '1',
  '2-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+'
]

const REFERRAL_SOURCES = [
  'google-search',
  'social-media',
  'friend-colleague',
  'blog-article',
  'advertisement',
  'conference-event',
  'other'
]

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    companySize: '',
    referralSource: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptMarketing, setAcceptMarketing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleInputChange = useCallback((field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // Clear error when user types
  }, [])

  const validateStep1 = useCallback(() => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }, [formData])

  const validateStep2 = useCallback(() => {
    if (!formData.companyName.trim()) {
      setError('Company name is required')
      return false
    }
    if (!formData.industry) {
      setError('Please select your industry')
      return false
    }
    if (!formData.companySize) {
      setError('Please select your company size')
      return false
    }
    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return false
    }
    return true
  }, [formData, acceptTerms])

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }, [currentStep, validateStep1])

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateStep2()) return

    setIsLoading(true)

    try {
      // Create user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            industry: formData.industry,
            company_size: formData.companySize,
            signup_source: formData.referralSource || 'direct',
            marketing_consent: acceptMarketing,
            email_verified: false,
            avatar_url: null
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (data.user) {
        // Ensure profile is created immediately after signup
        try {
          const { ensureUserProfile } = await import('@/lib/supabase/client')
          await ensureUserProfile(
            data.user.id,
            formData.email,
            formData.fullName
          )
        } catch (profileError) {
          console.warn('Failed to create profile during signup:', profileError)
        }
        
        setSuccess(true)
        toast.success('Account created successfully! Please check your email to verify your account.')
        
        // Redirect to email verification page
        setTimeout(() => {
          router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
        }, 1000) // Faster redirect
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [formData, acceptMarketing, validateStep2, supabase, router])

  const handleGoogleSignUp = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch (error) {
      setError('Failed to sign up with Google')
    }
  }, [supabase])

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your email and click the verification link to activate your account.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Step {currentStep} of 2 - {currentStep === 1 ? 'Personal Information' : 'Business Information'}
            </CardDescription>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              {currentStep === 1 && (
                <>
                  {/* Step 1: Personal Information */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={formData.password} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="button" onClick={handleNextStep} className="w-full">
                    Continue
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  {/* Step 2: Business Information */}
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Enter your company name"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="industry" className="text-sm font-medium text-gray-700">
                      Industry *
                    </label>
                    <Select onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology & Software</SelectItem>
                        <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                        <SelectItem value="finance">Finance & Banking</SelectItem>
                        <SelectItem value="retail">Retail & E-commerce</SelectItem>
                        <SelectItem value="education">Education & Training</SelectItem>
                        <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                        <SelectItem value="travel-tourism">Travel & Tourism</SelectItem>
                        <SelectItem value="fitness-wellness">Fitness & Wellness</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="companySize" className="text-sm font-medium text-gray-700">
                      Company Size *
                    </label>
                    <Select onValueChange={(value) => handleInputChange('companySize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Just me</SelectItem>
                        <SelectItem value="2-10">2-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="referralSource" className="text-sm font-medium text-gray-700">
                      How did you hear about us?
                    </label>
                    <Select onValueChange={(value) => handleInputChange('referralSource', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select referral source (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google-search">Google Search</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="friend-colleague">Friend/Colleague</SelectItem>
                        <SelectItem value="blog-article">Blog/Article</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="conference-event">Conference/Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketing"
                        checked={acceptMarketing}
                        onCheckedChange={(checked) => setAcceptMarketing(checked === true)}
                      />
                      <label htmlFor="marketing" className="text-sm text-gray-600">
                        I'd like to receive product updates and marketing emails
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="button" variant="outline" onClick={handlePrevStep} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {currentStep === 1 && (
              <>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleGoogleSignUp}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </>
            )}

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}