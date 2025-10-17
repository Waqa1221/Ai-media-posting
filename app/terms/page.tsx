'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Scale, Shield, CreditCard, Users, AlertTriangle } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-4xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using SocialAI.
          </p>
          <Badge className="mt-4">Effective Date: January 15, 2024</Badge>
        </div>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using SocialAI ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                SocialAI is an AI-powered social media management platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>AI-generated content creation for social media</li>
                <li>Multi-platform scheduling and publishing</li>
                <li>Analytics and performance tracking</li>
                <li>Social media account management</li>
                <li>Automation tools and workflows</li>
                <li>Team collaboration features</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Accounts and Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Registration</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per person or business entity</li>
                  <li>You must be at least 18 years old to use the service</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Acceptable Use</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Use the service only for lawful purposes</li>
                  <li>Do not violate any social media platform's terms of service</li>
                  <li>Do not generate or publish harmful, offensive, or illegal content</li>
                  <li>Respect intellectual property rights</li>
                  <li>Do not attempt to reverse engineer or hack the service</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Billing and Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing and Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Subscription Plans</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Premium Plan: $70/month with 7-day free trial</li>
                  <li>All features included with unlimited usage</li>
                  <li>Billing occurs monthly on your subscription date</li>
                  <li>Prices may change with 30 days notice</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Payment is due in advance for each billing period</li>
                  <li>We accept major credit cards through Stripe</li>
                  <li>Failed payments may result in service suspension</li>
                  <li>Refunds are provided according to our refund policy</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cancellation</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>No refunds for partial months unless required by law</li>
                  <li>Data may be deleted after account cancellation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>You retain ownership of content you create</li>
                  <li>You grant us license to process and publish your content</li>
                  <li>You are responsible for ensuring you have rights to all content</li>
                  <li>AI-generated content is owned by you</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Our Platform</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>SocialAI platform and technology are our property</li>
                  <li>You may not copy, modify, or distribute our software</li>
                  <li>Our trademarks and branding are protected</li>
                  <li>We respect third-party intellectual property rights</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitations and Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Limitations and Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Availability</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                  <li>Maintenance windows may temporarily affect availability</li>
                  <li>Third-party platform changes may impact functionality</li>
                  <li>We are not responsible for social media platform outages</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">AI Content Disclaimer</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>AI-generated content should be reviewed before publishing</li>
                  <li>We are not responsible for AI-generated content accuracy</li>
                  <li>Users are responsible for compliance with platform policies</li>
                  <li>AI models may occasionally produce unexpected results</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                <p className="text-gray-600">
                  To the maximum extent permitted by law, SocialAI shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including without limitation, 
                  loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant 
                changes via email or through the platform. Continued use of the service after changes 
                constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> legal@socialai.com</p>
                <p><strong>Address:</strong> 123 Legal Street, Terms City, TC 12345</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}