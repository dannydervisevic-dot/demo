"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Users, ChevronRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

type UserType = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
}

type NotificationSchema = {
  id: string
  level1: string
  level2: string
  level3: string
  level4: string
  description: string | null
}

type User = {
  id: string
  email: string
  name: string
  user_type_id: string | null
  user_type?: UserType | null
  user_tags?: { tag: Tag }[]
}

export function BroadcastClient({
  userTypes,
  tags,
  schemas,
  users,
}: {
  userTypes: UserType[]
  tags: Tag[]
  schemas: NotificationSchema[]
  users: User[]
}) {
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedSchema, setSelectedSchema] = useState<string>("")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleUserType = (typeId: string) => {
    setSelectedUserTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const getTargetedUsers = () => {
    return users.filter((user) => {
      const matchesUserType =
        selectedUserTypes.length === 0 || (user.user_type_id && selectedUserTypes.includes(user.user_type_id))

      const matchesTags =
        selectedTags.length === 0 || (user.user_tags && user.user_tags.some((ut) => selectedTags.includes(ut.tag.id)))

      return matchesUserType && matchesTags
    })
  }

  const targetedUsers = getTargetedUsers()
  const selectedSchemaData = schemas.find((s) => s.id === selectedSchema)

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (targetedUsers.length === 0) {
      alert("No users match the selected filters")
      setIsLoading(false)
      return
    }

    if (!selectedSchema) {
      alert("Please select a notification schema")
      setIsLoading(false)
      return
    }

    // Create notification logs for each targeted user
    const logs = targetedUsers.map((user) => ({
      user_id: user.id,
      schema_id: selectedSchema,
      title,
      message,
      status: "sent",
      metadata: {
        user_types: selectedUserTypes,
        tags: selectedTags,
      },
    }))

    const { error } = await supabase.from("notification_logs").insert(logs)

    if (error) {
      console.error("Error broadcasting notification:", error)
      alert("Failed to send broadcast")
    } else {
      alert(`Successfully sent notification to ${targetedUsers.length} users!`)
      setTitle("")
      setMessage("")
      setSelectedSchema("")
      setSelectedUserTypes([])
      setSelectedTags([])
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Broadcast Notification</h1>
            <p className="text-muted-foreground mt-1">
              Send notifications to users based on types, tags, and preferences
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Target Audience</CardTitle>
                  <CardDescription>Select user types and tags to target specific users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>User Types</Label>
                    <div className="border rounded-md p-4 space-y-3">
                      {userTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`usertype-${type.id}`}
                            checked={selectedUserTypes.includes(type.id)}
                            onCheckedChange={() => toggleUserType(type.id)}
                          />
                          <label
                            htmlFor={`usertype-${type.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {type.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Tags</Label>
                    <div className="border rounded-md p-4 space-y-3">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Content</CardTitle>
                  <CardDescription>Compose your notification message</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBroadcast} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="schema">Notification Schema</Label>
                      <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                        <SelectContent>
                          {schemas.map((schema) => (
                            <SelectItem key={schema.id} value={schema.id}>
                              {schema.level1} → {schema.level2} → {schema.level3} → {schema.level4}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter notification title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter notification message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isLoading || targetedUsers.length === 0} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      {isLoading ? "Sending..." : `Send to ${targetedUsers.length} Users`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Targeted Users
                  </CardTitle>
                  <CardDescription>{targetedUsers.length} users will receive this notification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {targetedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No users match the selected filters
                      </p>
                    ) : (
                      targetedUsers.map((user) => (
                        <div key={user.id} className="border rounded-md p-3 space-y-1">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {user.user_type && (
                              <Badge variant="secondary" className="text-xs">
                                {user.user_type.name}
                              </Badge>
                            )}
                            {user.user_tags?.map((ut) => (
                              <Badge key={ut.tag.id} variant="outline" className="text-xs">
                                {ut.tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedSchemaData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Selected Schema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{selectedSchemaData.level1}</Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline">{selectedSchemaData.level2}</Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline">{selectedSchemaData.level3}</Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline">{selectedSchemaData.level4}</Badge>
                      </div>
                      {selectedSchemaData.description && (
                        <p className="text-sm text-muted-foreground">{selectedSchemaData.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
