"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Bell, Send, LayoutDashboard, Layers, Radio } from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Notification Management",
    href: "/notification-categories",
    icon: Layers,
  },
  {
    label: "User Management",
    href: "/users",
    icon: Users,
  },
  {
    label: "Notification Schemas",
    href: "/notification-schemas",
    icon: Bell,
  },
  {
    label: "Trigger Notification",
    href: "/trigger-notification",
    icon: Send,
  },
  {
    label: "Broadcast",
    href: "/broadcast",
    icon: Radio,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-xl font-bold text-foreground">Notification Platform</h2>
        <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-md transition-colors flex-shrink-0",
                      isActive ? "bg-primary-foreground/20" : "bg-muted",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
