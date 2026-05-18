import { z } from "zod"

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null
  }
  return Number(value)
}, z.number().int().min(0).nullable())

export const productItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "항목명을 입력하세요."),
  price_amount: optionalNumber,
  price_label: z.string().trim().min(1, "표시 금액을 입력하세요."),
  description: z.string().trim().nullable().optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
})

export const productSchema = z.object({
  name: z.string().trim().min(1, "상품명을 입력하세요."),
  subtitle: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
  items: z.array(productItemSchema).default([]),
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductFormInput = z.input<typeof productSchema>
export type ProductItemInput = z.infer<typeof productItemSchema>
