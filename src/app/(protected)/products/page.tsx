import Link from "next/link"
import { Archive, Edit, Package, Plus } from "lucide-react"

import {
  deleteProduct,
  getProducts,
  toggleProductActive,
} from "@/actions/product-actions"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
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

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <>
      <PageHeader
        title="상품 관리"
        description="마케팅 패키지와 세부 항목을 관리합니다."
        action={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="size-4" />
              상품 추가
            </Link>
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="등록된 상품이 없습니다"
          description="초기 seed를 실행하거나 새 상품을 추가하세요."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>상품 목록</CardTitle>
            <CardDescription>
              비활성화된 상품도 이 목록에서 다시 활성화할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품명</TableHead>
                  <TableHead>부제목</TableHead>
                  <TableHead>항목 수</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.subtitle || "-"}
                    </TableCell>
                    <TableCell>{product.product_items.length}</TableCell>
                    <TableCell>
                      {product.is_active ? "활성" : "비활성"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/products/${product.id}`}>
                            <Edit className="size-3.5" />
                            수정
                          </Link>
                        </Button>
                        <form action={toggleProductActive}>
                          <input type="hidden" name="id" value={product.id} />
                          <input
                            type="hidden"
                            name="nextActive"
                            value={String(!product.is_active)}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            {product.is_active ? "비활성" : "활성"}
                          </Button>
                        </form>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            <Archive className="size-3.5" />
                            보관
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
