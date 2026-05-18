"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useForm, useWatch, type Resolver } from "react-hook-form"

import { createHotelPurchasedProduct } from "@/actions/work-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  purchasedProductSchema,
  type PurchasedProductFormInput,
} from "@/lib/validations/work"
import type { ProductWithItems } from "@/actions/product-actions"

export function PurchaseProductForm({
  hotelId,
  products,
}: {
  hotelId: string
  products: ProductWithItems[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<PurchasedProductFormInput>({
    resolver: zodResolver(purchasedProductSchema) as unknown as Resolver<PurchasedProductFormInput>,
    defaultValues: {
      hotel_id: hotelId,
      product_id: "",
      purchased_at: "",
      price_amount: null,
      price_label: "",
      notes: "",
      auto_create_work_items: true,
      default_start_date: "",
      default_end_date: "",
    },
  })
  const autoCreate = useWatch({
    control: form.control,
    name: "auto_create_work_items",
  })
  const selectedProductId = useWatch({
    control: form.control,
    name: "product_id",
  })

  const onSubmit = form.handleSubmit((values) => {
    const parsedValues = purchasedProductSchema.parse(values)
    setError(null)
    startTransition(async () => {
      const result = await createHotelPurchasedProduct(parsedValues)
      if (!result.ok) {
        setError(result.error)
        return
      }

      form.reset({
        hotel_id: hotelId,
        product_id: "",
        purchased_at: "",
        price_amount: null,
        price_label: "",
        notes: "",
        auto_create_work_items: true,
        default_start_date: "",
        default_end_date: "",
      })
      router.refresh()
    })
  })

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input type="hidden" {...form.register("hotel_id")} />
      <div className="space-y-2">
        <Label>상품</Label>
        <Select
          value={selectedProductId}
          onValueChange={(value) => form.setValue("product_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="상품 선택" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.product_id ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.product_id.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="purchased_at">결제일</Label>
          <Input id="purchased_at" type="date" {...form.register("purchased_at")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_amount">실제 금액</Label>
          <Input
            id="price_amount"
            type="number"
            min="0"
            {...form.register("price_amount", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_label">표시 금액</Label>
          <Input id="price_label" {...form.register("price_label")} />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Checkbox
          id="auto_create_work_items"
          checked={autoCreate}
          onCheckedChange={(checked) =>
            form.setValue("auto_create_work_items", checked === true)
          }
        />
        <Label htmlFor="auto_create_work_items">상품 세부 항목으로 업무 자동 생성</Label>
      </div>
      {autoCreate ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default_start_date">기본 시작일</Label>
            <Input
              id="default_start_date"
              type="date"
              {...form.register("default_start_date")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_end_date">기본 종료일</Label>
            <Input
              id="default_end_date"
              type="date"
              {...form.register("default_end_date")}
            />
          </div>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="notes">결제/계약 메모</Label>
        <Textarea id="notes" rows={3} {...form.register("notes")} />
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <Button type="submit" disabled={isPending}>
        <Plus className="size-4" />
        결제 상품 추가
      </Button>
    </form>
  )
}
