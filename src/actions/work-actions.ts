"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/actions/auth-actions"
import { requireApprovedProfile } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  purchasedProductSchema,
  workItemSchema,
  type PurchasedProductInput,
  type WorkItemInput,
} from "@/lib/validations/work"
import type {
  Hotel,
  HotelPurchasedProduct,
  Product,
  ProductItem,
  WorkItem,
  WorkStatus,
} from "@/types/database.types"

export type PurchasedProductRow = HotelPurchasedProduct & {
  hotels: Pick<Hotel, "id" | "name"> | null
  products: Pick<Product, "id" | "name"> | null
}

export type WorkItemRow = WorkItem & {
  hotels: Pick<Hotel, "id" | "name"> | null
  hotel_purchased_products:
    | (Pick<HotelPurchasedProduct, "id" | "price_label" | "status"> & {
        products: Pick<Product, "id" | "name"> | null
      })
    | null
  product_items: Pick<ProductItem, "id" | "name"> | null
}

export type WorkFilters = {
  hotelId?: string
  productId?: string
  status?: WorkStatus
  from?: string
  to?: string
}

export async function getPurchasedProducts(hotelId?: string) {
  await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("hotel_purchased_products")
    .select("*, hotels(id, name), products(id, name)")
    .order("created_at", { ascending: false })

  if (hotelId) {
    query = query.eq("hotel_id", hotelId)
  }

  const { data, error } = await query
  if (error) {
    return [] as PurchasedProductRow[]
  }

  return (data ?? []) as unknown as PurchasedProductRow[]
}

export async function getWorkItems(filters?: WorkFilters) {
  await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("work_items")
    .select(
      "*, hotels(id, name), product_items(id, name), hotel_purchased_products(id, price_label, status, products(id, name))"
    )
    .order("start_date", { ascending: true })

  if (filters?.hotelId) {
    query = query.eq("hotel_id", filters.hotelId)
  }

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.from) {
    query = query.gte("end_date", filters.from)
  }

  if (filters?.to) {
    query = query.lte("start_date", filters.to)
  }

  const { data, error } = await query
  if (error) {
    return [] as WorkItemRow[]
  }

  let rows = (data ?? []) as unknown as WorkItemRow[]
  if (filters?.productId) {
    rows = rows.filter(
      (row) =>
        row.hotel_purchased_products?.products?.id === filters.productId
    )
  }

  return rows
}

export async function getWorkItem(id: string) {
  await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("work_items")
    .select(
      "*, hotels(id, name), product_items(id, name), hotel_purchased_products(id, price_label, status, products(id, name))"
    )
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  return data as unknown as WorkItemRow
}

export async function createHotelPurchasedProduct(
  input: PurchasedProductInput
): Promise<ActionResult<{ id: string; createdWorkItems: number }>> {
  const parsed = purchasedProductSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 오류" }
  }

  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const payload = parsed.data

  const { data: purchasedProduct, error } = await supabase
    .from("hotel_purchased_products")
    .insert({
      hotel_id: payload.hotel_id,
      product_id: payload.product_id,
      purchased_at: payload.purchased_at || null,
      price_amount: payload.price_amount ?? null,
      price_label: payload.price_label || null,
      notes: payload.notes || null,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select()
    .single()

  if (error || !purchasedProduct) {
    return { ok: false, error: error?.message ?? "결제 상품 등록 실패" }
  }

  let createdWorkItems = 0
  if (payload.auto_create_work_items) {
    const result = await createWorkItemsFromProduct(
      purchasedProduct.id,
      payload.default_start_date ?? "",
      payload.default_end_date ?? ""
    )
    if (!result.ok) {
      return result
    }
    createdWorkItems = result.data?.count ?? 0
  }

  revalidatePath("/hotels")
  revalidatePath(`/hotels/${payload.hotel_id}`)
  revalidatePath("/work")
  return { ok: true, data: { id: purchasedProduct.id, createdWorkItems } }
}

export async function createWorkItemsFromProduct(
  purchasedProductId: string,
  startDate: string,
  endDate: string
): Promise<ActionResult<{ count: number }>> {
  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const { data: purchasedProduct, error: purchaseError } = await supabase
    .from("hotel_purchased_products")
    .select("*, products(id)")
    .eq("id", purchasedProductId)
    .single()

  if (purchaseError || !purchasedProduct) {
    return { ok: false, error: purchaseError?.message ?? "결제 상품 조회 실패" }
  }

  const { data: items, error: itemsError } = await supabase
    .from("product_items")
    .select("*")
    .eq("product_id", purchasedProduct.product_id)
    .order("sort_order", { ascending: true })

  if (itemsError) {
    return { ok: false, error: itemsError.message }
  }

  if (!items?.length) {
    return { ok: true, data: { count: 0 } }
  }

  const { error } = await supabase.from("work_items").insert(
    items.map((item) => ({
      hotel_id: purchasedProduct.hotel_id,
      purchased_product_id: purchasedProduct.id,
      product_item_id: item.id,
      title: item.name,
      description: item.description,
      status: "scheduled",
      start_date: startDate,
      end_date: endDate,
      sort_order: item.sort_order,
      created_by: profile.id,
      updated_by: profile.id,
    }))
  )

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/work")
  return { ok: true, data: { count: items.length } }
}

export async function createWorkItem(
  input: WorkItemInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = workItemSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 오류" }
  }

  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const payload = parsed.data
  const { data, error } = await supabase
    .from("work_items")
    .insert({
      ...payload,
      purchased_product_id: payload.purchased_product_id || null,
      product_item_id: payload.product_item_id || null,
      description: payload.description || null,
      notes: payload.notes || null,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? "업무 생성 실패" }
  }

  revalidatePath("/work")
  revalidatePath("/dashboard")
  return { ok: true, data: { id: data.id } }
}

export async function updateWorkItem(
  id: string,
  input: WorkItemInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = workItemSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 오류" }
  }

  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const payload = parsed.data
  const { error } = await supabase
    .from("work_items")
    .update({
      ...payload,
      purchased_product_id: payload.purchased_product_id || null,
      product_item_id: payload.product_item_id || null,
      description: payload.description || null,
      notes: payload.notes || null,
      updated_by: profile.id,
    })
    .eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/work")
  revalidatePath(`/work/${id}`)
  revalidatePath("/dashboard")
  return { ok: true, data: { id } }
}

export async function deleteWorkItem(formData: FormData) {
  await requireApprovedProfile()
  const id = String(formData.get("id") ?? "")
  const supabase = await createSupabaseServerClient()

  if (id) {
    await supabase.from("work_items").delete().eq("id", id)
  }

  revalidatePath("/work")
  revalidatePath("/dashboard")
}

export async function getCalendarWorkItems(filters?: WorkFilters) {
  return getWorkItems(filters)
}
