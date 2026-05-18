"use server"

import { endOfMonth, format, startOfMonth } from "date-fns"

import { requireApprovedProfile } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCalendarWorkItems } from "@/actions/work-actions"
import type { WorkItemRow } from "@/actions/work-actions"
import type { Hotel } from "@/types/database.types"

export async function getDashboardData() {
  const { profile } = await requireApprovedProfile()
  const supabase = await createSupabaseServerClient()
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")

  const [
    hotelCount,
    activeWorkCount,
    endingThisMonthCount,
    pendingRequestCount,
    recentHotels,
    recentWorkItems,
    calendarItems,
  ] = await Promise.all([
    supabase
      .from("hotels")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("work_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("work_items")
      .select("id", { count: "exact", head: true })
      .gte("end_date", monthStart)
      .lte("end_date", monthEnd)
      .neq("status", "cancelled"),
    profile.role === "admin"
      ? supabase
          .from("login_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
      : Promise.resolve({ count: null }),
    supabase
      .from("hotels")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("work_items")
      .select(
        "*, hotels(id, name), product_items(id, name), hotel_purchased_products(id, price_label, status, products(id, name))"
      )
      .order("updated_at", { ascending: false })
      .limit(5),
    getCalendarWorkItems(),
  ])

  return {
    profile,
    stats: {
      hotels: hotelCount.count ?? 0,
      activeWork: activeWorkCount.count ?? 0,
      endingThisMonth: endingThisMonthCount.count ?? 0,
      pendingRequests: pendingRequestCount.count ?? 0,
    },
    recentHotels: (recentHotels.data ?? []) as Hotel[],
    recentWorkItems: (recentWorkItems.data ?? []) as unknown as WorkItemRow[],
    calendarItems,
  }
}
