import { ShieldCheck } from "lucide-react"

import {
  approveLoginRequest,
  getLoginRequests,
  rejectLoginRequest,
} from "@/actions/auth-actions"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { ApprovalStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/format"
import type { ApprovalStatus } from "@/types/database.types"

type LoginRequestsPageProps = {
  searchParams: Promise<{ status?: ApprovalStatus | "all" }>
}

export default async function LoginRequestsPage({
  searchParams,
}: LoginRequestsPageProps) {
  const params = await searchParams
  const status =
    params.status && params.status !== "all" ? params.status : undefined
  const requests = await getLoginRequests(status)

  return (
    <>
      <PageHeader
        title="로그인 요청"
        description="Google 계정 로그인 요청을 승인하거나 거절합니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="max-w-xs">
            <Select name="status" defaultValue={params.status ?? "pending"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">거절됨</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="mt-2 w-full" variant="outline">
              적용
            </Button>
          </form>
        </CardContent>
      </Card>

      {requests.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="요청이 없습니다"
          description="선택한 상태에 해당하는 로그인 요청이 없습니다."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>요청일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">처리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.email}</TableCell>
                    <TableCell>{request.full_name || "-"}</TableCell>
                    <TableCell>{formatDateTime(request.requested_at)}</TableCell>
                    <TableCell>
                      <ApprovalStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <form action={approveLoginRequest}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={request.status === "approved"}
                          >
                            승인
                          </Button>
                        </form>
                        <form action={rejectLoginRequest} className="flex gap-2">
                          <input type="hidden" name="requestId" value={request.id} />
                          <Input
                            name="reviewNote"
                            placeholder="거절 메모"
                            className="h-7 w-32"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            disabled={request.status === "rejected"}
                          >
                            거절
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  )
}
