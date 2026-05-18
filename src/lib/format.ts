import { format } from "date-fns"

export function formatDate(date: string | null | undefined) {
  if (!date) {
    return "-"
  }

  return format(new Date(date), "yyyy.MM.dd")
}

export function formatDateTime(date: string | null | undefined) {
  if (!date) {
    return "-"
  }

  return format(new Date(date), "yyyy.MM.dd HH:mm")
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-"
  }

  return new Intl.NumberFormat("ko-KR").format(value)
}

export function emptyToNull(value: unknown) {
  if (typeof value !== "string") {
    return value
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}
