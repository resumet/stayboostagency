import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

import {
  env,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env"
import type { Database } from "@/types/database.types"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot always write cookies; Route Handlers and
          // Server Actions still can. Supabase session refresh is best-effort.
        }
      },
    },
  })
}

export function createSupabaseAdminClient() {
  if (!isSupabaseConfigured() || !env.supabaseServiceRoleKey) {
    return null
  }

  return createClient<Database>(
    getSupabaseUrl(),
    env.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
