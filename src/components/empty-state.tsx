import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="rounded-full border bg-muted p-3 text-muted-foreground">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
