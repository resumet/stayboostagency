import { Badge } from "@/components/ui/badge"
import {
  approvalStatusLabels,
  purchasedProductStatusLabels,
  workStatusLabels,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import type {
  ApprovalStatus,
  PurchasedProductStatus,
  WorkStatus,
} from "@/types/database.types"

const workClassName: Record<WorkStatus, string> = {
  scheduled: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  in_progress: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  on_hold: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-200",
}

const approvalClassName: Record<ApprovalStatus, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-500/40 bg-red-500/10 text-red-200",
}

const purchasedClassName: Record<PurchasedProductStatus, string> = {
  active: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-200",
}

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", workClassName[status])}>
      {workStatusLabels[status]}
    </Badge>
  )
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", approvalClassName[status])}
    >
      {approvalStatusLabels[status]}
    </Badge>
  )
}

export function PurchasedProductStatusBadge({
  status,
}: {
  status: PurchasedProductStatus
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", purchasedClassName[status])}
    >
      {purchasedProductStatusLabels[status]}
    </Badge>
  )
}
