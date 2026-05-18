import Link from "next/link"
import { Building2, Plus, Search } from "lucide-react"

import { deactivateHotel, getHotels } from "@/actions/hotel-actions"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"

type HotelsPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams
  const hotels = await getHotels({ query: params.q })

  return (
    <>
      <PageHeader
        title="호텔 관리"
        description="계약 호텔 정보와 사업자등록증 파일을 관리합니다."
        action={
          <Button asChild>
            <Link href="/hotels/new">
              <Plus className="size-4" />
              호텔 추가
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>검색</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2">
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="호텔명, 대표자명, 사업자번호"
            />
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              검색
            </Button>
          </form>
        </CardContent>
      </Card>

      {hotels.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="등록된 호텔이 없습니다"
          description="계약 호텔을 추가하면 이곳에 표시됩니다."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>호텔명</TableHead>
                  <TableHead>대표자</TableHead>
                  <TableHead>사업자번호</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>주소</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.owner_name}</TableCell>
                    <TableCell>{hotel.business_number}</TableCell>
                    <TableCell>{hotel.hotel_phone || hotel.owner_phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{hotel.address}</TableCell>
                    <TableCell>{formatDate(hotel.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/hotels/${hotel.id}`}>상세/수정</Link>
                        </Button>
                        <form action={deactivateHotel}>
                          <input type="hidden" name="id" value={hotel.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            비활성
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
