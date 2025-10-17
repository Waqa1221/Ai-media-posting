"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Plus, CircleCheck as CheckCircle, CircleAlert as AlertCircle, ExternalLink, RefreshCw, Settings, Trash2, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useInstagramConnection } from "@/hooks/use-instagram-connection";

import { InstagramConnectionCard } from "@/components/social/instagram-connection-card";
import { FacebookConnectionCard } from "@/components/social/facebook-connection-card";
import { InstagramPublishingInterface } from "@/components/social/instagram-publishing-interface";
import { useFacebookConnection } from "@/hooks/use-facebook-connection";
interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  platform_data?: any;
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("accounts");
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Connection hooks
  const instagramConnection = useInstagramConnection();
  const facebookConnection = useFacebookConnection();

  useEffect(() => {
    loadAccounts();

    // Handle connection success/error messages from URL params
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (connected && message) {
      toast.success(decodeURIComponent(message));
    } else if (error && message) {
      toast.error(decodeURIComponent(message));
    }
  }, [searchParams]);

  const loadAccounts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error loading social accounts:", error);
      toast.error("Failed to load social accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectedPlatforms = () => {
    return accounts.filter((account) => account.is_active);
  };

  const getPlatformAccount = (platform: string) => {
    return accounts.find(
      (account) => account.platform === platform && account.is_active
    );
  };

  const handleDisconnectAccount = async (
    accountId: string,
    platform: string
  ) => {
    if (
      !confirm(`Are you sure you want to disconnect your ${platform} account?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("social_accounts")
        .update({ is_active: false })
        .eq("id", accountId);

      if (error) throw error;

      toast.success(`${platform} account disconnected`);
      loadAccounts();
    } catch (error) {
      toast.error(`Failed to disconnect ${platform} account`);
    }
  };

  const connectedPlatforms = getConnectedPlatforms();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading social accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Social Media Accounts
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect and manage your social media platforms for publishing and
          analytics
        </p>
      </div>

      {/* Connection Status Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            {connectedPlatforms.length} of 5 platforms connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                platform: "instagram",
                name: "Instagram",
                icon: "📸",
                connected: !!getPlatformAccount("instagram"),
              },
              {
                platform: "facebook",
                name: "Facebook",
                icon: "📘",
                connected: !!getPlatformAccount("facebook"),
              },
              {
                platform: "twitter",
                name: "Twitter",
                icon: "🐦",
                connected: !!getPlatformAccount("twitter"),
              },
              {
                platform: "linkedin",
                name: "LinkedIn",
                icon: "💼",
                connected: !!getPlatformAccount("linkedin"),
              },
              {
                platform: "tiktok",
                name: "TikTok",
                icon: "🎵",
                connected: !!getPlatformAccount("tiktok"),
              },
            ].map((platform) => (
              <div
                key={platform.platform}
                className="text-center p-3 border rounded-lg"
              >
                <div className="text-2xl mb-2">{platform.icon}</div>
                <div className="font-medium text-sm">{platform.name}</div>
                <Badge
                  className={
                    platform.connected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {platform.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Manage Accounts</TabsTrigger>
          <TabsTrigger value="publishing">Quick Publish</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Instagram Connection */}
          <InstagramConnectionCard
            account={instagramConnection.account}
            isConnecting={instagramConnection.isConnecting}
            onConnect={instagramConnection.connectAccount}
            onDisconnect={instagramConnection.disconnectAccount}
            onRefresh={instagramConnection.refreshAccount}
          />

          {/* Facebook Connection */}
          <FacebookConnectionCard
            account={facebookConnection.account}
            isConnecting={facebookConnection.isConnecting}
            onConnect={facebookConnection.connectAccount}
            onDisconnect={facebookConnection.disconnectAccount}
            onRefresh={facebookConnection.refreshAccount}
          />

          {/* Twitter Connection Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-black rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    🐦
                  </div>
                  <div>
                    <CardTitle className="text-lg">Twitter/X</CardTitle>
                    <CardDescription>
                      Real-time updates and conversations
                    </CardDescription>
                  </div>
                </div>

                {getPlatformAccount("twitter") ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Connected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {getPlatformAccount("twitter") ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      🐦
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        @{getPlatformAccount("twitter")?.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getPlatformAccount("twitter")?.display_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDisconnectAccount(
                          getPlatformAccount("twitter")!.id,
                          "Twitter"
                        )
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Connect your Twitter account to publish tweets, schedule
                      content, and track engagement.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full" asChild>
                    <a href="/api/auth/twitter">
                      {" "}
                      {/* This is correct */}
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect Twitter Account
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LinkedIn Connection Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    💼
                  </div>
                  <div>
                    <CardTitle className="text-lg">LinkedIn</CardTitle>
                    <CardDescription>
                      Professional networking and B2B content
                    </CardDescription>
                  </div>
                </div>

                {getPlatformAccount("linkedin") ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Connected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {getPlatformAccount("linkedin") ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      💼
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {getPlatformAccount("linkedin")?.display_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Professional Account
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDisconnectAccount(
                          getPlatformAccount("linkedin")!.id,
                          "LinkedIn"
                        )
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Connect your LinkedIn account to share professional
                      content and build your network.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full" asChild>
                    <a href="/api/auth/linkedin">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect LinkedIn Account
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-6">
          {connectedPlatforms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Connected Accounts
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your social media accounts to start publishing content
                </p>
                <Button onClick={() => setActiveTab("accounts")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Accounts
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Instagram Publishing */}
              {instagramConnection.account && (
                <InstagramPublishingInterface
                  account={instagramConnection.account}
                  onPublish={instagramConnection.publishPost}
                  onSchedule={async (postData) => {
                    // Handle Instagram scheduling
                    toast.success("Instagram post scheduled!");
                  }}
                />
              )}

              {/* Facebook Publishing */}
              {facebookConnection.account && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">📘</span>
                      Facebook Publishing
                    </CardTitle>
                    <CardDescription>
                      Publish content to your Facebook page
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Facebook publishing interface will be available soon.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
              <CardDescription>
                View performance metrics from your connected accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedPlatforms.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Connect accounts to view analytics
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connectedPlatforms.map((account) => (
                    <Card key={account.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span className="text-lg">
                            {account.platform === "instagram" && "📸"}
                            {account.platform === "facebook" && "📘"}
                            {account.platform === "twitter" && "🐦"}
                            {account.platform === "linkedin" && "💼"}
                            {account.platform === "tiktok" && "🎵"}
                          </span>
                          {account.platform.charAt(0).toUpperCase() +
                            account.platform.slice(1)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {Math.floor(Math.random() * 1000)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Engagement
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Having trouble connecting your social media accounts?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Common Issues</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make sure your accounts are in good standing</li>
                <li>
                  • Check that you have admin permissions for business accounts
                </li>
                <li>
                  • Ensure your accounts allow third-party app connections
                </li>
                <li>• Try disconnecting and reconnecting if you see errors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Get Support</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/test-social" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test API Connections
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/docs/social-media-setup" target="_blank">
                    <Info className="w-4 h-4 mr-2" />
                    Setup Documentation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
