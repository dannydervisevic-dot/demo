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
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"

type NotificationSchema = {
  id: string
  level1: string
  level2: string
  level3: string
  level4: string
  description: string | null
  created_at: string
  updated_at: string
}

export function NotificationSchemasClient({
  initialSchemas,
}: {
  initialSchemas: NotificationSchema[]
}) {
  const [schemas, setSchemas] = useState<NotificationSchema[]>(initialSchemas)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSchema, setEditingSchema] = useState<NotificationSchema | null>(null)
  const [formData, setFormData] = useState({
    level1: "",
    level2: "",
    level3: "",
    level4: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data, error } = await supabase.from("notification_schemas").insert([formData]).select().single()

    if (error) {
      console.error("Error creating notification schema:", error)
      alert("Failed to create notification schema")
    } else {
      setSchemas([...schemas, data])
      setIsCreateOpen(false)
      setFormData({
        level1: "",
        level2: "",
        level3: "",
        level4: "",
        description: "",
      })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSchema) return
    setIsLoading(true)

    const { data, error } = await supabase
      .from("notification_schemas")
      .update(formData)
      .eq("id", editingSchema.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating notification schema:", error)
      alert("Failed to update notification schema")
    } else {
      setSchemas(schemas.map((schema) => (schema.id === data.id ? data : schema)))
      setEditingSchema(null)
      setFormData({
        level1: "",
        level2: "",
        level3: "",
        level4: "",
        description: "",
      })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification schema?")) return

    const { error } = await supabase.from("notification_schemas").delete().eq("id", id)

    if (error) {
      console.error("Error deleting notification schema:", error)
      alert("Failed to delete notification schema")
    } else {
      setSchemas(schemas.filter((schema) => schema.id !== id))
      router.refresh()
    }
  }

  const openEditDialog = (schema: NotificationSchema) => {
    setEditingSchema(schema)
    setFormData({
      level1: schema.level1,
      level2: schema.level2,
      level3: schema.level3,
      level4: schema.level4,
      description: schema.description || "",
    })
  }

  const closeEditDialog = () => {
    setEditingSchema(null)
    setFormData({
      level1: "",
      level2: "",
      level3: "",
      level4: "",
      description: "",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notification Schemas</h1>
              <p className="text-muted-foreground mt-1">Manage 4-level notification hierarchy and preferences</p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Schema
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Create Notification Schema</DialogTitle>
                    <DialogDescription>Add a new 4-level notification schema</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="level1">Level 1</Label>
                        <Input
                          id="level1"
                          placeholder="e.g., Account"
                          value={formData.level1}
                          onChange={(e) => setFormData({ ...formData, level1: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="level2">Level 2</Label>
                        <Input
                          id="level2"
                          placeholder="e.g., Security"
                          value={formData.level2}
                          onChange={(e) => setFormData({ ...formData, level2: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="level3">Level 3</Label>
                        <Input
                          id="level3"
                          placeholder="e.g., Login"
                          value={formData.level3}
                          onChange={(e) => setFormData({ ...formData, level3: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="level4">Level 4</Label>
                        <Input
                          id="level4"
                          placeholder="e.g., New Device"
                          value={formData.level4}
                          onChange={(e) => setFormData({ ...formData, level4: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe this notification type"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
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
                  <TableHead>Hierarchy</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No notification schemas found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  schemas.map((schema) => (
                    <TableRow key={schema.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{schema.level1}</Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline">{schema.level2}</Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline">{schema.level3}</Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline">{schema.level4}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{schema.description || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(schema.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(schema)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(schema.id)}>
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

      <Dialog open={!!editingSchema} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Notification Schema</DialogTitle>
              <DialogDescription>Update the notification schema information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-level1">Level 1</Label>
                  <Input
                    id="edit-level1"
                    value={formData.level1}
                    onChange={(e) => setFormData({ ...formData, level1: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-level2">Level 2</Label>
                  <Input
                    id="edit-level2"
                    value={formData.level2}
                    onChange={(e) => setFormData({ ...formData, level2: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-level3">Level 3</Label>
                  <Input
                    id="edit-level3"
                    value={formData.level3}
                    onChange={(e) => setFormData({ ...formData, level3: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-level4">Level 4</Label>
                  <Input
                    id="edit-level4"
                    value={formData.level4}
                    onChange={(e) => setFormData({ ...formData, level4: e.target.value })}
                    required
                  />
                </div>
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
