import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser, logAdminAction } from "@/lib/admin/auth";

export async function GET(req: Request) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const tier = searchParams.get("tier") || "all";

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    let query = supabase.from("profiles").select(`
        *,
        subscriptions(*),
        posts(count),
        ai_generations(count)
      `);

    // Apply filters
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`
      );
    }

    if (status !== "all") {
      query = query.eq("subscription_status", status);
    }

    if (tier !== "all") {
      query = query.eq("subscription_tier", tier);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: users,
      error,
      count,
    } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) throw error;

    await logAdminAction("view_users", "users", undefined, undefined, {
      page,
      limit,
      search,
      status,
      tier,
    });

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, userId, data } = await req.json();
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    switch (action) {
      case "suspend":
        const { error: suspendError } = await supabase.rpc("suspend_user", {
          p_user_id: userId,
          p_reason: data.reason,
          p_duration_days: data.duration,
        });
        if (suspendError) throw suspendError;
        break;

      case "unsuspend":
        const { error: unsuspendError } = await supabase.rpc("unsuspend_user", {
          p_user_id: userId,
        });
        if (unsuspendError) throw unsuspendError;
        break;

      case "delete":
        const { error: deleteError } = await supabase.rpc("delete_user_data", {
          p_user_id: userId,
        });
        if (deleteError) throw deleteError;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await logAdminAction(`${action}_user`, "user", userId, null, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
