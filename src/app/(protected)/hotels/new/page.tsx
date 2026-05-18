import { HotelForm } from "@/components/hotels/hotel-form"
import { PageHeader } from "@/components/page-header"

export default function NewHotelPage() {
  return (
    <>
      <PageHeader
        title="호텔 추가"
        description="새 계약 호텔의 기본 정보를 등록합니다."
      />
      <HotelForm />
    </>
  )
}
