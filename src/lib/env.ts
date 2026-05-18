const fallbackUrl = "https://example.supabase.co"
const fallbackAnonKey = "missing-supabase-anon-key"

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "resumet@gmail.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
}

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}

export function getSupabaseUrl() {
  return env.supabaseUrl || fallbackUrl
}

export function getSupabaseAnonKey() {
  return env.supabaseAnonKey || fallbackAnonKey
}
