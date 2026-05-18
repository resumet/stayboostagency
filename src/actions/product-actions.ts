"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/actions/auth-actions"
import { requireApprovedProfile } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  productSchema,
  type ProductInput,
} from "@/lib/validations/product"
import type { Product, ProductItem } from "@/types/database.types"

export type ProductWithItems = Product & {
  product_items: ProductItem[]
}

export async function getProducts(includeInactive = true) {
  await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("products")
    .select("*, product_items(*)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return [] as ProductWithItems[]
  }

  const products = (data ?? []) as unknown as ProductWithItems[]

  return products.map((product) => ({
    ...product,
    product_items: [...(product.product_items ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }))
}

export async function getProduct(id: string) {
  await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_items(*)")
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  const product = data as unknown as ProductWithItems

  return {
    ...product,
    product_items: [...(product.product_items ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }
}

export async function createProduct(
  input: ProductInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 오류" }
  }

  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const payload = parsed.data

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: payload.name,
      subtitle: payload.subtitle || null,
      description: payload.description || null,
      is_active: payload.is_active,
      sort_order: payload.sort_order,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select()
    .single()

  if (error || !product) {
    return { ok: false, error: error?.message ?? "상품 생성 실패" }
  }

  if (payload.items.length > 0) {
    const { error: itemsError } = await supabase.from("product_items").insert(
      payload.items.map((item, index) => ({
        product_id: product.id,
        name: item.name,
        price_amount: item.price_amount,
        price_label: item.price_label,
        description: item.description || null,
        sort_order: item.sort_order || (index + 1) * 10,
      }))
    )

    if (itemsError) {
      return { ok: false, error: itemsError.message }
    }
  }

  revalidatePath("/products")
  return { ok: true, data: { id: product.id } }
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 오류" }
  }

  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const payload = parsed.data

  const { error } = await supabase
    .from("products")
    .update({
      name: payload.name,
      subtitle: payload.subtitle || null,
      description: payload.description || null,
      is_active: payload.is_active,
      sort_order: payload.sort_order,
      updated_by: profile.id,
    })
    .eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  const { error: deleteError } = await supabase
    .from("product_items")
    .delete()
    .eq("product_id", id)

  if (deleteError) {
    return { ok: false, error: deleteError.message }
  }

  if (payload.items.length > 0) {
    const { error: insertError } = await supabase.from("product_items").insert(
      payload.items.map((item, index) => ({
        product_id: id,
        name: item.name,
        price_amount: item.price_amount,
        price_label: item.price_label,
        description: item.description || null,
        sort_order: item.sort_order || (index + 1) * 10,
      }))
    )

    if (insertError) {
      return { ok: false, error: insertError.message }
    }
  }

  revalidatePath("/products")
  revalidatePath(`/products/${id}`)
  return { ok: true, data: { id } }
}

export async function toggleProductActive(formData: FormData) {
  await requireApprovedProfile()
  const id = String(formData.get("id") ?? "")
  const nextActive = String(formData.get("nextActive") ?? "") === "true"
  const supabase = await createSupabaseServerClient()

  if (id) {
    await supabase
      .from("products")
      .update({ is_active: nextActive })
      .eq("id", id)
  }

  revalidatePath("/products")
}

export async function deleteProduct(formData: FormData) {
  await requireApprovedProfile()
  const id = String(formData.get("id") ?? "")
  const supabase = await createSupabaseServerClient()

  if (id) {
    await supabase.from("products").update({ is_active: false }).eq("id", id)
  }

  revalidatePath("/products")
}
