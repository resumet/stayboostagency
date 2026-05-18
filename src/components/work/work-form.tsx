"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import { useForm, useWatch, type Resolver } from "react-hook-form"

import {
  createWorkItem,
  updateWorkItem,
  type PurchasedProductRow,
  type WorkItemRow,
} from "@/actions/work-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { workStatusLabels } from "@/lib/constants"
import {
  workItemSchema,
  type WorkItemFormInput,
  type WorkItemInput,
} from "@/lib/validations/work"
import type { Hotel, WorkStatus } from "@/types/database.types"

const statusValues = Object.keys(workStatusLabels) as WorkStatus[]

function defaultValues(workItem?: WorkItemRow): WorkItemInput {
  return {
    hotel_id: workItem?.hotel_id ?? "",
    purchased_product_id: workItem?.purchased_product_id ?? null,
    product_item_id: workItem?.product_item_id ?? null,
    title: workItem?.title ?? "",
    description: workItem?.description ?? "",
    status: workItem?.status ?? "scheduled",
    start_date: workItem?.start_date ?? "",
    end_date: workItem?.end_date ?? "",
    notes: workItem?.notes ?? "",
    sort_order: workItem?.sort_order ?? 0,
  }
}

export function WorkForm({
  workItem,
  hotels,
  purchasedProducts,
}: {
  workItem?: WorkItemRow
  hotels: Hotel[]
  purchasedProducts: PurchasedProductRow[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<WorkItemFormInput>({
    resolver: zodResolver(workItemSchema) as unknown as Resolver<WorkItemFormInput>,
    defaultValues: defaultValues(workItem),
  })
  const selectedHotelId = useWatch({
    control: form.control,
    name: "hotel_id",
  })
  const selectedPurchasedProductId = useWatch({
    control: form.control,
    name: "purchased_product_id",
  })
  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  })
  const filteredPurchases = useMemo(
    () =>
      purchasedProducts.filter(
        (purchase) => !selectedHotelId || purchase.hotel_id === selectedHotelId
      ),
    [purchasedProducts, selectedHotelId]
  )
  const selectedPurchasedProductValue =
    typeof selectedPurchasedProductId === "string"
      ? selectedPurchasedProductId
      : "none"
  const selectedStatusValue =
    typeof selectedStatus === "string" ? selectedStatus : "scheduled"

  const onSubmit = form.handleSubmit((values) => {
    const parsedValues = workItemSchema.parse(values)
    setError(null)
    startTransition(async () => {
      const result = workItem
        ? await updateWorkItem(workItem.id, parsedValues)
        : await createWorkItem(parsedValues)

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.push("/work")
      router.refresh()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>업무 정보</CardTitle>
          <CardDescription>
            호텔별 진행 업무의 기간, 상태, 특이사항을 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>호텔</Label>
            <Select
              value={selectedHotelId}
              onValueChange={(value) => {
                form.setValue("hotel_id", value)
                form.setValue("purchased_product_id", null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="호텔 선택" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={form.formState.errors.hotel_id?.message} />
          </div>
          <div className="space-y-2">
            <Label>결제 상품</Label>
            <Select
              value={selectedPurchasedProductValue}
              onValueChange={(value) =>
                form.setValue(
                  "purchased_product_id",
                  value === "none" ? null : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="선택 안 함" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안 함</SelectItem>
                {filteredPurchases.map((purchase) => (
                  <SelectItem key={purchase.id} value={purchase.id}>
                    {purchase.products?.name ?? "상품명 없음"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">업무명</Label>
            <Input id="title" {...form.register("title")} />
            <FieldError message={form.formState.errors.title?.message} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">업무 설명</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">시작일</Label>
            <Input id="start_date" type="date" {...form.register("start_date")} />
            <FieldError message={form.formState.errors.start_date?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">종료일</Label>
            <Input id="end_date" type="date" {...form.register("end_date")} />
            <FieldError message={form.formState.errors.end_date?.message} />
          </div>
          <div className="space-y-2">
            <Label>상태</Label>
            <Select
              value={selectedStatusValue}
              onValueChange={(value) =>
                form.setValue("status", value as WorkStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {workStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">정렬 순서</Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              {...form.register("sort_order", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">특이사항</Label>
            <Textarea id="notes" rows={4} {...form.register("notes")} />
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" />
          저장
        </Button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-destructive">{message}</p>
}
