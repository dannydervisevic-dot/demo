import { createClient } from "@/lib/supabase/server"
import { UsersManagementClient } from "@/components/users-management-client"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const supabase = await createClient()

  const [{ data: users, error: usersError }, { data: userTypes }, { data: tags }] = await Promise.all([
    supabase
      .from("users")
      .select(`
        *,
        user_type:user_types(id, name),
        user_tags(tag:tags(id, name))
      `)
      .order("created_at", { ascending: false }),
    supabase.from("user_types").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
  ])

  // If there's an error (tables don't exist), use mock data to show the UI
  const useMockData = usersError !== null

  return (
    <UsersManagementClient
      initialUsers={users || []}
      initialUserTypes={userTypes || []}
      initialTags={tags || []}
      useMockData={useMockData}
    />
  )
}
