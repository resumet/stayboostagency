import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"

import { getHotel } from "@/actions/hotel-actions"
import { getProducts } from "@/actions/product-actions"
import { HotelForm } from "@/components/hotels/hotel-form"
import { PurchaseProductForm } from "@/components/hotels/purchase-product-form"
import { PageHeader } from "@/components/page-header"
import { PurchasedProductStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { formatCurrency, formatDate } from "@/lib/format"

type HotelDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function HotelDetailPage({
  params,
}: HotelDetailPageProps) {
  const { id } = await params
  const [hotel, products] = await Promise.all([getHotel(id), getProducts(false)])

  if (!hotel) {
    notFound()
  }

  return (
    <>
      <PageHeader
        title={hotel.name}
        description="호텔 정보, 파일, 결제 상품을 관리합니다."
        action={
          hotel.photo_folder_url ? (
            <Button asChild variant="outline">
              <a href={hotel.photo_folder_url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                사진 폴더
              </a>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <HotelForm hotel={hotel} />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사업자등록증</CardTitle>
              <CardDescription>private bucket signed URL로 열람합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {hotel.business_license_signed_url ? (
                <Button asChild variant="outline">
                  <a
                    href={hotel.business_license_signed_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    파일 열기
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  업로드된 사업자등록증이 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>결제 상품 추가</CardTitle>
              <CardDescription>
                선택한 상품의 세부 항목으로 업무를 자동 생성할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseProductForm hotelId={hotel.id} products={products} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>결제 상품 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품</TableHead>
                <TableHead>결제일</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>메모</TableHead>
                <TableHead className="text-right">업무</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotel.hotel_purchased_products.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    {purchase.products?.name ?? "-"}
                  </TableCell>
                  <TableCell>{formatDate(purchase.purchased_at)}</TableCell>
                  <TableCell>
                    {purchase.price_label ||
                      formatCurrency(purchase.price_amount)}
                  </TableCell>
                  <TableCell>
                    <PurchasedProductStatusBadge status={purchase.status} />
                  </TableCell>
                  <TableCell className="max-w-sm truncate">
                    {purchase.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/work?hotelId=${hotel.id}`}>보기</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hotel.hotel_purchased_products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              아직 결제 상품이 없습니다.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
