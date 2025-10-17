import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Clear Asana credentials from profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        asana_connected: false,
        asana_access_token: null,
        asana_refresh_token: null,
        asana_token_expiry: null,
        asana_user_id: null,
        asana_workspace_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to disconnect Asana:", updateError);
      return NextResponse.json(
        { error: "Failed to disconnect Asana" },
        { status: 500 }
      );
    }

    console.log(`✅ Asana disconnected for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Asana disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Asana" },
      { status: 500 }
    );
  }
}
