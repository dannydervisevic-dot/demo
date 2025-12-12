"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AllUsersTab } from "@/components/users-tabs/all-users-tab"
import { UserTypesTab } from "@/components/users-tabs/user-types-tab"
import { UserTagsTab } from "@/components/users-tabs/user-tags-tab"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

type UserType = {
  id: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

type Tag = {
  id: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

type User = {
  id: string
  email: string
  name: string
  user_type_id: string | null
  user_type?: UserType | null
  user_tags?: { tag: Tag }[]
  created_at: string
  updated_at: string
}

export function UsersManagementClient({
  initialUsers,
  initialUserTypes,
  initialTags,
  useMockData = false, // Added useMockData prop to enable preview mode
}: {
  initialUsers: User[]
  initialUserTypes: UserType[]
  initialTags: Tag[]
  useMockData?: boolean // New prop to indicate mock data mode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all-users")

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", activeTab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [activeTab, pathname, router, searchParams])

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage users, user types, and user tags</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all-users">All Users</TabsTrigger>
              <TabsTrigger value="user-types">User Types</TabsTrigger>
              <TabsTrigger value="user-tags">User Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="all-users" className="space-y-4">
              <AllUsersTab
                initialUsers={initialUsers}
                userTypes={initialUserTypes}
                tags={initialTags}
                useMockData={useMockData}
              />
            </TabsContent>

            <TabsContent value="user-types" className="space-y-4">
              <UserTypesTab initialUserTypes={initialUserTypes} useMockData={useMockData} />
            </TabsContent>

            <TabsContent value="user-tags" className="space-y-4">
              <UserTagsTab initialTags={initialTags} useMockData={useMockData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
