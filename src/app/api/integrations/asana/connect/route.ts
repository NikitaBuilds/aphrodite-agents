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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get Asana OAuth credentials from environment
    const clientId = process.env.ASANA_CLIENT_ID;
    const clientSecret = process.env.ASANA_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/asana/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error:
            "Asana OAuth not configured. Please set ASANA_CLIENT_ID and ASANA_CLIENT_SECRET in your environment.",
        },
        { status: 500 }
      );
    }

    // Build Asana OAuth authorization URL
    // Asana OAuth docs: https://developers.asana.com/docs/oauth
    const authUrl = new URL("https://app.asana.com/-/oauth_authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", user.id); // Pass user ID for verification

    console.log(`Redirecting user ${user.id} to Asana OAuth`);

    // Redirect user to Asana OAuth consent screen
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Asana OAuth connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
