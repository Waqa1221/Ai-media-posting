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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Settings,
  Trash2,
  Crown,
  CreditCard as Edit,
  CheckCircle,
  MessageSquare,
  Mail,
  Calendar,
  ChartBar as BarChart3,
  Shield,
  Clock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "contributor" | "viewer";
  status: "active" | "invited" | "inactive";
  avatar_url?: string;
  last_active: Date;
  posts_created: number;
  joined_at: Date;
  permissions: string[];
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("contributor");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      // Mock data for now since team functionality isn't fully implemented
      const mockMembers: TeamMember[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@company.com",
          role: "admin",
          status: "active",
          avatar_url:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          last_active: new Date(Date.now() - 30 * 60 * 1000),
          posts_created: 45,
          joined_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          permissions: ["create", "edit", "delete", "publish", "manage_team"],
        },
        {
          id: "2",
          name: "Sarah Wilson",
          email: "sarah@company.com",
          role: "editor",
          status: "active",
          avatar_url:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          last_active: new Date(Date.now() - 2 * 60 * 60 * 1000),
          posts_created: 32,
          joined_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          permissions: ["create", "edit", "publish"],
        },
        {
          id: "3",
          name: "Mike Chen",
          email: "mike@company.com",
          role: "contributor",
          status: "invited",
          last_active: new Date(Date.now() - 24 * 60 * 60 * 1000),
          posts_created: 0,
          joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          permissions: ["create", "edit"],
        },
      ];

      setTeamMembers(mockMembers);
    } catch (error) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const inviteTeamMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsInviting(true);

      // Mock invitation process
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: selectedRole as any,
        status: "invited",
        last_active: new Date(),
        posts_created: 0,
        joined_at: new Date(),
        permissions: getPermissionsForRole(selectedRole),
      };

      setTeamMembers((prev) => [...prev, newMember]);
      setInviteEmail("");
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
      toast.success("Team member removed");
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === memberId
            ? {
                ...member,
                role: newRole as any,
                permissions: getPermissionsForRole(newRole),
              }
            : member
        )
      );
      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const getPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case "admin":
        return [
          "create",
          "edit",
          "delete",
          "publish",
          "manage_team",
          "view_analytics",
        ];
      case "editor":
        return ["create", "edit", "publish", "view_analytics"];
      case "contributor":
        return ["create", "edit"];
      case "viewer":
        return ["view"];
      default:
        return ["view"];
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "editor":
        return <Edit className="w-4 h-4 text-blue-500" />;
      case "contributor":
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case "viewer":
        return <Shield className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-100 text-yellow-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "contributor":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "invited":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Team Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and their permissions
          </p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Members
                </p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter((m) => m.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Invites
                </p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter((m) => m.status === "invited").length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Posts
                </p>
                <p className="text-2xl font-bold">
                  {teamMembers.reduce((sum, m) => sum + m.posts_created, 0)}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Invite New Member */}
          <Card>
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
              <CardDescription>
                Add new team members to collaborate on content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="contributor">Contributor</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={inviteTeamMember} disabled={isInviting}>
                  {isInviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Inviting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
              <CardDescription>
                Manage your team members and their access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {member.name}
                          </h4>
                          <Badge className={getRoleColor(member.role)}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1 capitalize">
                              {member.role}
                            </span>
                          </Badge>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {member.email} • {member.posts_created} posts created
                        </div>
                        <div className="text-xs text-gray-500">
                          Last active:{" "}
                          {formatDistanceToNow(member.last_active, {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateMemberRole(member.id, e.target.value)
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="contributor">Contributor</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>

                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {/* Roles and Permissions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "admin",
                name: "Admin",
                description: "Full access to all features",
                permissions: [
                  "Create",
                  "Edit",
                  "Delete",
                  "Publish",
                  "Manage Team",
                  "View Analytics",
                ],
                color: "bg-yellow-100 text-yellow-800",
              },
              {
                role: "editor",
                name: "Editor",
                description: "Can create, edit and publish content",
                permissions: ["Create", "Edit", "Publish", "View Analytics"],
                color: "bg-blue-100 text-blue-800",
              },
              {
                role: "contributor",
                name: "Contributor",
                description: "Can create and edit content",
                permissions: ["Create", "Edit"],
                color: "bg-green-100 text-green-800",
              },
              {
                role: "viewer",
                name: "Viewer",
                description: "Read-only access",
                permissions: ["View"],
                color: "bg-gray-100 text-gray-800",
              },
            ].map((roleInfo) => (
              <Card key={roleInfo.role}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getRoleIcon(roleInfo.role)}
                    {roleInfo.name}
                  </CardTitle>
                  <CardDescription>{roleInfo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {roleInfo.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {permission}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Badge className={roleInfo.color}>
                      {
                        teamMembers.filter((m) => m.role === roleInfo.role)
                          .length
                      }{" "}
                      members
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Track team member actions and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    user: "Sarah Wilson",
                    action: 'Published post "Marketing Tips for 2024"',
                    time: new Date(Date.now() - 30 * 60 * 1000),
                    type: "publish",
                  },
                  {
                    user: "John Doe",
                    action: "Invited Mike Chen to the team",
                    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    type: "invite",
                  },
                  {
                    user: "Sarah Wilson",
                    action: 'Created draft "Social Media Trends"',
                    time: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    type: "create",
                  },
                  {
                    user: "John Doe",
                    action: "Updated team permissions",
                    time: new Date(Date.now() - 6 * 60 * 60 * 1000),
                    type: "settings",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === "publish" && (
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      )}
                      {activity.type === "invite" && (
                        <UserPlus className="w-4 h-4 text-green-600" />
                      )}
                      {activity.type === "create" && (
                        <Edit className="w-4 h-4 text-purple-600" />
                      )}
                      {activity.type === "settings" && (
                        <Settings className="w-4 h-4 text-orange-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(activity.time, {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
