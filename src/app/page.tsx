import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/auth"

export default async function HomePage() {
  const current = await getCurrentProfile()

  if (!current) {
    redirect("/login")
  }

  if (current.profile.approval_status !== "approved") {
    redirect(`/pending-approval?status=${current.profile.approval_status}`)
  }

  redirect("/dashboard")
}
