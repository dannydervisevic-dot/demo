import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // First, try to check if tables exist by attempting a simple query
    const { error: checkError } = await supabase.from("user_types").select("count").limit(1)

    if (checkError) {
      // Tables don't exist, provide instructions
      return NextResponse.json(
        {
          error: "Database tables not found. Please run the SQL scripts in your Supabase SQL Editor.",
          instructions: [
            "1. Go to your Supabase Dashboard → SQL Editor",
            "2. Run the scripts/001_create_database_schema.sql script",
            "3. Run the scripts/002_seed_sample_data.sql script",
            "4. Run the scripts/003_seed_random_users.sql script",
            "5. Refresh this page",
          ],
        },
        { status: 400 },
      )
    }

    // Tables exist, seed initial data if empty
    const { data: existingTypes, error: typesError } = await supabase.from("user_types").select("count")

    if (!typesError && (!existingTypes || existingTypes.length === 0)) {
      await supabase.from("user_types").insert([
        { name: "Admin", description: "Administrator with full access" },
        { name: "Manager", description: "Manager with elevated permissions" },
        { name: "User", description: "Standard user" },
        { name: "Guest", description: "Guest user with limited access" },
      ])

      await supabase.from("tags").insert([
        { name: "VIP", description: "Very important person" },
        { name: "Beta Tester", description: "Beta testing participant" },
        { name: "Premium Member", description: "Premium subscription member" },
        { name: "Early Adopter", description: "Early platform adopter" },
      ])
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("[v0] Database setup error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize database" },
      { status: 500 },
    )
  }
}
