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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type UserType = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export function UserTypesTab({
  initialUserTypes,
  useMockData = false,
}: { initialUserTypes: UserType[]; useMockData?: boolean }) {
  const mockUserTypes: UserType[] = useMockData
    ? [
        {
          id: "1",
          name: "Admin",
          description: "Administrator with full access",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Manager",
          description: "Manager with elevated permissions",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "User",
          description: "Standard user account",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Guest",
          description: "Limited guest access",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    : initialUserTypes

  const [userTypes, setUserTypes] = useState<UserType[]>(mockUserTypes)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingType, setEditingType] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (useMockData) {
      alert("Preview Mode: Connect database to create user types")
      return
    }
    setIsLoading(true)

    const { data, error } = await supabase.from("user_types").insert([formData]).select().single()

    if (error) {
      console.error("Error creating user type:", error)
      alert("Failed to create user type")
    } else {
      setUserTypes([data, ...userTypes])
      setIsCreateOpen(false)
      setFormData({ name: "", description: "" })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingType) return
    if (useMockData) {
      alert("Preview Mode: Connect database to update user types")
      return
    }
    setIsLoading(true)

    const { data, error } = await supabase
      .from("user_types")
      .update(formData)
      .eq("id", editingType.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user type:", error)
      alert("Failed to update user type")
    } else {
      setUserTypes(userTypes.map((type) => (type.id === data.id ? data : type)))
      setEditingType(null)
      setFormData({ name: "", description: "" })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (useMockData) {
      alert("Preview Mode: Connect database to delete user types")
      return
    }
    if (!confirm("Are you sure you want to delete this user type?")) return

    const { error } = await supabase.from("user_types").delete().eq("id", id)

    if (error) {
      console.error("Error deleting user type:", error)
      alert("Failed to delete user type")
    } else {
      setUserTypes(userTypes.filter((type) => type.id !== id))
      router.refresh()
    }
  }

  const openEditDialog = (type: UserType) => {
    setEditingType(type)
    setFormData({ name: type.name, description: type.description || "" })
  }

  const closeEditDialog = () => {
    setEditingType(null)
    setFormData({ name: "", description: "" })
  }

  return (
    <div className="space-y-4">
      {useMockData && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            Preview Mode: Showing mock data. Connect to database to enable full functionality.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Define different types of users in the system (e.g., Admin, Manager, User, Guest)
        </p>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create User Type</DialogTitle>
                <DialogDescription>Add a new user type to the system</DialogDescription>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
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
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No user types found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              userTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-muted-foreground">{type.description || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(type.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(type)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)}>
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

      <Dialog open={!!editingType} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit User Type</DialogTitle>
              <DialogDescription>Update the user type information</DialogDescription>
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
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
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
