import { notFound } from "next/navigation"

import { getHotels } from "@/actions/hotel-actions"
import { getPurchasedProducts, getWorkItem } from "@/actions/work-actions"
import { PageHeader } from "@/components/page-header"
import { WorkForm } from "@/components/work/work-form"

type WorkDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { id } = await params
  const [workItem, hotels, purchasedProducts] = await Promise.all([
    getWorkItem(id),
    getHotels(),
    getPurchasedProducts(),
  ])

  if (!workItem) {
    notFound()
  }

  return (
    <>
      <PageHeader
        title="업무 수정"
        description="업무 일정, 상태, 특이사항을 수정합니다."
      />
      <WorkForm
        workItem={workItem}
        hotels={hotels}
        purchasedProducts={purchasedProducts}
      />
    </>
  )
}
