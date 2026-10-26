"use client"

import type { CSSProperties, ReactNode } from "react"
import { Building2Icon, CalendarDaysIcon, CircleDotIcon, Clock3Icon, MailIcon, UserRoundIcon, XIcon } from "lucide-react"

import type { EnterpriseRecord } from "@/lib/advanced-filterable-table-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00.000Z`))
}

function statusTone(status: EnterpriseRecord["status"]) {
  if (status === "Resolved") return "border-success/30 bg-success-soft text-success"
  if (status === "In review") return "border-info/30 bg-info-soft text-info"
  if (status === "On hold") return "border-warning/30 bg-warning-soft text-warning"
  return "border-border bg-secondary text-secondary-foreground"
}

function priorityTone(priority: EnterpriseRecord["priority"]) {
  if (priority === "Urgent") return "border-destructive/30 bg-destructive-soft text-destructive"
  if (priority === "High") return "border-warning/30 bg-warning-soft text-warning"
  if (priority === "Low") return "border-border bg-secondary text-secondary-foreground"
  return "border-info/30 bg-info-soft text-info"
}

function DetailItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span aria-hidden="true" className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="break-words text-sm leading-relaxed">{children}</span>
      </div>
    </div>
  )
}

export function RecordDetailPanel({ record, onClose, className = "", style }: { record: EnterpriseRecord; onClose: () => void; className?: string; style?: CSSProperties }) {
  return (
    <aside aria-label={`Details for ${record.name}`} className={`font-data flex min-h-0 flex-col bg-card ${className}`} style={style}>
      <header className="flex items-start justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-mono text-xs text-muted-foreground">{record.id}</p>
          <h3 className="truncate font-data text-base font-semibold">{record.name}</h3>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close record details" onClick={onClose}><XIcon /></Button>
      </header>
      <Separator />
      <div className="flex flex-col gap-5 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={statusTone(record.status)}>{record.status}</Badge>
          <Badge variant="outline" className={priorityTone(record.priority)}>{record.priority}</Badge>
        </div>
        <DetailItem icon={<Building2Icon className="size-4" />} label="Company">{record.company}</DetailItem>
        <DetailItem icon={<MailIcon className="size-4" />} label="Channel">{record.channel}</DetailItem>
        <DetailItem icon={<UserRoundIcon className="size-4" />} label="Owner">{record.owner}</DetailItem>
        <DetailItem icon={<CircleDotIcon className="size-4" />} label="Status">{record.status}</DetailItem>
        <Separator />
        <DetailItem icon={<CalendarDaysIcon className="size-4" />} label="Created">{formatDate(record.createdAt)}</DetailItem>
        <DetailItem icon={<Clock3Icon className="size-4" />} label="Last updated">{formatDate(record.updatedAt)}</DetailItem>
      </div>
      <div className="mt-auto border-t px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">Fictional records for template exploration. No real customer data is shown.</p>
      </div>
    </aside>
  )
}
