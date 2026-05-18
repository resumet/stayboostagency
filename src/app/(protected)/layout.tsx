import { AppShell } from "@/components/layout/app-shell"
import { requireApprovedProfile } from "@/lib/auth"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await requireApprovedProfile()

  return <AppShell profile={profile}>{children}</AppShell>
}
