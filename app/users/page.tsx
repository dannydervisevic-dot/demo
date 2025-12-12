import { createClient } from "@/lib/supabase/server"
import { UsersManagementClient } from "@/components/users-management-client"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const supabase = await createClient()

  const [{ data: users, error: usersError }, { data: userTypes }, { data: tags }] = await Promise.all([
    supabase
      .from("users")
      .select(`
        id,
        email,
        name,
        phone_number,
        language,
        user_type_id,
        created_at,
        updated_at,
        user_type:user_types(id, name),
        user_tags(tag:tags(id, name))
      `)
      .order("created_at", { ascending: false }),
    supabase.from("user_types").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
  ])

  const databaseError = usersError?.message?.includes("relation") || usersError?.message?.includes("does not exist")

  return (
    <UsersManagementClient
      initialUsers={users || []}
      initialUserTypes={userTypes || []}
      initialTags={tags || []}
      useMockData={databaseError}
    />
  )
}
