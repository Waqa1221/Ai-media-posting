"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Bell,
  Shield,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AgencySettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [agencyInfo, setAgencyInfo] = useState({
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: "",
  });

  const [notifications, setNotifications] = useState({
    emailReports: true,
    clientAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
  });

  const [teamSettings, setTeamSettings] = useState({
    allowInvites: true,
    requireApproval: true,
    maxTeamMembers: 10,
  });

  useEffect(() => {
    loadAgencySettings();
  }, []);

  const loadAgencySettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setAgencyInfo({
          name: profile.company_name || "",
          description: profile.bio || "",
          website: profile.website || "",
          email: user.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSaveAgencyInfo = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: agencyInfo.name,
          bio: agencyInfo.description,
          website: agencyInfo.website,
          phone: agencyInfo.phone,
          address: agencyInfo.address,
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Agency information updated successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update agency information",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          notification_preferences: notifications,
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Notification preferences updated successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update notification preferences",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agency Settings</h1>
        <p className="text-muted-foreground">
          Manage your agency profile, team, and preferences
        </p>
      </div>

      {message && (
        <Alert
          className={`mb-6 ${
            message.type === "error" ? "border-red-500" : "border-green-500"
          }`}
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Agency Information
              </CardTitle>
              <CardDescription>
                Update your agency's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name</Label>
                  <Input
                    id="name"
                    value={agencyInfo.name}
                    onChange={(e) =>
                      setAgencyInfo({ ...agencyInfo, name: e.target.value })
                    }
                    placeholder="Your Agency Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={agencyInfo.website}
                    onChange={(e) =>
                      setAgencyInfo({ ...agencyInfo, website: e.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={agencyInfo.description}
                  onChange={(e) =>
                    setAgencyInfo({
                      ...agencyInfo,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of your agency"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={agencyInfo.email}
                    onChange={(e) =>
                      setAgencyInfo({ ...agencyInfo, email: e.target.value })
                    }
                    placeholder="contact@agency.com"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={agencyInfo.phone}
                    onChange={(e) =>
                      setAgencyInfo({ ...agencyInfo, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={agencyInfo.address}
                  onChange={(e) =>
                    setAgencyInfo({ ...agencyInfo, address: e.target.value })
                  }
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>

              <Button
                onClick={handleSaveAgencyInfo}
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Settings
              </CardTitle>
              <CardDescription>
                Configure how your team members can join and collaborate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Team Invites</Label>
                  <p className="text-sm text-muted-foreground">
                    Team members can invite others to join
                  </p>
                </div>
                <Switch
                  checked={teamSettings.allowInvites}
                  onCheckedChange={(checked) =>
                    setTeamSettings({ ...teamSettings, allowInvites: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    New team members need admin approval
                  </p>
                </div>
                <Switch
                  checked={teamSettings.requireApproval}
                  onCheckedChange={(checked) =>
                    setTeamSettings({
                      ...teamSettings,
                      requireApproval: checked,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Maximum Team Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="1"
                  max="100"
                  value={teamSettings.maxTeamMembers}
                  onChange={(e) =>
                    setTeamSettings({
                      ...teamSettings,
                      maxTeamMembers: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <Button className="w-full md:w-auto">Save Team Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance reports via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailReports}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailReports: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Client Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about client activities and requests
                  </p>
                </div>
                <Switch
                  checked={notifications.clientAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      clientAlerts: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Important updates about new features and maintenance
                  </p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      systemUpdates: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Tips, best practices, and promotional content
                  </p>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      marketingEmails: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional Plan
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/billing")}
                  >
                    Manage Subscription
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => router.push("/dashboard/billing")}
                  >
                    View Billing History
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => router.push("/dashboard/billing")}
                  >
                    Update Payment Method
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => router.push("/dashboard/billing")}
                  >
                    Download Invoices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
