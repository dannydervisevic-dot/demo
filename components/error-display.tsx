"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface ErrorDisplayProps {
  message?: string
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  const getErrorDetails = () => {
    switch (message) {
      case "rate-limit":
        return {
          title: "Rate Limit Exceeded",
          description: "Your Supabase project has exceeded its rate limits",
          instructions: [
            "Your Supabase free tier project may be hitting rate limits",
            "Wait a few minutes before trying again",
            "Consider upgrading your Supabase plan for higher limits",
            "Check if your Supabase project is paused in the dashboard",
          ],
        }
      case "connection-error":
        return {
          title: "Connection Error",
          description: "Unable to connect to the database",
          instructions: [
            "Check if your Supabase project is active",
            "Verify your environment variables are correct",
            "Check your internet connection",
            "Try refreshing the page",
          ],
        }
      default:
        return {
          title: "Unexpected Error",
          description: "Something went wrong",
          instructions: [
            "Try refreshing the page",
            "Check the browser console for more details",
            "If the issue persists, check your Supabase project status",
          ],
        }
    }
  }

  const { title, description, instructions } = getErrorDetails()

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-500">Please check the following:</AlertDescription>
          </Alert>

          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {instructions.map((instruction, index) => (
                <li key={index} className="leading-relaxed">
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/users">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/setup">Go to Setup</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
