import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        connected: false,
        error: "Not authenticated",
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("asana_connected, asana_user_id, asana_workspace_id")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      connected: profile?.asana_connected || false,
      userId: profile?.asana_user_id || null,
      workspaceId: profile?.asana_workspace_id || null,
    });
  } catch (error) {
    console.error("Asana status check error:", error);
    return NextResponse.json({
      connected: false,
      error: "Failed to check status",
    });
  }
}
