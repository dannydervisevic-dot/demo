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

type Tag = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export function UserTagsTab({ initialTags, useMockData = false }: { initialTags: Tag[]; useMockData?: boolean }) {
  const mockTags: Tag[] = useMockData
    ? [
        {
          id: "1",
          name: "VIP",
          description: "Very Important Person status",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Beta Tester",
          description: "Early access beta tester",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Premium Member",
          description: "Premium subscription member",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Early Adopter",
          description: "Early adopter of the platform",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    : initialTags

  const [tags, setTags] = useState<Tag[]>(mockTags)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (useMockData) {
      alert("Preview Mode: Connect database to create tags")
      return
    }
    setIsLoading(true)

    const { data, error } = await supabase.from("tags").insert([formData]).select().single()

    if (error) {
      console.error("Error creating tag:", error)
      alert("Failed to create tag")
    } else {
      setTags([data, ...tags])
      setIsCreateOpen(false)
      setFormData({ name: "", description: "" })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTag) return
    if (useMockData) {
      alert("Preview Mode: Connect database to update tags")
      return
    }
    setIsLoading(true)

    const { data, error } = await supabase.from("tags").update(formData).eq("id", editingTag.id).select().single()

    if (error) {
      console.error("Error updating tag:", error)
      alert("Failed to update tag")
    } else {
      setTags(tags.map((tag) => (tag.id === data.id ? data : tag)))
      setEditingTag(null)
      setFormData({ name: "", description: "" })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (useMockData) {
      alert("Preview Mode: Connect database to delete tags")
      return
    }
    if (!confirm("Are you sure you want to delete this tag?")) return

    const { error } = await supabase.from("tags").delete().eq("id", id)

    if (error) {
      console.error("Error deleting tag:", error)
      alert("Failed to delete tag")
    } else {
      setTags(tags.filter((tag) => tag.id !== id))
      router.refresh()
    }
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({ name: tag.name, description: tag.description || "" })
  }

  const closeEditDialog = () => {
    setEditingTag(null)
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
          Create tags to categorize and organize users (e.g., VIP, Beta Tester, Premium)
        </p>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Tag</DialogTitle>
                <DialogDescription>Add a new tag to categorize users</DialogDescription>
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
            {tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No tags found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tag.description || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tag.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(tag)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
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

      <Dialog open={!!editingTag} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>Update the tag information</DialogDescription>
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
