import { ShieldAlert } from "lucide-react"

import { signOut } from "@/actions/auth-actions"
import { ApprovalStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { approvalStatusLabels } from "@/lib/constants"
import { getCurrentProfile } from "@/lib/auth"
import type { ApprovalStatus } from "@/types/database.types"

type PendingPageProps = {
  searchParams: Promise<{ status?: ApprovalStatus }>
}

export default async function PendingApprovalPage({
  searchParams,
}: PendingPageProps) {
  const current = await getCurrentProfile()
  const params = await searchParams
  const status = current?.profile.approval_status ?? params.status ?? "pending"

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ShieldAlert className="size-5" />
          </div>
          <CardTitle>관리자 승인이 필요합니다</CardTitle>
          <CardDescription>
            승인된 계정만 StayBoost Admin 내부 페이지에 접근할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">현재 계정</span>
              <span className="font-medium">{current?.profile.email ?? "-"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-muted-foreground">승인 상태</span>
              <ApprovalStatusBadge status={status} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            현재 상태는 {approvalStatusLabels[status]}입니다. 관리자 승인 후
            이용할 수 있습니다.
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              로그아웃
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
