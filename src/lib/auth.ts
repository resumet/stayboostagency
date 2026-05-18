import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

import { env } from "@/lib/env"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"
import type { Profile } from "@/types/database.types"

export type CurrentProfile = {
  user: User
  profile: Profile
}

function getUserName(user: User) {
  const metadata = user.user_metadata ?? {}
  return (
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined) ??
    null
  )
}

function getAvatarUrl(user: User) {
  const metadata = user.user_metadata ?? {}
  return (metadata.avatar_url as string | undefined) ?? null
}

export async function ensureProfileForUser(user: User) {
  const admin = createSupabaseAdminClient()
  if (!admin || !user.email) {
    return null
  }

  const email = user.email.toLowerCase()
  const isAdmin = email === env.adminEmail.toLowerCase()
  const profilePayload = {
    id: user.id,
    email,
    full_name: getUserName(user),
    avatar_url: getAvatarUrl(user),
    role: isAdmin ? "admin" : "user",
    approval_status: isAdmin ? "approved" : "pending",
    approved_at: isAdmin ? new Date().toISOString() : null,
  } as const

  const { data: existing } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!existing) {
    const { data: profile, error } = await admin
      .from("profiles")
      .insert(profilePayload)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    if (!isAdmin) {
      await admin.from("login_requests").insert({
        user_id: user.id,
        email,
        full_name: getUserName(user),
        status: "pending",
      })
    }

    return profile
  }

  if (isAdmin && existing.approval_status !== "approved") {
    const { data: profile, error } = await admin
      .from("profiles")
      .update({
        role: "admin",
        approval_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return profile
  }

  if (!isAdmin && existing.approval_status === "pending") {
    const { data: pendingRequest } = await admin
      .from("login_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle()

    if (!pendingRequest) {
      await admin.from("login_requests").insert({
        user_id: user.id,
        email,
        full_name: getUserName(user),
        status: "pending",
      })
    }
  }

  return existing
}

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load profile", error.message)
    return null
  }

  let profile: Profile | null = data

  if (!profile) {
    try {
      profile = await ensureProfileForUser(user)
    } catch (error) {
      console.error("Failed to ensure profile", error)
      return null
    }
  }

  if (!profile) {
    return null
  }

  return { user, profile }
}

export async function requireApprovedProfile() {
  const current = await getCurrentProfile()

  if (!current) {
    redirect("/login")
  }

  if (current.profile.approval_status !== "approved") {
    redirect(`/pending-approval?status=${current.profile.approval_status}`)
  }

  return current
}

export async function requireAdminProfile() {
  const current = await requireApprovedProfile()

  if (current.profile.role !== "admin") {
    redirect("/dashboard")
  }

  return current
}
