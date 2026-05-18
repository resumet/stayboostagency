"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { env } from "@/lib/env"
import { requireAdminProfile } from "@/lib/auth"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"
import type { ApprovalStatus } from "@/types/database.types"

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.siteUrl}/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect("/login?error=oauth")
  }

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getLoginRequests(status?: ApprovalStatus) {
  await requireAdminProfile()
  const admin = createSupabaseAdminClient()

  if (!admin) {
    return []
  }

  let query = admin
    .from("login_requests")
    .select("*, profiles(email, full_name, avatar_url, approval_status)")
    .order("requested_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data } = await query
  return data ?? []
}

export async function approveLoginRequest(formData: FormData) {
  const { profile } = await requireAdminProfile()
  const requestId = String(formData.get("requestId") ?? "")
  const admin = createSupabaseAdminClient()

  if (!admin || !requestId) {
    return
  }

  const { data: request } = await admin
    .from("login_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (request) {
    await admin
      .from("profiles")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: profile.id,
      })
      .eq("id", request.user_id)

    await admin
      .from("login_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile.id,
        review_note: null,
      })
      .eq("id", requestId)
  }

  revalidatePath("/admin/login-requests")
  revalidatePath("/dashboard")
}

export async function rejectLoginRequest(formData: FormData) {
  const { profile } = await requireAdminProfile()
  const requestId = String(formData.get("requestId") ?? "")
  const reviewNote = String(formData.get("reviewNote") ?? "").trim() || null
  const admin = createSupabaseAdminClient()

  if (!admin || !requestId) {
    return
  }

  const { data: request } = await admin
    .from("login_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (request) {
    await admin
      .from("profiles")
      .update({
        approval_status: "rejected",
        approved_at: null,
        approved_by: profile.id,
      })
      .eq("id", request.user_id)

    await admin
      .from("login_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile.id,
        review_note: reviewNote,
      })
      .eq("id", requestId)
  }

  revalidatePath("/admin/login-requests")
  revalidatePath("/dashboard")
}
