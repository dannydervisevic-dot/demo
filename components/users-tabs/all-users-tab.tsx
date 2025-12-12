"use client"

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Filter, Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserType = {
  id: string
  name: string
  description?: string | null
}

type Tag = {
  id: string
  name: string
  description?: string | null
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

const MOCK_USER_TYPES: UserType[] = [
  { id: "1", name: "Admin", description: "Administrator with full access" },
  { id: "2", name: "Manager", description: "Manager with elevated permissions" },
  { id: "3", name: "User", description: "Standard user account" },
  { id: "4", name: "Guest", description: "Limited guest access" },
]

const MOCK_TAGS: Tag[] = [
  { id: "1", name: "VIP", description: "Very Important Person status" },
  { id: "2", name: "Beta Tester", description: "Early access beta tester" },
  { id: "3", name: "Premium Member", description: "Premium subscription member" },
  { id: "4", name: "Early Adopter", description: "Early adopter of the platform" },
]

const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    user_type_id: "1",
    user_type: MOCK_USER_TYPES[0],
    user_tags: [{ tag: MOCK_TAGS[0] }, { tag: MOCK_TAGS[3] }],
    created_at: new Date("2024-01-15").toISOString(),
    updated_at: new Date("2024-01-15").toISOString(),
  },
  {
    id: "2",
    email: "sarah.smith@example.com",
    name: "Sarah Smith",
    user_type_id: "2",
    user_type: MOCK_USER_TYPES[1],
    user_tags: [{ tag: MOCK_TAGS[0] }, { tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-02-10").toISOString(),
    updated_at: new Date("2024-02-10").toISOString(),
  },
  {
    id: "3",
    email: "mike.johnson@example.com",
    name: "Mike Johnson",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[1] }],
    created_at: new Date("2024-03-05").toISOString(),
    updated_at: new Date("2024-03-05").toISOString(),
  },
  {
    id: "4",
    email: "emily.davis@example.com",
    name: "Emily Davis",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-03-20").toISOString(),
    updated_at: new Date("2024-03-20").toISOString(),
  },
  {
    id: "5",
    email: "david.wilson@example.com",
    name: "David Wilson",
    user_type_id: "2",
    user_type: MOCK_USER_TYPES[1],
    user_tags: [{ tag: MOCK_TAGS[1] }, { tag: MOCK_TAGS[3] }],
    created_at: new Date("2024-04-12").toISOString(),
    updated_at: new Date("2024-04-12").toISOString(),
  },
  {
    id: "6",
    email: "lisa.brown@example.com",
    name: "Lisa Brown",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-05-08").toISOString(),
    updated_at: new Date("2024-05-08").toISOString(),
  },
  {
    id: "7",
    email: "james.taylor@example.com",
    name: "James Taylor",
    user_type_id: "4",
    user_type: MOCK_USER_TYPES[3],
    user_tags: [],
    created_at: new Date("2024-06-01").toISOString(),
    updated_at: new Date("2024-06-01").toISOString(),
  },
  {
    id: "8",
    email: "anna.martinez@example.com",
    name: "Anna Martinez",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-07-15").toISOString(),
    updated_at: new Date("2024-07-15").toISOString(),
  },
  {
    id: "9",
    email: "robert.anderson@example.com",
    name: "Robert Anderson",
    user_type_id: "2",
    user_type: MOCK_USER_TYPES[1],
    user_tags: [{ tag: MOCK_TAGS[0] }],
    created_at: new Date("2024-08-22").toISOString(),
    updated_at: new Date("2024-08-22").toISOString(),
  },
  {
    id: "10",
    email: "jennifer.thomas@example.com",
    name: "Jennifer Thomas",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[1] }, { tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-09-10").toISOString(),
    updated_at: new Date("2024-09-10").toISOString(),
  },
]

export function AllUsersTab({
  initialUsers,
  userTypes,
  tags,
}: {
  initialUsers: User[]
  userTypes: UserType[]
  tags: Tag[]
}) {
  const hasRealData = initialUsers.length > 0 || userTypes.length > 0 || tags.length > 0
  const effectiveUsers = hasRealData ? initialUsers : MOCK_USERS
  const effectiveUserTypes = hasRealData ? userTypes : MOCK_USER_TYPES
  const effectiveTags = hasRealData ? tags : MOCK_TAGS

  const [users, setUsers] = useState<User[]>(effectiveUsers)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    user_type_id: "",
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUserTypes, setFilterUserTypes] = useState<string[]>([])
  const [filterTags, setFilterTags] = useState<string[]>([])
  const router = useRouter()
  const supabase = createBrowserClient()

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesUserType =
        filterUserTypes.length === 0 || (user.user_type_id && filterUserTypes.includes(user.user_type_id))

      const matchesTag = filterTags.length === 0 || user.user_tags?.some((ut) => filterTags.includes(ut.tag.id))

      return matchesSearch && matchesUserType && matchesTag
    })
  }, [users, searchQuery, filterUserTypes, filterTags])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasRealData) {
      alert("Mock data mode - database not connected. Set up database to persist changes.")
      return
    }

    setIsLoading(true)

    const userData = {
      ...formData,
      user_type_id: formData.user_type_id || null,
    }

    const { data: user, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) {
      console.error("Error creating user:", error)
      alert("Failed to create user")
      setIsLoading(false)
      return
    }

    if (selectedTags.length > 0) {
      const tagInserts = selectedTags.map((tagId) => ({
        user_id: user.id,
        tag_id: tagId,
      }))

      await supabase.from("user_tags").insert(tagInserts)
    }

    setIsCreateOpen(false)
    setFormData({ email: "", name: "", user_type_id: "" })
    setSelectedTags([])
    router.refresh()
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (!hasRealData) {
      alert("Mock data mode - database not connected. Set up database to persist changes.")
      return
    }

    setIsLoading(true)

    const userData = {
      ...formData,
      user_type_id: formData.user_type_id || null,
    }

    const { error } = await supabase.from("users").update(userData).eq("id", editingUser.id)

    if (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user")
      setIsLoading(false)
      return
    }

    await supabase.from("user_tags").delete().eq("user_id", editingUser.id)

    if (selectedTags.length > 0) {
      const tagInserts = selectedTags.map((tagId) => ({
        user_id: editingUser.id,
        tag_id: tagId,
      }))

      await supabase.from("user_tags").insert(tagInserts)
    }

    setEditingUser(null)
    setFormData({ email: "", name: "", user_type_id: "" })
    setSelectedTags([])
    router.refresh()
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!hasRealData) {
      alert("Mock data mode - database not connected. Set up database to persist changes.")
      return
    }

    if (!confirm("Are you sure you want to delete this user?")) return

    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user")
    } else {
      setUsers(users.filter((user) => user.id !== id))
      router.refresh()
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      user_type_id: user.user_type_id || "",
    })
    setSelectedTags(user.user_tags?.map((ut) => ut.tag.id) || [])
  }

  const closeEditDialog = () => {
    setEditingUser(null)
    setFormData({ email: "", name: "", user_type_id: "" })
    setSelectedTags([])
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterUserTypes([])
    setFilterTags([])
  }

  const toggleUserTypeFilter = (typeId: string) => {
    setFilterUserTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const toggleTagFilter = (tagId: string) => {
    setFilterTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  useEffect(() => {
    if (hasRealData) {
      // Fetch real data from the database
      const fetchUsers = async () => {
        const { data, error } = await supabase.from("users").select("*")
        if (error) {
          console.error("Error fetching users:", error)
        } else {
          setUsers(data)
        }
      }

      fetchUsers()
    }
  }, [hasRealData, supabase])

  return (
    <div className="space-y-4">
      {!hasRealData && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <strong>Preview Mode:</strong> Showing mock data. Connect your database on the{" "}
            <a href="/setup" className="underline font-medium">
              setup page
            </a>{" "}
            to persist real data.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {(searchQuery || filterUserTypes.length > 0 || filterTags.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <AlertCircle className="h-4 w-4 mr-1" />
              Clear Filters
              {filterUserTypes.length + filterTags.length > 0 && (
                <span className="ml-1 text-xs">({filterUserTypes.length + filterTags.length})</span>
              )}
            </Button>
          )}
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
                <DialogDescription>Add a new user to the system</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user_type">User Type</Label>
                  <Select
                    value={formData.user_type_id}
                    onValueChange={(value) => setFormData({ ...formData, user_type_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      {effectiveUserTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tags</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {effectiveTags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  User Type
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hover:bg-accent rounded p-1">
                        <Filter
                          className={`h-4 w-4 ${filterUserTypes.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Filter by User Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {effectiveUserTypes.map((type) => (
                        <DropdownMenuCheckboxItem
                          key={type.id}
                          checked={filterUserTypes.includes(type.id)}
                          onCheckedChange={() => toggleUserTypeFilter(type.id)}
                        >
                          {type.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {filterUserTypes.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <button
                            onClick={() => setFilterUserTypes([])}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                          >
                            Clear filter
                          </button>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Tags
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hover:bg-accent rounded p-1">
                        <Filter
                          className={`h-4 w-4 ${filterTags.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {effectiveTags.map((tag) => (
                        <DropdownMenuCheckboxItem
                          key={tag.id}
                          checked={filterTags.includes(tag.id)}
                          onCheckedChange={() => toggleTagFilter(tag.id)}
                        >
                          {tag.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {filterTags.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <button
                            onClick={() => setFilterTags([])}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                          >
                            Clear filter
                          </button>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {users.length === 0 ? "No users found. Create one to get started." : "No users match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.user_type ? (
                      <Badge variant="secondary">{user.user_type.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.user_tags && user.user_tags.length > 0 ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <button className="text-sm font-medium text-primary hover:underline cursor-pointer">
                              {user.user_tags.length} {user.user_tags.length === 1 ? "tag" : "tags"}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="p-3 max-w-xs" side="top">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">User Tags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {user.user_tags.map((ut) => (
                                  <Badge key={ut.tag.id} variant="secondary" className="text-xs">
                                    {ut.tag.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update the user information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-user_type">User Type</Label>
                <Select
                  value={formData.user_type_id}
                  onValueChange={(value) => setFormData({ ...formData, user_type_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {effectiveUserTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                  {effectiveTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-tag-${tag.id}`}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <label
                        htmlFor={`edit-tag-${tag.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
