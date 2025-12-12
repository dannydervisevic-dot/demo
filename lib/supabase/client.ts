import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey)
}

// Legacy export for backward compatibility
export function createClient() {
  return createBrowserClient()
}
