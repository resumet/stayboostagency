import { NextResponse, type NextRequest } from "next/server"

import { ensureProfileForUser } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=callback`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  let profile
  try {
    profile = await ensureProfileForUser(user)
  } catch (error) {
    console.error("Failed to prepare user profile", error)
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=setup`)
  }

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=setup`)
  }

  if (profile?.approval_status === "approved") {
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  return NextResponse.redirect(
    `${origin}/pending-approval?status=${profile?.approval_status ?? "pending"}`
  )
}
