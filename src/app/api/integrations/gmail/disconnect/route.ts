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

    // Remove Gmail tokens from database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        gmail_access_token: null,
        gmail_refresh_token: null,
        gmail_token_expiry: null,
        gmail_email: null,
        gmail_connected: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to disconnect Gmail:", updateError);
      return NextResponse.json(
        { error: "Failed to disconnect Gmail" },
        { status: 500 }
      );
    }

    console.log(`Gmail disconnected for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gmail disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Gmail" },
      { status: 500 }
    );
  }
}
