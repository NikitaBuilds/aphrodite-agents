import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("auth_session")?.value;

    if (sessionToken) {
      // Delete session from Redis
      await redis.del(`auth:session:${sessionToken}`);
    }

    // Create response and clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("auth_session");

    return response;
  } catch (error) {
    console.error("Auth logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
