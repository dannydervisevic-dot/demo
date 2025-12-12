import { createClient } from "@/lib/supabase/server"
import { UserTypesClient } from "@/components/user-types-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function UserTypesPage() {
  const supabase = await createClient()

  const { data: userTypes, error } = await supabase
    .from("user_types")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching user types:", error)

    if (error.message?.includes("Too Many Requests") || error.message?.includes("rate limit")) {
      redirect("/error?message=rate-limit")
    }

    if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
      redirect("/setup")
    }

    redirect("/error?message=connection-error")
  }

  return <UserTypesClient initialUserTypes={userTypes || []} />
}
