"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Bell, CheckCircle, TrendingUp, Users, Mail, Smartphone } from "lucide-react"

const channelData = [
  { name: "Email", value: 450, color: "#3b82f6" }, // Blue
  { name: "In-App", value: 320, color: "#10b981" }, // Green
  { name: "Push", value: 180, color: "#f59e0b" }, // Orange
  { name: "SMS", value: 95, color: "#ef4444" }, // Red
]

// Mock data for broadcasts over time
const broadcastData = [
  { date: "Jan 1", successful: 145, failed: 5 },
  { date: "Jan 2", successful: 167, failed: 3 },
  { date: "Jan 3", successful: 198, failed: 8 },
  { date: "Jan 4", successful: 156, failed: 4 },
  { date: "Jan 5", successful: 189, failed: 6 },
  { date: "Jan 6", successful: 203, failed: 2 },
  { date: "Jan 7", successful: 178, failed: 7 },
]

const notificationTypeData = [
  { type: "System", count: 320, fill: "#8b5cf6" }, // Purple
  { type: "Marketing", count: 280, fill: "#ec4899" }, // Pink
  { type: "Social", count: 195, fill: "#06b6d4" }, // Cyan
  { type: "Billing", count: 150, fill: "#f97316" }, // Orange
]

export function DashboardClient() {
  const totalNotifications = channelData.reduce((sum, item) => sum + item.value, 0)
  const totalBroadcasts = broadcastData.reduce((sum, item) => sum + item.successful, 0)
  const successRate = ((totalBroadcasts / (totalBroadcasts + 35)) * 100).toFixed(1)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your notification platform performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalNotifications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all channels</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Broadcasts</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalBroadcasts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">10</div>
            <p className="text-xs text-muted-foreground mt-1">Receiving notifications</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">96.8%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.4% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifications by Channel</CardTitle>
            <CardDescription>Distribution of messages across delivery channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">450 sent</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">In-App</p>
                  <p className="text-xs text-muted-foreground">320 sent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Broadcast Performance</CardTitle>
            <CardDescription>Successful vs failed broadcasts over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={broadcastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successful"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Successful"
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Failed"
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Messages sent by notification category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={notificationTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {notificationTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Broadcasts</CardTitle>
            <CardDescription>Latest notification broadcasts sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "New Feature Release",
                  type: "System",
                  recipients: 145,
                  time: "2 hours ago",
                  status: "success",
                },
                {
                  title: "Weekly Newsletter",
                  type: "Marketing",
                  recipients: 203,
                  time: "5 hours ago",
                  status: "success",
                },
                { title: "Payment Reminder", type: "Billing", recipients: 78, time: "8 hours ago", status: "success" },
                { title: "Friend Request", type: "Social", recipients: 34, time: "12 hours ago", status: "success" },
                { title: "Security Alert", type: "System", recipients: 156, time: "1 day ago", status: "success" },
              ].map((broadcast, index) => (
                <div key={index} className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{broadcast.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {broadcast.type} • {broadcast.recipients} recipients
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{broadcast.time}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">Sent</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
