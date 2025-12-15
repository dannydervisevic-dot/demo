"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Radio,
  AlertCircle,
  UserX,
  Mail,
  MessageSquare,
  Bell,
  MessageCircle,
  BarChart3,
  History,
  PieChart,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// Define BroadcastClientProps
type BroadcastClientProps = {
  userTypes: UserType[]
  tags: Tag[]
  schemas: NotificationSchema[]
  users: User[]
}

export function BroadcastClient({ userTypes, tags, schemas, users }: BroadcastClientProps) {
  const [selectedNotification, setSelectedNotification] = useState<NotificationSchema | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({})
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  const [allUserTypes, setAllUserTypes] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [userTypeSearch, setUserTypeSearch] = useState("")
  const [tagSearch, setTagSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [broadcastResults, setBroadcastResults] = useState<{
    totalTargeted: number
    totalDelivered: number
    optedOut: number
    byChannel: {
      email: number
      inApp: number
      push: number
      sms: number
    }
    status: "success" | "partial" | "failed"
  } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [notificationSearch, setNotificationSearch] = useState("")

  const categorizedSchemas = schemas.reduce(
    (acc, schema) => {
      const category = schema.level1 || "Other"
      const subcategory = schema.level2 || "General"

      if (!acc[category]) {
        acc[category] = {}
      }
      if (!acc[category][subcategory]) {
        acc[category][subcategory] = []
      }
      acc[category][subcategory].push(schema)
      return acc
    },
    {} as Record<string, Record<string, NotificationSchema[]>>,
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const toggleSubcategory = (key: string) => {
    setExpandedSubcategories((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const selectNotification = (schema: NotificationSchema) => {
    setSelectedNotification(schema)
  }

  const toggleUserType = (typeId: string) => {
    setAllUserTypes(false)
    setSelectedUserTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const toggleAllUserTypes = () => {
    setAllUserTypes(!allUserTypes)
    if (!allUserTypes) {
      setSelectedUserTypes([])
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const filteredUserTypes = userTypes.filter((type) => type.name.toLowerCase().includes(userTypeSearch.toLowerCase()))

  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(tagSearch.toLowerCase()))

  const filteredCategorizedSchemas = useMemo(() => {
    if (!notificationSearch) return categorizedSchemas

    const searchLower = notificationSearch.toLowerCase()
    const filtered: typeof categorizedSchemas = {}

    Object.entries(categorizedSchemas).forEach(([category, subcategories]) => {
      const categoryMatches = category.toLowerCase().includes(searchLower)
      const filteredSubcategories: typeof subcategories = {}

      Object.entries(subcategories).forEach(([subcategory, notifications]) => {
        const subcategoryMatches = subcategory.toLowerCase().includes(searchLower)
        const filteredNotifications = notifications.filter(
          (n) =>
            categoryMatches ||
            subcategoryMatches ||
            n.level3.toLowerCase().includes(searchLower) ||
            n.description?.toLowerCase().includes(searchLower),
        )

        if (filteredNotifications.length > 0) {
          filteredSubcategories[subcategory] = filteredNotifications
        }
      })

      if (Object.keys(filteredSubcategories).length > 0) {
        filtered[category] = filteredSubcategories
      }
    })

    return filtered
  }, [categorizedSchemas, notificationSearch])

  const getTargetedUsers = () => {
    return users.filter((user) => {
      const matchesUserType =
        allUserTypes ||
        selectedUserTypes.length === 0 ||
        (user.user_type_id && selectedUserTypes.includes(user.user_type_id))

      const matchesTags =
        selectedTags.length === 0 || (user.user_tags && user.user_tags.some((ut) => selectedTags.includes(ut.tag.id)))

      return matchesUserType && matchesTags
    })
  }

  const targetedUsers = getTargetedUsers()

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()

    if (targetedUsers.length === 0) {
      alert("No users match the selected filters")
      return
    }

    if (!selectedNotification) {
      alert("Please select a notification")
      return
    }

    setIsLoading(true)
    setIsSending(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const successful = Math.floor(targetedUsers.length * 0.95)
    const failed = targetedUsers.length - successful

    const logs = targetedUsers.map((user) => ({
      user_id: user.id,
      schema_id: selectedNotification.id,
      title: `Broadcast: ${selectedNotification.level3}`,
      message: `Notification sent via user preference`,
      status: Math.random() > 0.05 ? "sent" : "failed",
      metadata: {
        user_types: allUserTypes ? "all" : selectedUserTypes,
        tags: selectedTags,
        broadcast: true,
      },
    }))

    const { error } = await supabase.from("notification_logs").insert(logs)

    setIsSending(false)

    if (error) {
      console.error("Error broadcasting notification:", error)
      alert("Failed to send broadcast")
      setIsLoading(false)
    } else {
      const simulatedResults = {
        totalTargeted: targetedUsers.length,
        totalDelivered: successful,
        optedOut: Math.floor(targetedUsers.length * 0.15), // 15% opted out
        byChannel: {
          email: Math.floor(successful * 0.45),
          inApp: Math.floor(successful * 0.3),
          push: Math.floor(successful * 0.2),
          sms: Math.floor(successful * 0.05),
        },
        status: (successful === targetedUsers.length ? "success" : successful > 0 ? "partial" : "failed") as
          | "success"
          | "partial"
          | "failed",
      }

      setBroadcastResults(simulatedResults)
      setShowSuccessDialog(true)
      setIsLoading(false)
      setSelectedNotification(null)
      setAllUserTypes(true)
      setSelectedUserTypes([])
      setSelectedTags([])
      router.refresh()
    }
  }

  const mockBroadcastHistory = [
    {
      id: "1",
      notification: "High Usage Alert",
      category: "Energy Usage > Alerts",
      date: "2024-12-12",
      time: "14:30",
      totalSent: 245,
      successful: 233,
      failed: 12,
      successRate: 95,
      channels: { email: 110, inApp: 78, push: 42, sms: 3 },
    },
    {
      id: "2",
      notification: "Invoice Generated",
      category: "Billing > Invoices",
      date: "2024-12-11",
      time: "09:15",
      totalSent: 892,
      successful: 889,
      failed: 3,
      successRate: 99.7,
      channels: { email: 450, inApp: 320, push: 110, sms: 9 },
    },
    {
      id: "3",
      notification: "Payment Received",
      category: "Billing > Payments",
      date: "2024-12-10",
      time: "16:45",
      totalSent: 156,
      successful: 150,
      failed: 6,
      successRate: 96,
      channels: { email: 78, inApp: 45, push: 25, sms: 2 },
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Broadcast Notification</h1>
            <p className="text-muted-foreground mt-1">
              Send notifications to users based on types and tags. Respects individual user channel preferences.
            </p>
          </div>

          <Tabs defaultValue="create" className="space-y-6">
            <TabsList>
              <TabsTrigger value="create" className="gap-2">
                <Radio className="h-4 w-4" />
                Create Broadcast
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="statistics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-0">
              <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Radio className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Step 1: Select Notification</CardTitle>
                          <CardDescription>Choose the notification to broadcast</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedNotification ? (
                        <div className="space-y-3">
                          <div className="border rounded-lg p-4 bg-primary/5">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{selectedNotification.level3}</h3>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedNotification(null)}>
                                Change
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-sm">
                              <Badge variant="outline">{selectedNotification.level1}</Badge>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline">{selectedNotification.level2}</Badge>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline">{selectedNotification.level3}</Badge>
                            </div>
                            {selectedNotification.description && (
                              <p className="text-sm text-muted-foreground mt-2">{selectedNotification.description}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search notifications, categories, or events..."
                              value={notificationSearch}
                              onChange={(e) => setNotificationSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>

                          <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {Object.entries(filteredCategorizedSchemas).map(([category, subcategories]) => (
                              <div key={category}>
                                <button
                                  onClick={() => toggleCategory(category)}
                                  className="flex items-center gap-2 w-full p-3 hover:bg-accent rounded-md text-left transition-colors"
                                >
                                  {expandedCategories[category] ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="font-medium">{category}</span>
                                </button>

                                {expandedCategories[category] && (
                                  <div className="ml-6 space-y-1 mt-1">
                                    {Object.entries(subcategories).map(([subcategory, notificationList]) => {
                                      const subcategoryKey = `${category}-${subcategory}`
                                      return (
                                        <div key={subcategoryKey}>
                                          <button
                                            onClick={() => toggleSubcategory(subcategoryKey)}
                                            className="flex items-center gap-2 w-full p-2 hover:bg-accent/50 rounded-md text-left transition-colors"
                                          >
                                            {expandedSubcategories[subcategoryKey] ? (
                                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            <span className="text-sm font-medium">{subcategory}</span>
                                          </button>

                                          {expandedSubcategories[subcategoryKey] && (
                                            <div className="ml-5 space-y-1 mt-1">
                                              {notificationList.map((notification) => (
                                                <button
                                                  key={notification.id}
                                                  onClick={() => selectNotification(notification)}
                                                  className="w-full p-2 text-left text-sm hover:bg-primary/10 rounded-md transition-colors border border-transparent hover:border-primary/20"
                                                >
                                                  {notification.level3}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                            {Object.keys(filteredCategorizedSchemas).length === 0 && (
                              <p className="text-center text-muted-foreground py-8">
                                No notifications found matching your search.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {selectedNotification && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle>Step 2: Target Audience</CardTitle>
                            <CardDescription>Filter users by type and tags</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <Label>User Types</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 p-3 bg-accent/50 rounded-md">
                              <Checkbox
                                id="all-user-types"
                                checked={allUserTypes}
                                onCheckedChange={toggleAllUserTypes}
                              />
                              <label
                                htmlFor="all-user-types"
                                className="text-sm font-semibold leading-none cursor-pointer"
                              >
                                All User Types
                              </label>
                            </div>

                            {!allUserTypes && (
                              <>
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search user types..."
                                    value={userTypeSearch}
                                    onChange={(e) => setUserTypeSearch(e.target.value)}
                                    className="pl-9"
                                  />
                                </div>
                                <div className="border rounded-md p-4 space-y-3 max-h-[200px] overflow-y-auto">
                                  {filteredUserTypes.map((type) => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`usertype-${type.id}`}
                                        checked={selectedUserTypes.includes(type.id)}
                                        onCheckedChange={() => toggleUserType(type.id)}
                                      />
                                      <label
                                        htmlFor={`usertype-${type.id}`}
                                        className="text-sm font-medium leading-none cursor-pointer"
                                      >
                                        {type.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Tags (Optional)</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search tags..."
                              value={tagSearch}
                              onChange={(e) => setTagSearch(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                          <div className="border rounded-md p-4 space-y-3 max-h-[200px] overflow-y-auto">
                            {filteredTags.map((tag) => (
                              <div key={tag.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`tag-${tag.id}`}
                                  checked={selectedTags.includes(tag.id)}
                                  onCheckedChange={() => toggleTag(tag.id)}
                                />
                                <label
                                  htmlFor={`tag-${tag.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {tag.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNotification && (
                    <Button
                      onClick={handleBroadcast}
                      disabled={isLoading || targetedUsers.length === 0}
                      size="lg"
                      className="w-full"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending to {targetedUsers.length} users...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Broadcast to {targetedUsers.length} Users
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Recipients Preview
                      </CardTitle>
                      <CardDescription>
                        {targetedUsers.length} {targetedUsers.length === 1 ? "user" : "users"} will receive this
                        broadcast
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {targetedUsers.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            {selectedNotification
                              ? "No users match the selected filters"
                              : "Select a notification to see recipients"}
                          </p>
                        ) : (
                          targetedUsers.map((user) => (
                            <div
                              key={user.id}
                              className="border rounded-md p-3 space-y-2 hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Broadcast History</CardTitle>
                  <CardDescription>View past broadcast notifications and their performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockBroadcastHistory.map((broadcast) => (
                      <div
                        key={broadcast.id}
                        className="border rounded-lg p-6 hover:bg-accent/50 transition-colors space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5">
                            <h3 className="text-lg font-semibold">{broadcast.notification}</h3>
                            <p className="text-sm text-muted-foreground">{broadcast.category}</p>
                          </div>
                          <Badge
                            variant={broadcast.successRate >= 98 ? "default" : "secondary"}
                            className="bg-green-500 text-white px-3 py-1.5 text-sm"
                          >
                            {broadcast.successRate}% Success
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="text-base">{broadcast.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span className="text-base">{broadcast.time}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Sent</p>
                            <p className="text-2xl font-semibold">{broadcast.totalSent}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Successful</p>
                            <p className="text-2xl font-semibold text-green-600">{broadcast.successful}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Failed</p>
                            <p className="text-2xl font-semibold text-red-600">{broadcast.failed}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-3">
                          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
                            <Mail className="h-4 w-4" />
                            {broadcast.channels.email}
                          </Badge>
                          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
                            <MessageSquare className="h-4 w-4" />
                            {broadcast.channels.inApp}
                          </Badge>
                          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
                            <Bell className="h-4 w-4" />
                            {broadcast.channels.push}
                          </Badge>
                          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
                            <MessageCircle className="h-4 w-4" />
                            {broadcast.channels.sms}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Broadcasts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">127</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-600">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Recipients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">15,234</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-600">+8%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">97.2%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-600">+2.1%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Opt-out Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">2.8%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-red-600">+0.3%</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Channel Distribution
                    </CardTitle>
                    <CardDescription>Last 30 days broadcast delivery by channel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <span>Email</span>
                          </div>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: "45%" }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span>In-App</span>
                          </div>
                          <span className="font-medium">32%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: "32%" }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-purple-500" />
                            <span>Push</span>
                          </div>
                          <span className="font-medium">18%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: "18%" }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-orange-500" />
                            <span>SMS</span>
                          </div>
                          <span className="font-medium">5%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: "5%" }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                    <CardDescription>Broadcast success rate over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">This Week</span>
                          <span className="text-lg font-semibold">98.2%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: "98.2%" }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Week</span>
                          <span className="text-lg font-semibold">96.5%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: "96.5%" }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Month</span>
                          <span className="text-lg font-semibold">95.1%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: "95.1%" }}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">+3.1% improvement</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Success rate trending upward</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {broadcastResults?.status === "success" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              {broadcastResults?.status === "partial" && <AlertCircle className="h-6 w-6 text-orange-500" />}
              {broadcastResults?.status === "failed" && <XCircle className="h-6 w-6 text-red-500" />}
              Broadcast{" "}
              {broadcastResults?.status === "success"
                ? "Completed Successfully"
                : broadcastResults?.status === "partial"
                  ? "Partially Completed"
                  : "Failed"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                <Users className="h-6 w-6 text-primary mb-2" />
                <div className="text-2xl font-bold text-primary">{broadcastResults?.totalTargeted}</div>
                <p className="text-xs text-muted-foreground">Users Targeted</p>
              </div>
              <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                <div className="text-2xl font-bold text-green-600">{broadcastResults?.totalDelivered}</div>
                <p className="text-xs text-muted-foreground">Successfully Delivered</p>
              </div>
              <div className="border border-gray-400/20 rounded-lg p-4 bg-gray-400/5">
                <UserX className="h-6 w-6 text-gray-500 mb-2" />
                <div className="text-2xl font-bold text-gray-600">{broadcastResults?.optedOut}</div>
                <p className="text-xs text-muted-foreground">Opted Out</p>
              </div>
            </div>

            {/* Channel Breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Send className="h-4 w-4" />
                Delivery by Channel
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{broadcastResults?.byChannel.email}</span>
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">In-App</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{broadcastResults?.byChannel.inApp}</span>
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">Push</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{broadcastResults?.byChannel.push}</span>
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium">SMS</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{broadcastResults?.byChannel.sms}</span>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-accent/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Notifications are delivered via each user's preferred channel. Users who opted
                out of notifications were excluded from delivery.
              </p>
            </div>

            <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
