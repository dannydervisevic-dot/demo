import { createClient } from "@/lib/supabase/server"
import { BroadcastClient } from "@/components/broadcast-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function BroadcastPage() {
  const supabase = await createClient()

  const [{ data: userTypes, error: error1 }, { data: tags }, { data: schemas }, { data: users }] = await Promise.all([
    supabase.from("user_types").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
    supabase.from("notification_schemas").select("*").order("level1").order("level2").order("level3").order("level4"),
    supabase
      .from("users")
      .select(
        `
        *,
        user_type:user_types(id, name),
        user_tags(tag:tags(id, name))
      `,
      )
      .order("name"),
  ])

  if (error1) {
    console.error("[v0] Error fetching data:", error1)

    if (error1.message?.includes("Too Many Requests") || error1.message?.includes("rate limit")) {
      redirect("/error?message=rate-limit")
    }

    if (error1.message?.includes("relation") || error1.message?.includes("does not exist")) {
      redirect("/setup")
    }

    redirect("/error?message=connection-error")
  }

  return <BroadcastClient userTypes={userTypes || []} tags={tags || []} schemas={schemas || []} users={users || []} />
}
