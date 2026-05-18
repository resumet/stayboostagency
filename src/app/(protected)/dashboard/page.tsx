import Link from "next/link"
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  UserCheck,
} from "lucide-react"

import { getDashboardData } from "@/actions/dashboard-actions"
import { DashboardCalendar } from "@/components/calendar/dashboard-calendar"
import { PageHeader } from "@/components/page-header"
import { WorkStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"

export default async function DashboardPage() {
  const data = await getDashboardData()
  const cards = [
    {
      label: "계약 호텔",
      value: data.stats.hotels,
      icon: Building2,
    },
    {
      label: "진행중 업무",
      value: data.stats.activeWork,
      icon: ClipboardList,
    },
    {
      label: "이번 달 종료 예정",
      value: data.stats.endingThisMonth,
      icon: CalendarClock,
    },
  ]

  if (data.profile.role === "admin") {
    cards.push({
      label: "승인 대기 요청",
      value: data.stats.pendingRequests,
      icon: UserCheck,
    })
  }

  return (
    <>
      <PageHeader
        title="대시보드"
        description="호텔 마케팅 운영 현황과 전체 업무 일정을 확인합니다."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{card.value}</p>
                </div>
                <div className="rounded-lg border bg-muted p-3 text-muted-foreground">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">전체 일정</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/work">업무 목록</Link>
          </Button>
        </div>
        <DashboardCalendar items={data.calendarItems} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 등록 호텔</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>호텔</TableHead>
                  <TableHead>대표자</TableHead>
                  <TableHead>등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentHotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">
                      <Link href={`/hotels/${hotel.id}`}>{hotel.name}</Link>
                    </TableCell>
                    <TableCell>{hotel.owner_name}</TableCell>
                    <TableCell>{formatDate(hotel.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.recentHotels.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                최근 등록 호텔이 없습니다.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 수정 업무</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>업무</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentWorkItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link href={`/work/${item.id}`}>{item.title}</Link>
                    </TableCell>
                    <TableCell>
                      {formatDate(item.start_date)} - {formatDate(item.end_date)}
                    </TableCell>
                    <TableCell>
                      <WorkStatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.recentWorkItems.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4" />
                최근 수정 업무가 없습니다.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
