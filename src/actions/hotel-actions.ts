"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/actions/auth-actions"
import { requireApprovedProfile } from "@/lib/auth"
import {
  allowedBusinessLicenseExtensions,
  businessLicenseBucket,
  maxBusinessLicenseBytes,
} from "@/lib/constants"
import { emptyToNull } from "@/lib/format"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { hotelSchema } from "@/lib/validations/hotel"
import type {
  Hotel,
  HotelPurchasedProduct,
  Product,
} from "@/types/database.types"

export type PurchasedProductWithProduct = HotelPurchasedProduct & {
  products: Product | null
}

export type HotelDetails = Hotel & {
  business_license_signed_url?: string | null
  hotel_purchased_products: PurchasedProductWithProduct[]
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function parseHotelFormData(formData: FormData) {
  return hotelSchema.safeParse({
    name: getString(formData, "name"),
    owner_name: getString(formData, "owner_name"),
    business_number: getString(formData, "business_number"),
    owner_phone: getString(formData, "owner_phone"),
    address: getString(formData, "address"),
    hotel_phone: getString(formData, "hotel_phone"),
    notes: getString(formData, "notes"),
    photo_folder_url: getString(formData, "photo_folder_url"),
  })
}

function getBusinessLicenseFile(formData: FormData) {
  const file = formData.get("business_license")
  if (!(file instanceof File) || file.size === 0) {
    return null
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!allowedBusinessLicenseExtensions.includes(extension)) {
    throw new Error("사업자등록증 파일 형식은 pdf, jpg, jpeg, png, webp만 가능합니다.")
  }

  if (file.size > maxBusinessLicenseBytes) {
    throw new Error("사업자등록증 파일은 10MB 이하만 업로드할 수 있습니다.")
  }

  return file
}

async function uploadBusinessLicense(hotelId: string, file: File) {
  const supabase = await createSupabaseServerClient()
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "file"
  const safeBaseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w.-]+/g, "_")
      .slice(0, 80) || "business-license"
  const filePath = `${hotelId}/${Date.now()}-${safeBaseName}.${extension}`

  const { error } = await supabase.storage
    .from(businessLicenseBucket)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(error.message)
  }

  return filePath
}

export async function getHotels(filters?: { query?: string }) {
  await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const search = filters?.query?.trim()
  let query = supabase
    .from("hotels")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,owner_name.ilike.%${search}%,business_number.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) {
    return [] as Hotel[]
  }

  return data ?? []
}

export async function getHotel(id: string) {
  await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("hotels")
    .select("*, hotel_purchased_products(*, products(*))")
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  let signedUrl: string | null = null
  if (data.business_license_file_path) {
    const { data: signed } = await supabase.storage
      .from(businessLicenseBucket)
      .createSignedUrl(data.business_license_file_path, 60 * 30)
    signedUrl = signed?.signedUrl ?? null
  }

  const hotel = data as unknown as HotelDetails

  return {
    ...hotel,
    business_license_signed_url: signedUrl,
    hotel_purchased_products: hotel.hotel_purchased_products ?? [],
  }
}

export async function createHotel(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseHotelFormData(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 오류" }
  }

  let file: File | null = null
  try {
    file = getBusinessLicenseFile(formData)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "파일 오류" }
  }

  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const payload = parsed.data
  const { data: hotel, error } = await supabase
    .from("hotels")
    .insert({
      name: payload.name,
      owner_name: payload.owner_name,
      business_number: payload.business_number,
      owner_phone: payload.owner_phone,
      address: payload.address,
      hotel_phone: emptyToNull(payload.hotel_phone) as string | null,
      notes: emptyToNull(payload.notes) as string | null,
      photo_folder_url: emptyToNull(payload.photo_folder_url) as string | null,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select()
    .single()

  if (error || !hotel) {
    return { ok: false, error: error?.message ?? "호텔 생성 실패" }
  }

  if (file) {
    try {
      const filePath = await uploadBusinessLicense(hotel.id, file)
      await supabase
        .from("hotels")
        .update({ business_license_file_path: filePath })
        .eq("id", hotel.id)
    } catch (uploadError) {
      return {
        ok: false,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "사업자등록증 업로드 실패",
      }
    }
  }

  revalidatePath("/hotels")
  return { ok: true, data: { id: hotel.id } }
}

export async function updateHotel(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseHotelFormData(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 오류" }
  }

  let file: File | null = null
  try {
    file = getBusinessLicenseFile(formData)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "파일 오류" }
  }

  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const payload = parsed.data
  const updatePayload: Partial<Hotel> = {
    name: payload.name,
    owner_name: payload.owner_name,
    business_number: payload.business_number,
    owner_phone: payload.owner_phone,
    address: payload.address,
    hotel_phone: emptyToNull(payload.hotel_phone) as string | null,
    notes: emptyToNull(payload.notes) as string | null,
    photo_folder_url: emptyToNull(payload.photo_folder_url) as string | null,
    updated_by: profile.id,
  }

  if (file) {
    try {
      updatePayload.business_license_file_path = await uploadBusinessLicense(
        id,
        file
      )
    } catch (uploadError) {
      return {
        ok: false,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "사업자등록증 업로드 실패",
      }
    }
  }

  const { error } = await supabase.from("hotels").update(updatePayload).eq("id", id)
  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/hotels")
  revalidatePath(`/hotels/${id}`)
  return { ok: true, data: { id } }
}

export async function deactivateHotel(formData: FormData) {
  await requireApprovedProfile()
  const id = String(formData.get("id") ?? "")
  const supabase = await createSupabaseServerClient()

  if (id) {
    await supabase.from("hotels").update({ is_active: false }).eq("id", id)
  }

  revalidatePath("/hotels")
}
