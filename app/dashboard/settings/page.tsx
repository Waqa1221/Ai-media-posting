'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key,
  Trash2,
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  company_name: string
  bio: string
  website: string
  timezone: string
  language: string
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  weekly_reports: boolean
  post_reminders: boolean
  engagement_alerts: boolean
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private'
  analytics_sharing: boolean
  data_export_enabled: boolean
  two_factor_enabled: boolean
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    weekly_reports: true,
    post_reminders: true,
    engagement_alerts: true
  })
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: 'private',
    analytics_sharing: false,
    data_export_enabled: true,
    two_factor_enabled: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile({
        id: profileData.id,
        email: user.email || '',
        full_name: profileData.full_name || '',
        avatar_url: profileData.avatar_url || '',
        company_name: profileData.company_name || '',
        bio: profileData.bio || '',
        website: profileData.website || '',
        timezone: profileData.timezone || 'UTC',
        language: profileData.language || 'en'
      })
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
          bio: profile.bio,
          website: profile.website,
          timezone: profile.timezone,
          language: profile.language
        })
        .eq('id', profile.id)

      if (error) throw error
      
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const saveNotifications = async () => {
    try {
      setIsSaving(true)
      // In a real app, this would save to a user_settings table
      toast.success('Notification settings updated')
    } catch (error) {
      console.error('Error saving notifications:', error)
      toast.error('Failed to update notifications')
    } finally {
      setIsSaving(false)
    }
  }

  const savePrivacy = async () => {
    try {
      setIsSaving(true)
      // In a real app, this would save to a user_settings table
      toast.success('Privacy settings updated')
    } catch (error) {
      console.error('Error saving privacy settings:', error)
      toast.error('Failed to update privacy settings')
    } finally {
      setIsSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setIsSaving(true)
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })

      if (error) throw error
      
      setPasswordData({ current: '', new: '', confirm: '' })
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setIsSaving(true)
      // In a real app, this would handle account deletion
      toast.success('Account deletion request submitted')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsSaving(false)
    }
  }

  const exportData = async () => {
    try {
      setIsSaving(true)
      // In a real app, this would generate and download user data
      toast.success('Data export started. You will receive an email when ready.')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Failed to load profile data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your email
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Company Name</label>
                  <Input
                    value={profile.company_name}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Website</label>
                  <Input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={saveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {key === 'email_notifications' && 'Receive notifications via email'}
                      {key === 'push_notifications' && 'Receive push notifications in browser'}
                      {key === 'marketing_emails' && 'Receive marketing and promotional emails'}
                      {key === 'weekly_reports' && 'Get weekly performance reports'}
                      {key === 'post_reminders' && 'Reminders for scheduled posts'}
                      {key === 'engagement_alerts' && 'Alerts for high engagement posts'}
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, [key]: checked })
                    }
                  />
                </div>
              ))}

              <Button onClick={saveNotifications} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Profile Visibility</div>
                  <div className="text-sm text-muted-foreground">
                    Control who can see your profile information
                  </div>
                </div>
                <select
                  value={privacy.profile_visibility}
                  onChange={(e) => setPrivacy({ 
                    ...privacy, 
                    profile_visibility: e.target.value as 'public' | 'private' 
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Analytics Sharing</div>
                  <div className="text-sm text-muted-foreground">
                    Share anonymized analytics to improve the platform
                  </div>
                </div>
                <Switch
                  checked={privacy.analytics_sharing}
                  onCheckedChange={(checked) => 
                    setPrivacy({ ...privacy, analytics_sharing: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Data Export</div>
                  <div className="text-sm text-muted-foreground">
                    Allow exporting your data at any time
                  </div>
                </div>
                <Switch
                  checked={privacy.data_export_enabled}
                  onCheckedChange={(checked) => 
                    setPrivacy({ ...privacy, data_export_enabled: checked })
                  }
                />
              </div>

              <Button onClick={savePrivacy} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>

              <Button onClick={changePassword} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable 2FA</div>
                  <div className="text-sm text-muted-foreground">
                    Use an authenticator app for additional security
                  </div>
                </div>
                <Switch
                  checked={privacy.two_factor_enabled}
                  onCheckedChange={(checked) => 
                    setPrivacy({ ...privacy, two_factor_enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or delete your account data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Export Data</div>
                  <div className="text-sm text-muted-foreground">
                    Download all your data in JSON format
                  </div>
                </div>
                <Button variant="outline" onClick={exportData} disabled={isSaving}>
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <div className="font-medium text-red-900">Delete Account</div>
                  <div className="text-sm text-red-700">
                    Permanently delete your account and all data
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={deleteAccount} 
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Manage API keys and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">API Key</div>
                    <div className="text-sm text-muted-foreground">
                      Use this key to access the SocialAI API
                    </div>
                  </div>
                  <Button variant="outline">
                    Generate Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}