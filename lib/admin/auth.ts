import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export type AdminRole = "super_admin" | "user";
// Super admin email
export const SUPER_ADMIN_EMAIL = "mntomfordigitalllc@gmail.com";

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions: Record<string, boolean>;
  is_active: boolean;
  last_login_at: string | undefined;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

export interface AdminSession {
  id: string;
  admin_user_id: string;
  session_token: string;
  expires_at: string;
  is_active: boolean;
}

// Server-side admin authentication
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select(
        `
        *,
        profiles!inner(
          full_name,
          email,
          avatar_url
        )
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (error || !adminUser) {
      return null;
    }

    return {
      ...adminUser,
      profile: adminUser.profiles,
    };
  } catch (error) {
    console.error("Error getting admin user:", error);
    return null;
  }
}

// Client-side admin authentication
export async function getAdminUserClient(): Promise<AdminUser | null> {
  try {
    const supabase = createBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select(
        `
        *,
        profiles!inner(
          full_name,
          email,
          avatar_url
        )
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (error || !adminUser) {
      return null;
    }

    return {
      ...adminUser,
      profile: adminUser.profiles,
    };
  } catch (error) {
    console.error("Error getting admin user:", error);
    return null;
  }
}

// Check if user has specific admin role
export async function hasAdminRole(
  requiredRole: AdminRole | AdminRole[]
): Promise<boolean> {
  const adminUser = await getAdminUser();
  if (!adminUser) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(adminUser.role);
}

// Check if user has specific permission
export async function hasPermission(permission: string): Promise<boolean> {
  const adminUser = await getAdminUser();
  if (!adminUser) return false;

  // Super admins have all permissions
  if (adminUser.role === "super_admin") return true;

  return adminUser.permissions[permission] === true;
}

// Create admin session (server-side only)
export async function createAdminSession(
  adminUserId: string
): Promise<AdminSession | null> {
  try {
    const supabase = createClient();
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { data: session, error } = await supabase
      .from("admin_sessions")
      .insert({
        admin_user_id: adminUserId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: "127.0.0.1", // Would get real IP in production
        user_agent: "Admin Dashboard",
      })
      .select()
      .single();

    if (error) throw error;

    return session;
  } catch (error) {
    console.error("Error creating admin session:", error);
    return null;
  }
}

// Validate admin session (server-side only)
export async function validateAdminSession(): Promise<AdminUser | null> {
  try {
    // This would need to be implemented with proper session management
    // For now, just return the admin user if they exist
    return await getAdminUser();
  } catch (error) {
    console.error("Error validating admin session:", error);
    return null;
  }
}

// Log admin action (server-side only)
export async function logAdminAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc("log_admin_action", {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_old_values: oldValues,
      p_new_values: newValues,
    });
  } catch (error) {
    console.error("Error logging admin action:", error);
  }
}

// Simplified admin role hierarchy
export const ADMIN_ROLES = {
  super_admin: {
    name: "Super Admin",
    level: 2,
    permissions: ["*"], // All permissions
    description: "Complete website control and management",
  },
  user: {
    name: "User",
    level: 1,
    permissions: [
      "manage_own_profile",
      "manage_own_posts",
      "view_own_analytics",
      "manage_own_social_accounts",
    ],
    description: "Manage own data and content only",
  },
} as const;

// Default permissions for each role
export const DEFAULT_PERMISSIONS = {
  super_admin: {
    // Complete website control
    manage_admins: true,
    manage_users: true,
    manage_posts: true,
    manage_settings: true,
    view_analytics: true,
    manage_reports: true,
    system_maintenance: true,
    data_export: true,
    user_impersonation: true,
    platform_configuration: true,
    billing_management: true,
    security_monitoring: true,
  },
  user: {
    // Own data only
    manage_own_profile: true,
    manage_own_posts: true,
    view_own_analytics: true,
    manage_own_social_accounts: true,
    manage_own_billing: true,
  },
} as const;
