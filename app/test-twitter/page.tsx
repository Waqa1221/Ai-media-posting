"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader as Loader2, Twitter, Send, ExternalLink, Copy, Key } from 'lucide-react'
import { toast } from "sonner";

export default function TestTwitterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testContent, setTestContent] = useState(
    "Testing Twitter integration with SocialAI! 🚀 #SocialAI #TwitterAPI"
  );

  const testTwitterAPI = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/health/twitter");
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Test failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const testTwitterConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/automation/twitter/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: testContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          ...data,
          connectionTest: true,
          testContent: data.preview,
        });
      } else {
        setError(data.error || "Connection test failed");
      }
    } catch (err) {
      setError("Failed to test Twitter connection");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Twitter className="w-8 h-8" />
          Twitter Integration Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your Twitter API configuration and verify the integration is
          working
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Configuration Test */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration Test</CardTitle>
            <CardDescription>
              Test your Twitter API key configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testTwitterAPI}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Configuration...
                </>
              ) : (
                "Test Twitter API Keys"
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {result && result.success && !result.connectionTest && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success!</strong> {result.message}
                  {result.details && (
                    <div className="mt-2">
                      <strong>Configuration Status:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>
                          API Key:{" "}
                          {result.details.apiKeyConfigured ? "✅" : "❌"}
                        </li>
                        <li>
                          API Secret:{" "}
                          {result.details.apiSecretConfigured ? "✅" : "❌"}
                        </li>
                        <li>
                          Credentials Valid:{" "}
                          {result.details.credentialsValid ? "✅" : "❌"}
                        </li>
                        <li>
                          Connection Test:{" "}
                          {result.details.connectionTest === "passed"
                            ? "✅"
                            : "❌"}
                        </li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>
              Test posting functionality with your connected account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Test Tweet Content
              </label>
              <Input
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Enter test tweet content..."
                maxLength={280}
              />
              <div className="text-sm text-muted-foreground mt-1">
                {testContent.length}/280 characters
              </div>
            </div>

            <Button
              onClick={testTwitterConnection}
              disabled={isLoading || !testContent.trim()}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Test Connection (No Tweet Posted)
                </>
              )}
            </Button>

            {result && result.connectionTest && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Connection Test Successful!</strong>
                  <div className="mt-2">
                    <div>Account: @{result.account?.username}</div>
                    <div>Platform: {result.account?.platform}</div>
                    <div>Test Content: "{result.testContent?.content}"</div>
                    <div>
                      Character Count: {result.testContent?.characterCount}/
                      {result.testContent?.characterLimit}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> This test validates your connection
                without actually posting to Twitter. To test actual posting, use
                the scheduler or automation features.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Twitter API Setup Instructions</CardTitle>
          <CardDescription>
            Complete guide to setting up Twitter integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">1. Twitter Developer Account</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>You already have a Twitter Developer account ✅</li>
                <li>Your app "Ai Social media management" is configured ✅</li>
                <li>Free Tier access with 500 posts/month limit ✅</li>
                <li>Read and Write permissions enabled ✅</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-3">2. Create Twitter App</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Your app is already created and configured ✅</li>
                <li>
                  Current app settings:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>App Name: Ai Social media management ✅</li>
                    <li>Website: https://mntomfordigitalllc.com ✅</li>
                    <li>
                      Callback URLs: localhost:3000 & mntomfordigitalllc.com ✅
                    </li>
                    <li>App Type: Web App/Bot (Confidential Client) ✅</li>
                    <li>Permissions: Read and Write ✅</li>
                  </ul>
                </li>
                <li>OAuth 1.0a Authentication enabled ✅</li>
                <li>Free Tier: 500 posts/month, 100 reads/month ✅</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-3">3. Environment Variables</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm relative">
                <pre>{`# Add to your .env.local file
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here (optional for OAuth 1.0a)

# Site URL for OAuth callbacks
NEXT_PUBLIC_SITE_URL=https://mntomfordigitalllc.com`}</pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    copyToClipboard(`TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
NEXT_PUBLIC_SITE_URL=https://mntomfordigitalllc.com`)
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">4. Common Issues & Solutions</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50">
                  <Badge className="bg-blue-100 text-blue-800 mt-0.5">
                    Free
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Free Tier Limits</div>
                    <div className="text-sm text-muted-foreground">
                      500 posts per month, 100 API reads per month
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Monitor your usage to avoid hitting limits
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant="destructive" className="mt-0.5">
                    403
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Forbidden Error</div>
                    <div className="text-sm text-muted-foreground">
                      Your app needs "Read and Write" permissions or Elevated
                      access
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Solution: Update app permissions in Twitter Developer
                      Portal
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant="destructive" className="mt-0.5">
                    401
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      Unauthorized Error
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Invalid API keys, incorrect configuration, or app
                      suspended
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Solution: Verify API keys in Developer Portal, check app
                      status
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant="destructive" className="mt-0.5">
                    429
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      Rate Limit Exceeded
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Too many API requests in a short time
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Solution: Wait 15 minutes and try again, or apply for
                      higher rate limits
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge className="bg-yellow-100 text-yellow-800 mt-0.5">
                    187
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Duplicate Tweet</div>
                    <div className="text-sm text-muted-foreground">
                      Tweet content has already been posted recently
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Solution: Modify tweet content slightly or wait before
                      posting
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">5. Testing Checklist</h3>
              <div className="space-y-2">
                {[
                  "Twitter Developer account approved ✅",
                  'App "Ai Social media management" created ✅',
                  "Read and Write permissions enabled ✅",
                  "OAuth 1.0a authentication configured ✅",
                  "Callback URLs properly set ✅",
                  "API keys added to environment variables",
                  "Development server restarted",
                  "API configuration test passes",
                  "Connection test with account succeeds",
                  "Ready for live posting (500/month limit)",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        item.includes("✅") ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Links & Resources</CardTitle>
          <CardDescription>
            Helpful links for Twitter integration setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">Developer Resources</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href="https://developer.twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Twitter Developer Portal
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href="https://developer.twitter.com/en/docs/twitter-api"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Twitter API Documentation
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href="https://developer.twitter.com/en/portal/petition/essential/basic-info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply for Elevated Access
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">SocialAI Resources</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/test-twitter-setup">
                    <Key className="w-4 h-4 mr-2" />
                    Twitter Setup Helper
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/dashboard/social-accounts">
                    <Twitter className="w-4 h-4 mr-2" />
                    Connect Twitter Account
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/dashboard/automations/twitter">
                    <Send className="w-4 h-4 mr-2" />
                    Twitter Automation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Current status of your Twitter integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <div className="font-medium text-sm">API Configuration</div>
              <Badge
                className={
                  result?.success
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {result?.success ? "Configured" : "Not Tested"}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Twitter className="w-6 h-6 text-purple-600" />
              </div>
              <div className="font-medium text-sm">Account Connection</div>
              <Badge
                className={
                  result?.connectionTest
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {result?.connectionTest ? "Connected" : "Not Tested"}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-medium text-sm">Ready to Publish</div>
              <Badge
                className={
                  result?.connectionTest && result?.success
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {result?.connectionTest && result?.success
                  ? "Ready"
                  : "Not Ready"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
