"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Checkbox } from "@/components/ui/checkbox"

type UserType = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
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

export function UsersClient({
  initialUsers,
  userTypes,
  tags,
}: {
  initialUsers: User[]
  userTypes: UserType[]
  tags: Tag[]
}) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    user_type_id: "",
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
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

    // Insert tags
    if (selectedTags.length > 0) {
      const tagInserts = selectedTags.map((tagId) => ({
        user_id: user.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("user_tags").insert(tagInserts)

      if (tagError) {
        console.error("Error adding tags:", tagError)
      }
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

    // Update tags: delete existing and insert new
    await supabase.from("user_tags").delete().eq("user_id", editingUser.id)

    if (selectedTags.length > 0) {
      const tagInserts = selectedTags.map((tagId) => ({
        user_id: editingUser.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("user_tags").insert(tagInserts)

      if (tagError) {
        console.error("Error updating tags:", tagError)
      }
    }

    setEditingUser(null)
    setFormData({ email: "", name: "", user_type_id: "" })
    setSelectedTags([])
    router.refresh()
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
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

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground mt-1">Manage users and their types and tags</p>
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
                          {userTypes.map((type) => (
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
                        {tags.map((tag) => (
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
                  <TableHead>User Type</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {user.user_type ? (
                          <Badge variant="secondary">{user.user_type.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.user_tags && user.user_tags.length > 0 ? (
                            user.user_tags.map((ut) => (
                              <Badge key={ut.tag.id} variant="outline">
                                {ut.tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
        </div>
      </main>

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
                    {userTypes.map((type) => (
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
                  {tags.map((tag) => (
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
