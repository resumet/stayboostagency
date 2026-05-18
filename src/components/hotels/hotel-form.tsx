"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import { useForm, type Resolver } from "react-hook-form"

import { createHotel, updateHotel } from "@/actions/hotel-actions"
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
import { Textarea } from "@/components/ui/textarea"
import {
  hotelSchema,
  type HotelFormInput,
  type HotelInput,
} from "@/lib/validations/hotel"
import type { Hotel } from "@/types/database.types"

function defaultValues(hotel?: Hotel): HotelInput {
  return {
    name: hotel?.name ?? "",
    owner_name: hotel?.owner_name ?? "",
    business_number: hotel?.business_number ?? "",
    owner_phone: hotel?.owner_phone ?? "",
    address: hotel?.address ?? "",
    hotel_phone: hotel?.hotel_phone ?? "",
    notes: hotel?.notes ?? "",
    photo_folder_url: hotel?.photo_folder_url ?? "",
  }
}

export function HotelForm({ hotel }: { hotel?: Hotel }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<HotelFormInput>({
    resolver: zodResolver(hotelSchema) as unknown as Resolver<HotelFormInput>,
    defaultValues: defaultValues(hotel),
  })

  const onSubmit = form.handleSubmit((_, event) => {
    const formElement = event?.currentTarget
    if (!(formElement instanceof HTMLFormElement)) {
      setError("폼 데이터를 읽을 수 없습니다.")
      return
    }

    const formData = new FormData(formElement)
    setError(null)
    startTransition(async () => {
      const result = hotel
        ? await updateHotel(hotel.id, formData)
        : await createHotel(formData)

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.push(hotel ? `/hotels/${hotel.id}` : `/hotels/${result.data?.id}`)
      router.refresh()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>호텔 정보</CardTitle>
          <CardDescription>
            계약 호텔의 사업자 정보와 운영 메모를 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="호텔명" id="name" error={form.formState.errors.name?.message}>
            <Input id="name" {...form.register("name")} />
          </Field>
          <Field
            label="대표자 이름"
            id="owner_name"
            error={form.formState.errors.owner_name?.message}
          >
            <Input id="owner_name" {...form.register("owner_name")} />
          </Field>
          <Field
            label="사업자번호"
            id="business_number"
            error={form.formState.errors.business_number?.message}
          >
            <Input id="business_number" {...form.register("business_number")} />
          </Field>
          <Field
            label="대표자 전화번호"
            id="owner_phone"
            error={form.formState.errors.owner_phone?.message}
          >
            <Input id="owner_phone" {...form.register("owner_phone")} />
          </Field>
          <Field
            label="호텔 전화번호"
            id="hotel_phone"
            error={form.formState.errors.hotel_phone?.message}
          >
            <Input id="hotel_phone" {...form.register("hotel_phone")} />
          </Field>
          <Field
            label="사진 관리 폴더 URL"
            id="photo_folder_url"
            error={form.formState.errors.photo_folder_url?.message}
          >
            <Input
              id="photo_folder_url"
              type="url"
              {...form.register("photo_folder_url")}
            />
          </Field>
          <Field
            label="호텔 주소"
            id="address"
            error={form.formState.errors.address?.message}
            className="md:col-span-2"
          >
            <Input id="address" {...form.register("address")} />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="business_license">사업자등록증</Label>
            <Input
              id="business_license"
              name="business_license"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
            />
            <p className="text-xs text-muted-foreground">
              PDF/JPG/PNG/WEBP, 최대 10MB
            </p>
          </div>
          <Field label="기타 특이사항" id="notes" className="md:col-span-2">
            <Textarea id="notes" rows={4} {...form.register("notes")} />
          </Field>
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

function Field({
  label,
  id,
  error,
  className,
  children,
}: {
  label: string
  id: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
