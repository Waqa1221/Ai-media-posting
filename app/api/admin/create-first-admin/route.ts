import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Define proper TypeScript interfaces
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface AdminUser {
  id: string;
  role: string;
}

export async function POST(req: Request) {
  try {
    const email = "mntomfordigitalllc@gmail.com"; // Fixed super admin email
    const role = "super_admin";

    // Use service role client for admin operations
    const supabase = createServiceRoleClient();

    // Get user profile with proper typing
    const { data: profile, error: profileError } = (await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", email)
      .single()) as { data: Profile | null; error: any };

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error:
            "User not found with that email address. Please ensure the user has signed up first.",
        },
        { status: 404 }
      );
    }

    // Check if user is already an admin with proper typing
    const { data: existingAdmin, error: adminCheckError } = (await supabase
      .from("admin_users")
      .select("id, role")
      .eq("user_id", profile.id)
      .maybeSingle()) as { data: AdminUser | null; error: any };

    if (adminCheckError) {
      console.error("Error checking existing admin:", adminCheckError);
    }

    if (existingAdmin) {
      return NextResponse.json(
        { error: `User is already an admin with role: ${existingAdmin.role}` },
        { status: 400 }
      );
    }

    // Set permissions based on role
    const permissions = {
      // Complete website control for super admin
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
      financial_data: true,
    };

    // Create admin user
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .insert({
        user_id: profile.id,
        role,
        permissions,
        is_active: true,
      })
      .select()
      .single();

    if (adminError) {
      console.error("Error creating admin user:", adminError);
      return NextResponse.json(
        { error: "Failed to create admin user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${role.replace(
        "_",
        " "
      )} role assigned successfully to ${email}`,
      adminUser: {
        id: adminUser.id,
        role: adminUser.role,
        email: profile.email,
        full_name: profile.full_name,
      },
    });
  } catch (error) {
    console.error("Create first admin API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
