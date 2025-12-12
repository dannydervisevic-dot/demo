import { createClient } from "@/lib/supabase/server"
import { TagsClient } from "@/components/tags-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TagsPage() {
  const supabase = await createClient()

  const { data: tags, error } = await supabase.from("tags").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching tags:", error)

    if (error.message?.includes("Too Many Requests") || error.message?.includes("rate limit")) {
      redirect("/error?message=rate-limit")
    }

    if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
      redirect("/setup")
    }

    redirect("/error?message=connection-error")
  }

  return <TagsClient initialTags={tags || []} />
}
