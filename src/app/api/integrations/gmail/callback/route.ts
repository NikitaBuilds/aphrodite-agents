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
      console.error("Gmail OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?gmail_error=${encodeURIComponent(
          error
        )}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?gmail_error=missing_parameters`
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
        `${process.env.NEXT_PUBLIC_APP_URL}/?gmail_error=authentication_failed`
      );
    }

    // Exchange authorization code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/gmail/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?gmail_error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Calculate token expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Get user's email from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let gmailEmail = null;
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      gmailEmail = userInfo.email;
    }

    console.log(
      `Successfully got Gmail tokens for user ${user.id} (${gmailEmail})`
    );

    // Store tokens in Supabase profiles table
    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      gmail_access_token: access_token,
      gmail_refresh_token: refresh_token,
      gmail_token_expiry: expiresAt.toISOString(),
      gmail_email: gmailEmail,
      gmail_connected: true,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error("Failed to store Gmail tokens:", updateError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?gmail_error=storage_failed`
      );
    }

    console.log(`✅ Gmail connected successfully for user ${user.id}`);

    // Success! Redirect back to app
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?gmail_connected=true`
    );
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?gmail_error=unknown`
    );
  }
}
