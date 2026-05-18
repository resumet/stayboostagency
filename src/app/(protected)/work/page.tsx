import Link from "next/link"
import { ClipboardList, Plus, Search, Trash2 } from "lucide-react"

import { getHotels } from "@/actions/hotel-actions"
import { getProducts } from "@/actions/product-actions"
import { deleteWorkItem, getWorkItems } from "@/actions/work-actions"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { WorkStatusBadge } from "@/components/status-badge"
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
import { workStatusLabels } from "@/lib/constants"
import { formatDate } from "@/lib/format"
import type { WorkStatus } from "@/types/database.types"

type WorkPageProps = {
  searchParams: Promise<{
    hotelId?: string
    productId?: string
    status?: WorkStatus | "all"
    from?: string
    to?: string
  }>
}

const statusValues = Object.keys(workStatusLabels) as WorkStatus[]

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const params = await searchParams
  const filters = {
    hotelId: params.hotelId && params.hotelId !== "all" ? params.hotelId : undefined,
    productId:
      params.productId && params.productId !== "all" ? params.productId : undefined,
    status: params.status && params.status !== "all" ? params.status : undefined,
    from: params.from || undefined,
    to: params.to || undefined,
  }
  const [hotels, products, workItems] = await Promise.all([
    getHotels(),
    getProducts(false),
    getWorkItems(filters),
  ])

  return (
    <>
      <PageHeader
        title="업무 관리"
        description="호텔별 진행 업무를 필터링하고 일정을 수정합니다."
        action={
          <Button asChild>
            <Link href="/work/new">
              <Plus className="size-4" />
              업무 추가
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-6">
            <Select name="hotelId" defaultValue={params.hotelId ?? "all"}>
              <SelectTrigger>
                <SelectValue placeholder="호텔" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 호텔</SelectItem>
                {hotels.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="productId" defaultValue={params.productId ?? "all"}>
              <SelectTrigger>
                <SelectValue placeholder="상품" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상품</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="status" defaultValue={params.status ?? "all"}>
              <SelectTrigger>
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                {statusValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {workStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input name="from" type="date" defaultValue={params.from ?? ""} />
            <Input name="to" type="date" defaultValue={params.to ?? ""} />
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              적용
            </Button>
          </form>
        </CardContent>
      </Card>

      {workItems.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="업무가 없습니다"
          description="업무를 직접 추가하거나 호텔 상세에서 결제 상품 기반으로 자동 생성하세요."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>호텔</TableHead>
                  <TableHead>결제 상품</TableHead>
                  <TableHead>업무명</TableHead>
                  <TableHead>시작일</TableHead>
                  <TableHead>종료일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>특이사항</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.hotels?.name ?? "-"}</TableCell>
                    <TableCell>
                      {item.hotel_purchased_products?.products?.name ?? "-"}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{formatDate(item.start_date)}</TableCell>
                    <TableCell>{formatDate(item.end_date)}</TableCell>
                    <TableCell>
                      <WorkStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.notes || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/work/${item.id}`}>수정</Link>
                        </Button>
                        <form action={deleteWorkItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            <Trash2 className="size-3.5" />
                            삭제
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
