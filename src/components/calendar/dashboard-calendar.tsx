"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"

import { Card, CardContent } from "@/components/ui/card"
import { workStatusColors } from "@/lib/constants"
import type { WorkItemRow } from "@/actions/work-actions"

export function DashboardCalendar({ items }: { items: WorkItemRow[] }) {
  const router = useRouter()
  const events = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: `[${item.hotels?.name ?? "호텔"}] ${item.title}`,
        start: item.start_date,
        end: item.end_date,
        backgroundColor: workStatusColors[item.status],
        borderColor: workStatusColors[item.status],
        extendedProps: {
          status: item.status,
          notes: item.notes,
        },
      })),
    [items]
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          locale="ko"
          events={events}
          eventClick={(info) => router.push(`/work/${info.event.id}`)}
          headerToolbar={{
            start: "title",
            center: "",
            end: "prev,next today",
          }}
          buttonText={{
            today: "오늘",
          }}
          dayMaxEvents={3}
        />
      </CardContent>
    </Card>
  )
}
