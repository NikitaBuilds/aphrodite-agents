import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // user ID
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Asana OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?asana_error=${encodeURIComponent(
          error
        )}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?asana_error=missing_parameters`
      );
    }

    const supabase = await createClient();

    // Verify user is still authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?asana_error=authentication_failed`
      );
    }

    // Exchange authorization code for tokens
    const clientId = process.env.ASANA_CLIENT_ID;
    const clientSecret = process.env.ASANA_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/asana/callback`;

    const tokenResponse = await fetch("https://app.asana.com/-/oauth_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Asana token exchange failed:", errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?asana_error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, data } = tokens;

    // Calculate token expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 3600));

    // Get user's Asana info from token data
    const asanaUserId = data?.id || null;
    const asanaWorkspaceId = data?.workspaces?.[0]?.gid || null;

    console.log(
      `Successfully got Asana tokens for user ${user.id} (Asana User ID: ${asanaUserId})`
    );

    // Store tokens in Supabase profiles table
    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      asana_access_token: access_token,
      asana_refresh_token: refresh_token,
      asana_token_expiry: expiresAt.toISOString(),
      asana_user_id: asanaUserId,
      asana_workspace_id: asanaWorkspaceId,
      asana_connected: true,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error("Failed to store Asana tokens:", updateError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?asana_error=storage_failed`
      );
    }

    console.log(`✅ Asana connected successfully for user ${user.id}`);

    // Success! Redirect back to app
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?asana_connected=true`
    );
  } catch (error) {
    console.error("Asana OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?asana_error=unknown`
    );
  }
}
