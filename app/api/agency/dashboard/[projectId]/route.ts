import { isSameDay } from "date-fns";
import { TrialStatus } from "./../../../../../lib/stripe/trial-utils";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { aiMarketingAgency } from "@/lib/ai/agency-automation";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;

    // Get cookies and create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("client_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get dashboard data
    const dashboardData = await aiMarketingAgency.getClientDashboard(projectId);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Agency dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
