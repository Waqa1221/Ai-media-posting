'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Star, Sparkles, Crown, Zap } from 'lucide-react'

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-8 shadow-lg">
            <Star className="w-4 h-4 mr-2" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            One plan, unlimited possibilities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to dominate social media with AI. No hidden fees, no feature restrictions.
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="relative max-w-lg mx-auto">
          {/* Popular Badge */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-sm font-medium flex items-center shadow-xl">
              <Crown className="w-4 h-4 mr-2" />
              Most Popular Choice
            </div>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl p-12 border-2 border-blue-200 hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
                  <Sparkles className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-3">SocialAI Premium</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Complete AI-powered social media management platform
                </p>
                
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      $70
                    </span>
                    <div className="text-left">
                      <div className="text-gray-600 text-lg">/month</div>
                      <div className="text-sm text-green-600 font-medium">7-day free trial</div>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    Cancel anytime • No setup fees • No contracts
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[
                  'Unlimited AI content generation',
                  'Multi-platform publishing',
                  'Advanced scheduling & automation',
                  'Comprehensive analytics',
                  'AI Marketing Agency',
                  'Unlimited social accounts',
                  'Team collaboration',
                  'Priority support',
                  'Custom integrations',
                  'Advanced automation',
                  'Content calendar',
                  'Performance optimization',
                  'Brand voice consistency',
                  'Hashtag optimization',
                  'Media library',
                  'Real-time notifications'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  asChild 
                  className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Link href="/auth/signup">
                    <Zap className="w-5 h-5 mr-2" />
                    Start 7-Day Free Trial
                  </Link>
                </Button>
                
                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-4">
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      No credit card required
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      Cancel anytime
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Why choose SocialAI?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">10x Faster</h4>
              <p className="text-gray-600">Create content 10 times faster with AI automation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h4>
              <p className="text-gray-600">Enterprise-grade features at an affordable price</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h4>
              <p className="text-gray-600">Advanced AI that learns and adapts to your brand</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What's included in the trial?</h4>
              <p className="text-gray-600 text-sm">Full access to all features for 7 days. No restrictions, no credit card required.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, cancel anytime with one click. No cancellation fees or penalties.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600 text-sm">Yes, we offer a 30-day money-back guarantee if you're not satisfied.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600 text-sm">No setup fees, no hidden costs. Just $70/month after your free trial.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}