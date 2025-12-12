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
import { Filter, Plus, Pencil, Trash2, AlertCircle, Eye } from "lucide-react"
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
  phone_number?: string | null
  language?: string | null
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
    id: "USR-2024-001",
    email: "john.doe@example.com",
    name: "John Doe",
    phone_number: "+1-555-0101",
    language: "English",
    user_type_id: "1",
    user_type: MOCK_USER_TYPES[0],
    user_tags: [{ tag: MOCK_TAGS[0] }, { tag: MOCK_TAGS[3] }],
    created_at: new Date("2024-01-15").toISOString(),
    updated_at: new Date("2024-01-15").toISOString(),
  },
  {
    id: "USR-2024-002",
    email: "sarah.smith@example.com",
    name: "Sarah Smith",
    phone_number: "+1-555-0102",
    language: "English",
    user_type_id: "2",
    user_type: MOCK_USER_TYPES[1],
    user_tags: [{ tag: MOCK_TAGS[0] }, { tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-02-10").toISOString(),
    updated_at: new Date("2024-02-10").toISOString(),
  },
  {
    id: "USR-2024-003",
    email: "mike.johnson@example.com",
    name: "Mike Johnson",
    phone_number: "+1-555-0103",
    language: "Spanish",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[1] }],
    created_at: new Date("2024-03-05").toISOString(),
    updated_at: new Date("2024-03-05").toISOString(),
  },
  {
    id: "USR-2024-004",
    email: "emily.davis@example.com",
    name: "Emily Davis",
    phone_number: "+1-555-0104",
    language: "English",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-03-20").toISOString(),
    updated_at: new Date("2024-03-20").toISOString(),
  },
  {
    id: "USR-2024-005",
    email: "david.wilson@example.com",
    name: "David Wilson",
    phone_number: "+1-555-0105",
    language: "French",
    user_type_id: "2",
    user_type: MOCK_USER_TYPES[1],
    user_tags: [{ tag: MOCK_TAGS[1] }, { tag: MOCK_TAGS[3] }],
    created_at: new Date("2024-04-12").toISOString(),
    updated_at: new Date("2024-04-12").toISOString(),
  },
  {
    id: "USR-2024-006",
    email: "lisa.brown@example.com",
    name: "Lisa Brown",
    phone_number: "+1-555-0106",
    language: "English",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-05-08").toISOString(),
    updated_at: new Date("2024-05-08").toISOString(),
  },
  {
    id: "USR-2024-007",
    email: "james.taylor@example.com",
    name: "James Taylor",
    phone_number: null,
    language: "English",
    user_type_id: "4",
    user_type: MOCK_USER_TYPES[3],
    user_tags: [],
    created_at: new Date("2024-06-01").toISOString(),
    updated_at: new Date("2024-06-01").toISOString(),
  },
  {
    id: "USR-2024-008",
    email: "anna.martinez@example.com",
    name: "Anna Martinez",
    phone_number: "+1-555-0108",
    language: "Spanish",
    user_type_id: "3",
    user_type: MOCK_USER_TYPES[2],
    user_tags: [{ tag: MOCK_TAGS[2] }],
    created_at: new Date("2024-07-15").toISOString(),
    updated_at: new Date("2024-07-15").toISOString(),
  },
  {
    id: "USR-2024-009",
    email: "robert.anderson@example.com",
    name: "Robert Anderson",
    phone_number: "+1-555-0109",
    language: "English",
    user_type_id: "2",
    user_type: MOCK_USER_TYPES[1],
    user_tags: [{ tag: MOCK_TAGS[0] }],
    created_at: new Date("2024-08-22").toISOString(),
    updated_at: new Date("2024-08-22").toISOString(),
  },
  {
    id: "USR-2024-010",
    email: "jennifer.thomas@example.com",
    name: "Jennifer Thomas",
    phone_number: "+1-555-0110",
    language: "German",
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

  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone_number: "",
    language: "",
    user_type_id: "",
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [filterUserId, setFilterUserId] = useState("")
  const [filterName, setFilterName] = useState("")
  const [filterEmail, setFilterEmail] = useState("")
  const [filterPhone, setFilterPhone] = useState("")
  const [filterLanguages, setFilterLanguages] = useState<string[]>([])
  const [filterUserTypes, setFilterUserTypes] = useState<string[]>([])
  const [filterTags, setFilterTags] = useState<string[]>([])

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    email: true,
    phone: true,
    language: true,
    userType: true,
    tags: true,
    created: true,
  })

  const router = useRouter()
  const supabase = createBrowserClient()

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.language?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesUserId = filterUserId === "" || user.id?.toLowerCase().includes(filterUserId.toLowerCase())
      const matchesName = filterName === "" || user.name?.toLowerCase().includes(filterName.toLowerCase())
      const matchesEmail = filterEmail === "" || user.email?.toLowerCase().includes(filterEmail.toLowerCase())
      const matchesPhone = filterPhone === "" || user.phone_number?.toLowerCase().includes(filterPhone.toLowerCase())
      const matchesLanguage = filterLanguages.length === 0 || (user.language && filterLanguages.includes(user.language))
      const matchesUserType =
        filterUserTypes.length === 0 || (user.user_type_id && filterUserTypes.includes(user.user_type_id))
      const matchesTag = filterTags.length === 0 || user.user_tags?.some((ut) => filterTags.includes(ut.tag.id))

      return (
        matchesSearch &&
        matchesUserId &&
        matchesName &&
        matchesEmail &&
        matchesPhone &&
        matchesLanguage &&
        matchesUserType &&
        matchesTag
      )
    })
  }, [
    users,
    searchQuery,
    filterUserId,
    filterName,
    filterEmail,
    filterPhone,
    filterLanguages,
    filterUserTypes,
    filterTags,
  ])

  const uniqueLanguages = useMemo(() => {
    const langs = new Set<string>()
    users.forEach((user) => {
      if (user.language) langs.add(user.language)
    })
    return Array.from(langs).sort()
  }, [users])

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
      phone_number: formData.phone_number || null,
      language: formData.language || null,
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
    setFormData({ email: "", name: "", phone_number: "", language: "", user_type_id: "" })
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
      phone_number: formData.phone_number || null,
      language: formData.language || null,
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
    setFormData({ email: "", name: "", phone_number: "", language: "", user_type_id: "" })
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
      phone_number: user.phone_number || "",
      language: user.language || "",
      user_type_id: user.user_type_id || "",
    })
    setSelectedTags(user.user_tags?.map((ut) => ut.tag.id) || [])
  }

  const closeEditDialog = () => {
    setEditingUser(null)
    setFormData({ email: "", name: "", phone_number: "", language: "", user_type_id: "" })
    setSelectedTags([])
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // Updated clearFilters to include all column filters
  const clearFilters = () => {
    setSearchQuery("")
    setFilterUserId("")
    setFilterName("")
    setFilterEmail("")
    setFilterPhone("")
    setFilterLanguages([])
    setFilterUserTypes([])
    setFilterTags([])
  }

  const toggleUserTypeFilter = (typeId: string) => {
    setFilterUserTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const toggleTagFilter = (tagId: string) => {
    setFilterTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const toggleLanguageFilter = (language: string) => {
    setFilterLanguages((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]))
  }

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }))
  }

  useEffect(() => {
    if (hasRealData) {
      // Fetch real data from the database
      const fetchUsers = async () => {
        const { data, error } = await supabase.from("users").select(`
          id,
          email,
          name,
          phone_number,
          language,
          user_type_id,
          user_type:user_types(id, name),
          user_tags:user_tags(tag:tags(id, name))
        `)
        if (error) {
          console.error("Error fetching users:", error)
        } else {
          // Ensure data structure matches User type, especially for user_tags
          const formattedData = data.map((user) => ({
            ...user,
            user_type: user.user_type ? user.user_type : null,
            user_tags: user.user_tags || [], // Ensure user_tags is an array
          }))
          setUsers(formattedData)
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
              placeholder="Search by ID, name, email, phone, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={visibleColumns.id} onCheckedChange={() => toggleColumn("id")}>
                User ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.name} onCheckedChange={() => toggleColumn("name")}>
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.email} onCheckedChange={() => toggleColumn("email")}>
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.phone} onCheckedChange={() => toggleColumn("phone")}>
                Phone Number
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.language}
                onCheckedChange={() => toggleColumn("language")}
              >
                Language
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.userType}
                onCheckedChange={() => toggleColumn("userType")}
              >
                User Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.tags} onCheckedChange={() => toggleColumn("tags")}>
                Tags
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.created}
                onCheckedChange={() => toggleColumn("created")}
              >
                Created
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Updated condition to include all column filters */}
          {(searchQuery ||
            filterUserId ||
            filterName ||
            filterEmail ||
            filterPhone ||
            filterLanguages.length > 0 ||
            filterUserTypes.length > 0 ||
            filterTags.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <AlertCircle className="h-4 w-4 mr-1" />
              Clear Filters
              {/* Updated count to include all filter types */}
              {filterUserTypes.length + filterTags.length + filterLanguages.length > 0 && (
                <span className="ml-1 text-xs">
                  ({filterUserTypes.length + filterTags.length + filterLanguages.length})
                </span>
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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1-555-0123"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
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

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.id && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    User ID
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded p-1">
                          <Filter className={`h-4 w-4 ${filterUserId ? "text-primary" : "text-muted-foreground"}`} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <div className="p-2">
                          <Input
                            placeholder="Search User ID..."
                            value={filterUserId}
                            onChange={(e) => setFilterUserId(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        {filterUserId && (
                          <>
                            <DropdownMenuSeparator />
                            <button
                              onClick={() => setFilterUserId("")}
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
              )}
              {visibleColumns.name && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    Name
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded p-1">
                          <Filter className={`h-4 w-4 ${filterName ? "text-primary" : "text-muted-foreground"}`} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <div className="p-2">
                          <Input
                            placeholder="Search name..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        {filterName && (
                          <>
                            <DropdownMenuSeparator />
                            <button
                              onClick={() => setFilterName("")}
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
              )}
              {visibleColumns.email && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    Email
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded p-1">
                          <Filter className={`h-4 w-4 ${filterEmail ? "text-primary" : "text-muted-foreground"}`} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <div className="p-2">
                          <Input
                            placeholder="Search email..."
                            value={filterEmail}
                            onChange={(e) => setFilterEmail(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        {filterEmail && (
                          <>
                            <DropdownMenuSeparator />
                            <button
                              onClick={() => setFilterEmail("")}
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
              )}
              {visibleColumns.phone && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    Phone Number
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded p-1">
                          <Filter className={`h-4 w-4 ${filterPhone ? "text-primary" : "text-muted-foreground"}`} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <div className="p-2">
                          <Input
                            placeholder="Search phone..."
                            value={filterPhone}
                            onChange={(e) => setFilterPhone(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        {filterPhone && (
                          <>
                            <DropdownMenuSeparator />
                            <button
                              onClick={() => setFilterPhone("")}
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
              )}
              {visibleColumns.language && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    Language
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded p-1">
                          <Filter
                            className={`h-4 w-4 ${filterLanguages.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Filter by Language</div>
                        <DropdownMenuSeparator />
                        {uniqueLanguages.map((language) => (
                          <button
                            key={language}
                            className={`w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2 ${filterLanguages.includes(language) ? "bg-accent" : ""}`}
                            onClick={() => toggleLanguageFilter(language)}
                          >
                            <div
                              className={`w-4 h-4 border rounded flex items-center justify-center ${filterLanguages.includes(language) ? "bg-primary border-primary" : ""}`}
                            >
                              {filterLanguages.includes(language) && (
                                <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M10 3L4.5 8.5L2 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            {language}
                          </button>
                        ))}
                        {filterLanguages.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <button
                              onClick={() => setFilterLanguages([])}
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
              )}
              {visibleColumns.userType && (
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
                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Filter by User Type</div>
                        <DropdownMenuSeparator />
                        {effectiveUserTypes.map((type) => (
                          <button
                            key={type.id}
                            className={`w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2 ${filterUserTypes.includes(type.id) ? "bg-accent" : ""}`}
                            onClick={() => toggleUserTypeFilter(type.id)}
                          >
                            <div
                              className={`w-4 h-4 border rounded flex items-center justify-center ${filterUserTypes.includes(type.id) ? "bg-primary border-primary" : ""}`}
                            >
                              {filterUserTypes.includes(type.id) && (
                                <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M10 3L4.5 8.5L2 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            {type.name}
                          </button>
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
              )}
              {visibleColumns.tags && (
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
                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Filter by Tag</div>
                        <DropdownMenuSeparator />
                        {effectiveTags.map((tag) => (
                          <button
                            key={tag.id}
                            className={`w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2 ${filterTags.includes(tag.id) ? "bg-accent" : ""}`}
                            onClick={() => toggleTagFilter(tag.id)}
                          >
                            <div
                              className={`w-4 h-4 border rounded flex items-center justify-center ${filterTags.includes(tag.id) ? "bg-primary border-primary" : ""}`}
                            >
                              {filterTags.includes(tag.id) && (
                                <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M10 3L4.5 8.5L2 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            {tag.name}
                          </button>
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
              )}
              {visibleColumns.created && <TableHead>Created</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}
                  className="text-center text-muted-foreground py-8"
                >
                  {users.length === 0 ? "No users found. Create one to get started." : "No users match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  {visibleColumns.id && (
                    <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                  )}
                  {visibleColumns.name && <TableCell className="font-medium">{user.name}</TableCell>}
                  {visibleColumns.email && <TableCell className="text-muted-foreground">{user.email}</TableCell>}
                  {visibleColumns.phone && (
                    <TableCell className="text-muted-foreground text-sm">
                      {user.phone_number || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  )}
                  {visibleColumns.language && (
                    <TableCell>
                      {user.language ? (
                        <Badge variant="outline">{user.language}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.userType && (
                    <TableCell>
                      {user.user_type ? (
                        <Badge variant="secondary">{user.user_type.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.tags && (
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
                  )}
                  {visibleColumns.created && (
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="+1-555-0123"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
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
