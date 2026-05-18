import { getHotels } from "@/actions/hotel-actions"
import { getPurchasedProducts } from "@/actions/work-actions"
import { PageHeader } from "@/components/page-header"
import { WorkForm } from "@/components/work/work-form"

export default async function NewWorkPage() {
  const [hotels, purchasedProducts] = await Promise.all([
    getHotels(),
    getPurchasedProducts(),
  ])

  return (
    <>
      <PageHeader
        title="업무 추가"
        description="상품과 관계없는 수동 업무도 등록할 수 있습니다."
      />
      <WorkForm hotels={hotels} purchasedProducts={purchasedProducts} />
    </>
  )
}
