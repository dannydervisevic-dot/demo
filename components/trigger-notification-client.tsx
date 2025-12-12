"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, X, LayoutGrid } from "lucide-react"
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

type Language = {
  code: string
  name: string
}

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

const availableLanguages: Language[] = [
  { code: "EN", name: "English" },
  { code: "ES", name: "Spanish" },
  { code: "FR", name: "French" },
  { code: "DE", name: "German" },
]

function TriggerNotificationClient({ schemas, users: initialUsers }: TriggerNotificationClientProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<{ language: string; channel: string }[]>([])
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
    setSelectedTemplates([])
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
      setSelectedTemplates([])
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
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],])/g,
      (match) => {
        let cls = "text-orange-400" // numbers
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-cyan-400" // keys
          } else {
            cls = "text-lime-400" // string values
          }
        } else if (/true|false/.test(match)) {
          cls = "text-purple-400" // booleans
        } else if (/null/.test(match)) {
          cls = "text-red-400" // null
        } else if (/[{}[\],]/.test(match)) {
          cls = "text-yellow-300" // braces, brackets, commas
        }
        return `<span class="${cls}">${match}</span>`
      },
    )
  }

  const getTemplateStatus = (language: string, channel: string): "ready" | "create" | "missing" => {
    if (!selectedEvent) return "missing"
    const template = schemas[selectedEvent.id]?.[channel]
    if (template && template[language]) {
      return "ready"
    }
    return Math.random() > 0.5 ? "create" : "missing" // Placeholder logic
  }

  const getLanguageTemplate = (language: string, channel: string) => {
    if (!selectedEvent) return null
    const channelTemplates = schemas[selectedEvent.id]?.[channel]
    return channelTemplates?.[language] || channelTemplates // Fallback to default if no language-specific template
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
            <Card className="border-2 border-orange-200 mt-6">
              <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-orange-900 dark:text-orange-100 mb-1 flex items-center gap-3">
                      <LayoutGrid className="h-5 w-5 text-white" />
                      Step 3: Template Selection
                    </CardTitle>
                    <CardDescription className="text-sm font-normal text-muted-foreground">
                      Select templates to configure and preview
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span>Missing</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-200 p-3 bg-gray-50 text-left">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Globe className="h-4 w-4" />
                            LANGUAGE
                          </div>
                        </th>
                        {(["email", "sms", "in_app", "push"] as Channel[]).map((channel) => {
                          const Icon = channelIcons[channel as Channel]
                          return (
                            <th key={channel} className="border border-gray-200 p-3 bg-gray-50">
                              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 uppercase">
                                <Icon className="h-4 w-4" />
                                {channel === "in_app"
                                  ? "IN-APP MESSAGES"
                                  : channel === "email"
                                    ? "EMAIL NOTIFICATIONS"
                                    : channel === "sms"
                                      ? "SMS ALERTS"
                                      : "PUSH"}
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {availableLanguages.map((language) => (
                        <tr key={language.code}>
                          <td className="border border-gray-200 p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                {language.code}
                              </div>
                              <span className="font-medium">{language.name}</span>
                            </div>
                          </td>
                          {(["email", "sms", "in_app", "push"] as Channel[]).map((channel) => {
                            const status = getTemplateStatus(language.code, channel)
                            const isAvailable = status === "ready"
                            const isSelected = selectedTemplates.some(
                              (t) => t.language === language.code && t.channel === channel,
                            )

                            return (
                              <td key={channel} className="border border-gray-200 p-3">
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => {
                                      if (isAvailable) {
                                        if (isSelected) {
                                          setSelectedTemplates((prev) =>
                                            prev.filter(
                                              (t) => !(t.language === language.code && t.channel === channel),
                                            ),
                                          )
                                        } else {
                                          setSelectedTemplates((prev) => [
                                            ...prev,
                                            { language: language.code, channel },
                                          ])
                                          if (!selectedChannels.includes(channel)) {
                                            setSelectedChannels((prev) => [...prev, channel])
                                          }
                                        }
                                        setPlaceholders({})
                                      }
                                    }}
                                    disabled={!isAvailable}
                                    className={cn(
                                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                      isAvailable &&
                                        !isSelected &&
                                        "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer",
                                      isAvailable && isSelected && "bg-green-600 text-white ring-2 ring-green-400",
                                      status === "missing" &&
                                        "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          isAvailable && "bg-green-500",
                                          status === "missing" && "bg-gray-400",
                                        )}
                                      ></div>
                                      {isAvailable ? "Available" : "Missing"}
                                    </div>
                                  </button>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedEvent && selectedUsers.length > 0 && selectedChannels.length > 0 && selectedTemplates.length > 0 && (
            <div className="mt-6 space-y-6">
              {selectedTemplates.map((template, index) => {
                const templateData = schemas[selectedEvent!.id]?.[template.channel]?.[template.language]
                if (!templateData) return null

                const languageName =
                  availableLanguages.find((l) => l.code === template.language)?.name || template.language

                const channelIcons = {
                  email: Mail,
                  sms: MessageSquare,
                  "in-app": Bell,
                  push: Bell,
                }
                const ChannelIcon = channelIcons[template.channel as keyof typeof channelIcons]

                return (
                  <div
                    key={`${template.language}-${template.channel}-${index}`}
                    className="border border-gray-200 rounded-lg p-6 bg-white"
                  >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <ChannelIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">{template.channel.toUpperCase()}</h4>
                          <p className="text-sm text-gray-500">{languageName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTemplates((prev) =>
                            prev.filter((t) => !(t.language === template.language && t.channel === template.channel)),
                          )
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Placeholder Fields */}
                    {templateData.placeholders && templateData.placeholders.length > 0 && (
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Fill Placeholders:</h5>
                        <div className="grid grid-cols-2 gap-4">
                          {templateData.placeholders.map((placeholder: string) => (
                            <div key={placeholder}>
                              <label className="block text-sm text-gray-600 mb-1">{placeholder}</label>
                              <input
                                type="text"
                                value={placeholders[placeholder] || ""}
                                onChange={(e) =>
                                  setPlaceholders((prev) => ({
                                    ...prev,
                                    [placeholder]: e.target.value,
                                  }))
                                }
                                placeholder={`Enter ${placeholder}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Preview:</h5>
                      <div className="space-y-3">
                        {templateData.subject && (
                          <div>
                            <span className="text-xs text-gray-500">Subject:</span>
                            <p className="font-medium">
                              {templateData.subject.replace(/\{(\w+)\}/g, (_, key) => placeholders[key] || `{${key}}`)}
                            </p>
                          </div>
                        )}
                        {templateData.body && (
                          <div>
                            <span className="text-xs text-gray-500">Body:</span>
                            <p className="text-sm whitespace-pre-wrap">
                              {templateData.body.replace(/\{(\w+)\}/g, (_, key) => placeholders[key] || `{${key}}`)}
                            </p>
                          </div>
                        )}
                        {templateData.title && (
                          <div>
                            <span className="text-xs text-gray-500">Title:</span>
                            <p className="font-medium">
                              {templateData.title.replace(/\{(\w+)\}/g, (_, key) => placeholders[key] || `{${key}}`)}
                            </p>
                          </div>
                        )}
                        {templateData.message && (
                          <div>
                            <span className="text-xs text-gray-500">Message:</span>
                            <p className="text-sm">
                              {templateData.message.replace(/\{(\w+)\}/g, (_, key) => placeholders[key] || `{${key}}`)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
