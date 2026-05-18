"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Save, Trash2 } from "lucide-react"
import {
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form"

import {
  createProduct,
  updateProduct,
  type ProductWithItems,
} from "@/actions/product-actions"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  productSchema,
  type ProductFormInput,
  type ProductInput,
} from "@/lib/validations/product"

function toDefaultValues(product?: ProductWithItems): ProductInput {
  return {
    name: product?.name ?? "",
    subtitle: product?.subtitle ?? "",
    description: product?.description ?? "",
    is_active: product?.is_active ?? true,
    sort_order: product?.sort_order ?? 0,
    items:
      product?.product_items.map((item) => ({
        id: item.id,
        name: item.name,
        price_amount: item.price_amount,
        price_label: item.price_label,
        description: item.description ?? "",
        sort_order: item.sort_order,
      })) ?? [],
  }
}

export function ProductForm({ product }: { product?: ProductWithItems }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormInput>,
    defaultValues: toDefaultValues(product),
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })
  const isActive = useWatch({
    control: form.control,
    name: "is_active",
  })

  const onSubmit = form.handleSubmit((values) => {
    const parsedValues = productSchema.parse(values)
    setError(null)
    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, parsedValues)
        : await createProduct(parsedValues)

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.push("/products")
      router.refresh()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>상품 정보</CardTitle>
          <CardDescription>
            판매/운영에 사용할 마케팅 상품 패키지 정보를 입력합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">상품명</Label>
            <Input id="name" {...form.register("name")} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">부제목</Label>
            <Input id="subtitle" {...form.register("subtitle")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">설명</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
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
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <Label htmlFor="is_active">활성 상태</Label>
              <p className="text-xs text-muted-foreground">
                비활성화하면 목록에는 남기고 운영 사용을 중지합니다.
              </p>
            </div>
            <Switch
              id="is_active"
              checked={Boolean(isActive)}
              onCheckedChange={(checked) => form.setValue("is_active", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>세부 항목</CardTitle>
            <CardDescription>
              상품 구매 시 자동 업무로 만들 수 있는 기본 항목입니다.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                name: "",
                price_amount: null,
                price_label: "",
                description: "",
                sort_order: (fields.length + 1) * 10,
              })
            }
          >
            <Plus className="size-4" />
            항목 추가
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              세부 항목 없이도 상품을 저장할 수 있습니다.
            </div>
          ) : null}
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-md border p-3 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-3">
                <Label>항목명</Label>
                <Input {...form.register(`items.${index}.name`)} />
                <FieldError
                  message={form.formState.errors.items?.[index]?.name?.message}
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>금액</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="선택"
                  {...form.register(`items.${index}.price_amount`, {
                    setValueAs: (value) => (value === "" ? null : Number(value)),
                  })}
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>표시 금액</Label>
                <Input {...form.register(`items.${index}.price_label`)} />
                <FieldError
                  message={
                    form.formState.errors.items?.[index]?.price_label?.message
                  }
                />
              </div>
              <div className="space-y-2 lg:col-span-3">
                <Label>설명</Label>
                <Input {...form.register(`items.${index}.description`)} />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <Label>순서</Label>
                <Input
                  type="number"
                  min="0"
                  {...form.register(`items.${index}.sort_order`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="flex items-end lg:col-span-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="항목 삭제"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
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
