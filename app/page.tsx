import { DashboardClient } from "@/components/dashboard-client"
import { Navigation } from "@/components/navigation"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <DashboardClient />
      </main>
    </div>
  )
}
