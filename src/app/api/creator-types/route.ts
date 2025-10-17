import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get distinct creator types, excluding null values
    const { data, error } = await supabase
      .from("profiles")
      .select("creator_type")
      .not("creator_type", "is", null)
      .order("creator_type");

    if (error) {
      console.error("Error fetching creator types:", error);
      return NextResponse.json(
        { error: "Failed to fetch creator types" },
        { status: 500 }
      );
    }

    // Extract unique creator types and clean them up
    const uniqueTypes = Array.from(
      new Set(
        data
          .map((item) => item.creator_type)
          .filter((type) => type && type.trim() !== "")
          .map((type) => type.trim())
      )
    ).sort();

    return NextResponse.json({ creatorTypes: uniqueTypes });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
