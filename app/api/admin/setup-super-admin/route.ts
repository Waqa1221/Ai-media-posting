import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in first." },
        { status: 401 }
      );
    }

    // Verify this is the correct email
    if (user.email !== "mntomfordigitalllc@gmail.com") {
      return NextResponse.json(
        {
          error:
            "Access denied. Only mntomfordigitalllc@gmail.com can become super admin.",
        },
        { status: 403 }
      );
    }

    // Call the setup function
    const { data, error } = await supabase.rpc("setup_super_admin");

    if (error) {
      console.error("Error setting up super admin:", error);
      return NextResponse.json(
        { error: `Failed to setup super admin: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
      instruction:
        "Super admin setup completed. You can now access the admin panel.",
    });
  } catch (error) {
    console.error("Setup super admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current authenticated user for context
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check if super admin exists
    const { data: superAdmin, error } = await supabase
      .from("admin_users")
      .select(
        `
        id,
        role,
        is_active,
        created_at,
        profiles!inner(email, full_name)
      `
      )
      .eq("role", "super_admin")
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking super admin:", error);
      return NextResponse.json(
        { error: "Failed to check super admin status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: !!superAdmin,
      currentUser: user
        ? {
            id: user.id,
            email: user.email,
            isAuthenticated: !authError,
            isTargetEmail: user.email === "mntomfordigitalllc@gmail.com",
          }
        : null,
      superAdmin: superAdmin
        ? {
            email: superAdmin.profiles[0]?.email, // Fixed: profiles is an array
            fullName: superAdmin.profiles[0]?.full_name, // Fixed: profiles is an array
            createdAt: superAdmin.created_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Check super admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
