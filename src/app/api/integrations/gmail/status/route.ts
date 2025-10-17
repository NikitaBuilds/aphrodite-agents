import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { connected: false, email: null },
        { status: 200 }
      );
    }

    // Get Gmail connection status from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gmail_connected, gmail_email, gmail_token_expiry")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log("No profile found or error fetching:", profileError);
      return NextResponse.json(
        { connected: false, email: null },
        { status: 200 }
      );
    }

    const connected = (profile as any)?.gmail_connected || false;
    const email = (profile as any)?.gmail_email || null;
    const tokenExpiry = (profile as any)?.gmail_token_expiry || null;

    return NextResponse.json({
      connected,
      email,
      tokenExpiry,
    });
  } catch (error) {
    console.error("Gmail status check error:", error);
    return NextResponse.json(
      { connected: false, email: null },
      { status: 200 }
    );
  }
}
