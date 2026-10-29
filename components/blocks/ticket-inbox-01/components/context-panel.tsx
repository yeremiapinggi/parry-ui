import { cn } from "cn"

import { teamToday } from "@/components/blocks/_data/kpis"
import type { Ticket } from "@/components/blocks/_data/tickets"
import { KpiTile } from "@/components/blocks/_parts/kpi-tile"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const classification = [
  { id: "caller-case", label: "Caller case", options: ["Customer", "Dealer", "KTB"], value: "Customer" },
  { id: "warranty", label: "Warranty", options: ["Active", "Expired"], value: "Active" },
  { id: "category", label: "Category", options: ["Complaint", "Inquiry", "Request"], value: "Inquiry" },
  { id: "sub-1", label: "Sub category 1", options: ["After sales", "Sales"], value: "After sales" },
  { id: "sub-2", label: "Sub category 2", options: ["Service", "Spare part", "Warranty claim"], value: "Warranty claim" },
  { id: "sub-3", label: "Sub category 3", options: ["AC", "Engine", "Body"] },
]

const escalation = [
  { id: "group-escalation", label: "Group escalation", options: ["Dealer Support", "Billing", "Digital"] },
  { id: "email-group", label: "Email group", options: ["dealer-support@example.com", "billing@example.com"] },
]

function SelectField({ id, label, options, value }: { id: string; label: string; options: string[]; value?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Select defaultValue={value}>
        <SelectTrigger id={id} size="sm" className="w-full">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  )
}

// Keyed by ticket in the inbox, so the uncontrolled fields reset when the selection changes.
export function ContextPanel({ ticket: t, className }: { ticket: Ticket; className?: string }) {
  const facts = [
    ["Assignee", t.assignee],
    ["Group", t.group],
    ["Lock", t.lockedBy ? `Locked by ${t.lockedBy}` : "Unlocked"],
    ["Age", t.age],
  ]
  return (
    <ScrollArea className={cn("bg-card text-card-foreground [&_[data-slot=scroll-area-viewport]>div]:block!", className)}>
      <Section title="Team today">
        <div className="grid grid-cols-2 gap-2">
          {teamToday.map((k) => (
            <KpiTile key={k.label} {...k} />
          ))}
        </div>
      </Section>
      <Separator />
      <Section title={`Ticket #${t.id}`}>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
          {facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="truncate">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-1.5">
          <span id="sentiment-label" className="text-xs font-medium">
            Sentiment
          </span>
          <ToggleGroup type="single" variant="outline" size="sm" spacing={0} defaultValue={t.sentiment} aria-labelledby="sentiment-label" className="w-full">
            <ToggleGroupItem value="positive" className="flex-1">
              Positive
            </ToggleGroupItem>
            <ToggleGroupItem value="neutral" className="flex-1">
              Neutral
            </ToggleGroupItem>
            <ToggleGroupItem value="negative" className="flex-1">
              Negative
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Section>
      <Separator />
      <Section title="Classification">
        {classification.map((f) => (
          <SelectField key={f.id} {...f} />
        ))}
      </Section>
      <Separator />
      <Section title="Escalation">
        {escalation.map((f) => (
          <SelectField key={f.id} {...f} />
        ))}
      </Section>
    </ScrollArea>
  )
}
