"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Database, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export function SetupClient() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "instructions">("idle")
  const [message, setMessage] = useState("")
  const [instructions, setInstructions] = useState<string[]>([])
  const router = useRouter()

  const initializeDatabase = async () => {
    setStatus("loading")
    setMessage("Checking database connection...")

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.instructions) {
          setStatus("instructions")
          setMessage(data.error)
          setInstructions(data.instructions)
        } else {
          throw new Error(data.error || "Failed to initialize database")
        }
        return
      }

      setStatus("success")
      setMessage("Database initialized successfully!")

      setTimeout(() => {
        router.push("/users")
        router.refresh()
      }, 2000)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "An error occurred")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Initialize your notification platform database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Click the button below to check your database connection and seed initial data.
              </p>
              <Button onClick={initializeDatabase} className="w-full" size="lg">
                Check Database Setup
              </Button>
            </div>
          )}

          {status === "loading" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">{message}</AlertDescription>
            </Alert>
          )}

          {status === "instructions" && (
            <div className="space-y-4">
              <Alert variant="default" className="border-amber-500 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-500">{message}</AlertDescription>
              </Alert>

              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <h4 className="font-semibold text-sm">Setup Instructions:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="leading-relaxed">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              <Button onClick={initializeDatabase} variant="outline" className="w-full bg-transparent">
                Check Again
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <Button onClick={initializeDatabase} variant="outline" className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
