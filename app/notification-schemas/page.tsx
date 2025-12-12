import { createClient } from "@/lib/supabase/server"
import { NotificationSchemasClient } from "@/components/notification-schemas-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function NotificationSchemasPage() {
  const supabase = await createClient()

  const { data: schemas, error } = await supabase
    .from("notification_schemas")
    .select("*")
    .order("level1")
    .order("level2")
    .order("level3")
    .order("level4")

  if (error) {
    console.error("[v0] Error fetching notification schemas:", error)

    if (error.message?.includes("Too Many Requests") || error.message?.includes("rate limit")) {
      redirect("/error?message=rate-limit")
    }

    if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
      redirect("/setup")
    }

    redirect("/error?message=connection-error")
  }

  return <NotificationSchemasClient initialSchemas={schemas || []} />
}
