import { PageHeader } from "@/components/page-header"
import { ProductForm } from "@/components/products/product-form"

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        title="상품 추가"
        description="새 마케팅 상품 패키지와 세부 항목을 등록합니다."
      />
      <ProductForm />
    </>
  )
}
