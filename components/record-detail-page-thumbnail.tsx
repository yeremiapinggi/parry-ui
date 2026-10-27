import { ArrowUpRightIcon, Building2Icon, MoreHorizontalIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecordDetailPageThumbnail() {
  return (
    <div aria-label="Record detail page preview" className="flex h-full flex-col gap-3 bg-background p-4 text-foreground sm:p-5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span>Contacts</span><span aria-hidden="true">/</span><span className="text-foreground">Alya Pratama</span></div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1"><span className="text-[10px] text-muted-foreground">Contact record</span><span className="text-sm font-semibold">Contact Details</span></div>
        <div className="flex items-center gap-1.5"><span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">Edit Record</span><span className="flex size-7 items-center justify-center rounded-md border text-muted-foreground"><MoreHorizontalIcon className="size-4" /></span></div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-3 p-3">
          <div className="flex min-w-0 items-center gap-2.5"><Avatar className="size-9"><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">AP</AvatarFallback></Avatar><div className="flex min-w-0 flex-col gap-0.5"><span className="truncate text-xs font-semibold">Alya Pratama</span><span className="truncate text-[10px] text-muted-foreground">alya.pratama@example.com</span></div></div>
          <div className="flex gap-1"><Badge variant="outline" className="h-5 px-1.5 text-[9px]">Active</Badge><Badge variant="secondary" className="h-5 px-1.5 text-[9px]">Customer</Badge></div>
        </div>
        <div className="grid grid-cols-2 border-t p-3">
          <div className="flex flex-col gap-2.5"><span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Contact Information</span><span className="flex items-center gap-1.5 text-[10px]"><Building2Icon className="size-3 text-muted-foreground" />Northstar Labs</span><span className="text-[10px] text-muted-foreground">Owner · Mei Tan</span><span className="h-1.5 w-4/5 rounded-full bg-muted" /></div>
          <div className="flex flex-col gap-2.5 border-l pl-3"><span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Related Records</span><span className="truncate text-[10px] font-medium">Northstar annual renewal</span><span className="text-[10px] text-muted-foreground">Opportunity · In progress</span><span className="flex items-center gap-1 text-[10px] text-link">View details <ArrowUpRightIcon className="size-3" /></span></div>
        </div>
      </div>
    </div>
  )
}
