import { notFound } from "next/navigation"

import { getProduct } from "@/actions/product-actions"
import { PageHeader } from "@/components/page-header"
import { ProductForm } from "@/components/products/product-form"

type ProductDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <>
      <PageHeader
        title="상품 수정"
        description="상품 정보와 세부 항목을 수정합니다."
      />
      <ProductForm product={product} />
    </>
  )
}
