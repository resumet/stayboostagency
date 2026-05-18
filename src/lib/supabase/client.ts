"use client"

import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env"
import type { Database } from "@/types/database.types"

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey())
}
