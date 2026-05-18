import { z } from "zod"

export const workStatusSchema = z.enum([
  "scheduled",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
])

const nullableUuid = z.preprocess(
  (value) => (value === "" || value === "none" ? null : value),
  z.string().uuid().nullable()
)

export const workItemSchema = z
  .object({
    hotel_id: z.string().uuid("호텔을 선택하세요."),
    purchased_product_id: nullableUuid.optional(),
    product_item_id: nullableUuid.optional(),
    title: z.string().trim().min(1, "업무명을 입력하세요."),
    description: z.string().trim().nullable().optional(),
    status: workStatusSchema.default("scheduled"),
    start_date: z.string().min(1, "시작일을 입력하세요."),
    end_date: z.string().min(1, "종료일을 입력하세요."),
    notes: z.string().trim().nullable().optional(),
    sort_order: z.coerce.number().int().min(0).default(0),
  })
  .refine((value) => value.end_date >= value.start_date, {
    path: ["end_date"],
    message: "종료일은 시작일보다 빠를 수 없습니다.",
  })

export const purchasedProductSchema = z
  .object({
    hotel_id: z.string().uuid("호텔을 선택하세요."),
    product_id: z.string().uuid("상품을 선택하세요."),
    purchased_at: z.string().nullable().optional(),
    price_amount: z.coerce.number().int().min(0).nullable().optional(),
    price_label: z.string().trim().nullable().optional(),
    notes: z.string().trim().nullable().optional(),
    auto_create_work_items: z.boolean().default(false),
    default_start_date: z.string().nullable().optional(),
    default_end_date: z.string().nullable().optional(),
  })
  .refine(
    (value) =>
      !value.auto_create_work_items ||
      Boolean(value.default_start_date && value.default_end_date),
    {
      path: ["default_start_date"],
      message: "업무 자동 생성 시 기본 시작일과 종료일이 필요합니다.",
    }
  )
  .refine(
    (value) =>
      !value.auto_create_work_items ||
      !value.default_start_date ||
      !value.default_end_date ||
      value.default_end_date >= value.default_start_date,
    {
      path: ["default_end_date"],
      message: "기본 종료일은 시작일보다 빠를 수 없습니다.",
    }
  )

export type WorkItemInput = z.infer<typeof workItemSchema>
export type WorkItemFormInput = z.input<typeof workItemSchema>
export type PurchasedProductInput = z.infer<typeof purchasedProductSchema>
export type PurchasedProductFormInput = z.input<typeof purchasedProductSchema>
