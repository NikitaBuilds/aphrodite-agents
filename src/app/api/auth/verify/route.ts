import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { redis } from "@/lib/redis";

const SESSION_EXPIRY = 60 * 60 * 24; // 24 hours in seconds

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Check if PASSWORD is configured
    if (!process.env.PASSWORD) {
      console.error("PASSWORD environment variable is not set");
      return NextResponse.json(
        { error: "Authentication not configured" },
        { status: 500 }
      );
    }

    // Verify password
    if (password !== process.env.PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString("hex");

    // Store session in Redis with expiration
    await redis.setex(`auth:session:${sessionToken}`, SESSION_EXPIRY, "valid");

    // Create response with cookie
    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie
    response.cookies.set("auth_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_EXPIRY,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
