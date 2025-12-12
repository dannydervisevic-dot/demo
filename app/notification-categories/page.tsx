import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default function NotificationCategoriesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Notification Categories</h1>
            <p className="text-muted-foreground">
              Manage notification categories, subcategories, events, and templates
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Category Structure Overview
              </CardTitle>
              <CardDescription>The notification system follows a 4-level hierarchy structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Categories</h3>
                    <p className="text-sm text-muted-foreground">
                      Top-level organization (e.g., System, Marketing, Social, Billing)
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Subcategories</h3>
                    <p className="text-sm text-muted-foreground">
                      Grouping within categories (e.g., Alerts, Updates, Promotions)
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Events</h3>
                    <p className="text-sm text-muted-foreground">
                      Specific notification triggers (e.g., Login, Password Reset, New Message)
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Message templates for each event across different channels (Email, In-App, Push, SMS)
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Note:</span> This section is currently under development. Full
                  category management functionality will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
