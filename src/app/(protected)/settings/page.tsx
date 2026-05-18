import { CheckCircle2, XCircle } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ApprovalStatusBadge } from "@/components/status-badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { env, isSupabaseConfigured } from "@/lib/env"
import { requireApprovedProfile } from "@/lib/auth"

export default async function SettingsPage() {
  const { profile } = await requireApprovedProfile()
  const configured = isSupabaseConfigured()

  return (
    <>
      <PageHeader
        title="설정"
        description="계정 정보와 운영 환경 구성을 확인합니다."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>계정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="이메일" value={profile.email} />
            <Row label="이름" value={profile.full_name || "-"} />
            <Row label="역할" value={profile.role === "admin" ? "어드민" : "사용자"} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">승인 상태</span>
              <ApprovalStatusBadge status={profile.approval_status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>환경</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Supabase 연결값</span>
              <span className="flex items-center gap-2">
                {configured ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <XCircle className="size-4 text-red-400" />
                )}
                {configured ? "설정됨" : "미설정"}
              </span>
            </div>
            <Row label="어드민 이메일" value={env.adminEmail} />
            <Row label="사이트 URL" value={env.siteUrl} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}
