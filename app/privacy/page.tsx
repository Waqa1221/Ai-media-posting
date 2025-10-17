'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Eye, Database, Mail, Cookie } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-4xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. Learn how we protect and handle your data.
          </p>
          <Badge className="mt-4">Last updated: January 15, 2024</Badge>
        </div>

        <div className="space-y-8">
          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
              <CardDescription>
                Types of data we collect and how we use it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Email address and password</li>
                  <li>Name and profile information</li>
                  <li>Company information (optional)</li>
                  <li>Billing and payment information</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Content and Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Social media posts and content you create</li>
                  <li>AI generation prompts and results</li>
                  <li>Analytics and performance data</li>
                  <li>Platform usage patterns and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Social Media Account Data</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Connected social media account information</li>
                  <li>Access tokens for publishing (encrypted)</li>
                  <li>Public profile information from connected accounts</li>
                  <li>Engagement metrics and analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Service Provision</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Provide and maintain our services</li>
                    <li>Process and fulfill your requests</li>
                    <li>Generate AI-powered content</li>
                    <li>Schedule and publish social media posts</li>
                    <li>Provide analytics and insights</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Improvement and Support</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Improve our AI models and algorithms</li>
                    <li>Provide customer support</li>
                    <li>Send important service updates</li>
                    <li>Analyze usage patterns for optimization</li>
                    <li>Ensure platform security and integrity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Security Measures</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Secure token storage and management</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Secure data centers and infrastructure</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Data Retention</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Account data: Retained while account is active</li>
                    <li>Content data: Retained for service provision</li>
                    <li>Analytics data: Aggregated and anonymized</li>
                    <li>Billing data: Retained per legal requirements</li>
                    <li>Deleted data: Permanently removed within 30 days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  We work with trusted third-party services to provide our platform:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Supabase</h4>
                    <p className="text-sm text-gray-600">Database and authentication services</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Stripe</h4>
                    <p className="text-sm text-gray-600">Payment processing and billing</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">OpenAI</h4>
                    <p className="text-sm text-gray-600">AI content generation services</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Social Media APIs</h4>
                    <p className="text-sm text-gray-600">Platform integrations for publishing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Data Access & Control</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Export your data</li>
                    <li>Restrict data processing</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Communication Preferences</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Opt out of marketing emails</li>
                    <li>Control notification settings</li>
                    <li>Manage data sharing preferences</li>
                    <li>Update privacy settings</li>
                    <li>Contact our privacy team</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We use cookies and similar technologies to improve your experience:
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Essential Cookies</div>
                    <div className="text-sm text-gray-600">Required for basic functionality</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Always Active</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Analytics Cookies</div>
                    <div className="text-sm text-gray-600">Help us understand usage patterns</div>
                  </div>
                  <Badge variant="outline">Optional</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Marketing Cookies</div>
                    <div className="text-sm text-gray-600">Personalize your experience</div>
                  </div>
                  <Badge variant="outline">Optional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@socialai.com</p>
                <p><strong>Address:</strong> 123 Privacy Street, Data City, DC 12345</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                We will respond to your privacy-related inquiries within 30 days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}