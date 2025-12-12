"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ChevronDown,
  Zap,
  Users,
  Mail,
  Smartphone,
  Bell,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

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

type Event = {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
}

type Channel = "email" | "in_app" | "push" | "sms"

type TriggerNotificationClientProps = {
  schemas: Record<string, any>
  users: User[]
}

const channelIcons = {
  email: Mail,
  in_app: Bell,
  push: Smartphone,
  sms: MessageSquare,
}

function TriggerNotificationClient({ schemas, users: initialUsers }: TriggerNotificationClientProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [placeholders, setPlaceholders] = useState<{ [key: string]: string }>({
    customer_name: "",
    amount: "",
    percentage: "",
    action: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [jsonPayload, setJsonPayload] = useState("")
  const [copied, setCopied] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const displayUsers = initialUsers

  const filteredUsers = displayUsers.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((category) => category !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((subcategory) => subcategory !== subcategoryId)
        : [...prev, subcategoryId],
    )
  }

  const selectEvent = (event: Event) => {
    setSelectedEvent(event)
    setSelectedUsers([])
    setSelectedChannels([])
    setPlaceholders({})
  }

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selectedUserObjects = displayUsers.filter((u) => selectedUsers.includes(u.id))

  const getChannelTemplates = () => {
    if (!selectedEvent) return []
    return selectedChannels.map((channel) => ({
      channel,
      template: schemas[selectedEvent.id]?.[channel],
    }))
  }

  const channelTemplates = getChannelTemplates()

  const fillPlaceholders = (text: string, placeholders: { [key: string]: string }) => {
    let result = text
    Object.entries(placeholders).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`)
    })
    return result
  }

  const generatePayload = () => {
    const payload = {
      event: selectedEvent
        ? {
            id: selectedEvent.id,
            name: selectedEvent.name,
            description: selectedEvent.description,
          }
        : null,
      channels: selectedChannels,
      recipients: selectedUserObjects.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type?.name || null,
        tags: user.user_tags?.map((ut) => ut.tag.name) || [],
      })),
      templates: channelTemplates,
      placeholders: placeholders,
      timestamp: new Date().toISOString(),
    }
    return JSON.stringify(payload, null, 2)
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonPayload || generatePayload())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const isTriggerDisabled = !selectedEvent || selectedUsers.length === 0 || selectedChannels.length === 0 || isLoading

  const handleTrigger = async () => {
    if (isTriggerDisabled) {
      alert("Please complete all selections")
      return
    }

    setIsLoading(true)
    try {
      alert(
        `Successfully triggered ${selectedEvent.name} via ${selectedChannels.join(", ")} for ${selectedUsers.length} users!`,
      )
      setSelectedEvent(null)
      setSelectedUsers([])
      setSelectedChannels([])
      setPlaceholders({})
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      alert("Error triggering notification")
    }
    setIsLoading(false)
  }

  const syntaxHighlight = (json: string) => {
    try {
      const parsed = JSON.parse(json)
      json = JSON.stringify(parsed, null, 2)
    } catch {
      return json
    }

    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "text-yellow-400" // numbers
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-blue-400" // keys
          } else {
            cls = "text-green-400" // string values
          }
        } else if (/true|false/.test(match)) {
          cls = "text-purple-400" // booleans
        } else if (/null/.test(match)) {
          cls = "text-gray-400" // null
        }
        return `<span class="${cls}">${match}</span>`
      },
    )
  }

  useEffect(() => {
    const currentPayload = generatePayload()
    setJsonPayload(currentPayload)
  }, [selectedEvent, selectedUsers, selectedChannels, placeholders])

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="flex-shrink-0">
        <Navigation />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Step 1: Select Event */}
        <div className="mb-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Step 1: Select Event
              </CardTitle>
              <CardDescription>Choose a notification event to trigger</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEvent && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">Selected Event</p>
                        <p className="text-xs text-orange-700">
                          {selectedEvent.category} → {selectedEvent.subcategory} → {selectedEvent.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEvent(null)}
                      className="text-orange-700 hover:text-orange-900"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {Object.entries(
                  Object.values(schemas)
                    .filter((schema) => schema?.level1 && schema?.level2 && schema?.level3)
                    .reduce(
                      (acc, schema) => {
                        const categoryKey = schema.level1.toLowerCase()
                        if (!acc[categoryKey]) {
                          acc[categoryKey] = {
                            name: schema.level1,
                            subcategories: {},
                          }
                        }
                        const subcategoryKey = schema.level2.toLowerCase()
                        if (!acc[categoryKey].subcategories[subcategoryKey]) {
                          acc[categoryKey].subcategories[subcategoryKey] = {
                            name: schema.level2,
                            events: [],
                          }
                        }
                        acc[categoryKey].subcategories[subcategoryKey].events.push({
                          id: schema.id,
                          name: schema.level3,
                          description: schema.description,
                          category: schema.level1,
                          subcategory: schema.level2,
                        })
                        return acc
                      },
                      {} as Record<
                        string,
                        {
                          name: string
                          subcategories: Record<string, { name: string; events: Event[] }>
                        }
                      >,
                    ),
                ).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(categoryKey)}
                      className="w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="font-semibold">{category.name}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedCategories.includes(categoryKey) && "rotate-180",
                        )}
                      />
                    </button>
                    {expandedCategories.includes(categoryKey) && (
                      <div className="p-2 space-y-2 bg-background">
                        {Object.entries(category.subcategories).map(([subcategoryKey, subcategory]) => (
                          <div key={subcategoryKey} className="border rounded">
                            <button
                              onClick={() => toggleSubcategory(`${categoryKey}-${subcategoryKey}`)}
                              className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors"
                            >
                              <span className="font-medium">{subcategory.name}</span>
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 transition-transform",
                                  expandedSubcategories.includes(`${categoryKey}-${subcategoryKey}`) && "rotate-180",
                                )}
                              />
                            </button>
                            {expandedSubcategories.includes(`${categoryKey}-${subcategoryKey}`) && (
                              <div className="px-3 pb-2 space-y-1">
                                {subcategory.events.map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={() => selectEvent(event)}
                                    className={cn(
                                      "w-full text-left px-3 py-2 text-xs rounded transition-colors",
                                      selectedEvent?.id === event.id
                                        ? "bg-orange-600 text-white hover:bg-orange-700"
                                        : "hover:bg-muted",
                                    )}
                                  >
                                    <div className="font-medium">{event.name}</div>
                                    <div
                                      className={cn(
                                        "text-[10px] mt-0.5",
                                        selectedEvent?.id === event.id ? "text-orange-100" : "text-muted-foreground",
                                      )}
                                    >
                                      {event.description}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Step 2: Select Recipients
                </CardTitle>
                <CardDescription>Choose who will receive this notification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => toggleUser(user.id)}
                    >
                      <Checkbox checked={selectedUsers.includes(user.id)} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      {user.user_type && (
                        <Badge variant="outline" className="text-xs">
                          {user.user_type.name}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {selectedEvent && selectedUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  Step 3: Select Channels
                </CardTitle>
                <CardDescription>Choose notification channels (you can select multiple)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(["email", "in_app", "push", "sms"] as Channel[]).map((channel) => {
                    const Icon = channelIcons[channel]
                    const isSelected = selectedChannels.includes(channel)
                    return (
                      <button
                        key={channel}
                        onClick={() => {
                          setSelectedChannels((prev) =>
                            prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
                          )
                        }}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                          isSelected
                            ? "border-orange-600 bg-orange-50 dark:bg-orange-950/30"
                            : "border-border hover:border-orange-300 hover:bg-muted/50",
                        )}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-full",
                            isSelected ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm capitalize">
                          {channel === "in_app" ? "In-App" : channel}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          {selectedEvent && selectedUsers.length > 0 && selectedChannels.length > 0 && (
            <div className="space-y-6">
              {selectedChannels.map((channel) => {
                const template = schemas[selectedEvent.id]?.[channel]
                if (!template) return null

                return (
                  <Card key={channel} className="border-2 border-orange-200">
                    <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {React.createElement(channelIcons[channel], { className: "h-5 w-5 text-orange-600" })}
                        <span className="capitalize">{channel === "in_app" ? "In-App" : channel}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Placeholders Section */}
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">4. Fill Placeholders</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {template.placeholders.map((placeholder: string) => (
                            <div key={placeholder}>
                              <Label htmlFor={`${channel}-${placeholder}`} className="text-xs">
                                {placeholder.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Label>
                              <Input
                                id={`${channel}-${placeholder}`}
                                value={placeholders[placeholder] || ""}
                                onChange={(e) =>
                                  setPlaceholders((prev) => ({
                                    ...prev,
                                    [placeholder]: e.target.value,
                                  }))
                                }
                                placeholder={`Enter ${placeholder.replace(/_/g, " ")}`}
                                className="mt-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Section */}
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">5. Preview</Label>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          {channel === "email" && (
                            <div>
                              <div className="mb-2 pb-2 border-b">
                                <p className="text-xs text-gray-500">Subject:</p>
                                <p className="font-medium">{fillPlaceholders(template.subject, placeholders)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Body:</p>
                                <p className="text-sm whitespace-pre-wrap">
                                  {fillPlaceholders(template.body, placeholders)}
                                </p>
                              </div>
                            </div>
                          )}
                          {channel === "in_app" && (
                            <div>
                              <p className="font-medium mb-1">{fillPlaceholders(template.title, placeholders)}</p>
                              <p className="text-sm text-gray-600">
                                {fillPlaceholders(template.message, placeholders)}
                              </p>
                            </div>
                          )}
                          {channel === "push" && (
                            <div className="flex items-start gap-3">
                              <Bell className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="font-medium mb-1">{fillPlaceholders(template.title, placeholders)}</p>
                                <p className="text-sm text-gray-600">
                                  {fillPlaceholders(template.message, placeholders)}
                                </p>
                              </div>
                            </div>
                          )}
                          {channel === "sms" && (
                            <div>
                              <p className="text-sm">{fillPlaceholders(template.message, placeholders)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-[380px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col h-screen">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-sm">JSON Payload</h3>
          <Button variant="outline" size="sm" onClick={handleCopyJson} className="h-8 text-xs bg-transparent">
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {jsonError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Invalid JSON: {jsonError}</AlertDescription>
            </Alert>
          )}
          <div className="relative w-full min-h-[600px]">
            <pre
              className="absolute inset-0 w-full h-full p-4 font-mono text-xs bg-black rounded-lg overflow-auto pointer-events-none"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonPayload) }}
            />
            <textarea
              value={jsonPayload}
              onChange={(e) => {
                setJsonPayload(e.target.value)
                try {
                  JSON.parse(e.target.value)
                  setJsonError(null)
                } catch (err) {
                  setJsonError(err instanceof Error ? err.message : "Invalid JSON")
                }
              }}
              className="absolute inset-0 w-full h-full p-4 font-mono text-xs bg-transparent text-transparent caret-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
          <Button
            onClick={handleTrigger}
            disabled={isTriggerDisabled}
            size="lg"
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Zap className="mr-2 h-4 w-4" />
            {isLoading
              ? "Triggering..."
              : selectedChannels.length > 0
                ? `Trigger Notification (${selectedChannels.length} ${selectedChannels.length === 1 ? "channel" : "channels"})`
                : "Trigger Notification"}
          </Button>
          {isTriggerDisabled && (
            <p className="text-xs text-center text-gray-500">
              Select event, recipients, and at least one channel to enable
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export { TriggerNotificationClient }
export default TriggerNotificationClient
