import { z } from "zod"

const phoneRegex = /^[0-9\-\s()]+$/
const businessNumberRegex = /^[0-9-]+$/

export const hotelSchema = z.object({
  name: z.string().trim().min(1, "호텔명을 입력하세요."),
  owner_name: z.string().trim().min(1, "대표자 이름을 입력하세요."),
  business_number: z
    .string()
    .trim()
    .min(1, "사업자번호를 입력하세요.")
    .regex(businessNumberRegex, "사업자번호는 숫자와 하이픈만 입력하세요."),
  owner_phone: z
    .string()
    .trim()
    .min(1, "대표자 전화번호를 입력하세요.")
    .regex(phoneRegex, "전화번호 형식을 확인하세요."),
  address: z.string().trim().min(1, "호텔 주소를 입력하세요."),
  hotel_phone: z
    .string()
    .trim()
    .regex(phoneRegex, "전화번호 형식을 확인하세요.")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().optional(),
  photo_folder_url: z
    .string()
    .trim()
    .url("URL 형식을 확인하세요.")
    .optional()
    .or(z.literal("")),
})

export type HotelInput = z.infer<typeof hotelSchema>
export type HotelFormInput = z.input<typeof hotelSchema>
