import type {
  ApprovalStatus,
  PurchasedProductStatus,
  WorkStatus,
} from "@/types/database.types"

export const appName = "StayBoost Admin"

export const workStatusLabels: Record<WorkStatus, string> = {
  scheduled: "예정",
  in_progress: "진행중",
  on_hold: "보류",
  completed: "완료",
  cancelled: "취소",
}

export const workStatusDescriptions: Record<WorkStatus, string> = {
  scheduled: "아직 시작 전",
  in_progress: "현재 진행 중",
  on_hold: "일시 중단",
  completed: "완료됨",
  cancelled: "취소됨",
}

export const workStatusColors: Record<WorkStatus, string> = {
  scheduled: "#64748b",
  in_progress: "#2563eb",
  on_hold: "#d97706",
  completed: "#16a34a",
  cancelled: "#dc2626",
}

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: "대기중",
  approved: "승인됨",
  rejected: "거절됨",
}

export const purchasedProductStatusLabels: Record<
  PurchasedProductStatus,
  string
> = {
  active: "진행중",
  completed: "완료",
  cancelled: "취소",
}

export const businessLicenseBucket = "business-licenses"
export const allowedBusinessLicenseExtensions = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
]
export const maxBusinessLicenseBytes = 10 * 1024 * 1024
