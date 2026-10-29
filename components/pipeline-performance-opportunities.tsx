"use client"

import { useState } from "react"
import { Building2Icon, CalendarDaysIcon, UserRoundIcon, type LucideIcon } from "lucide-react"

import { PIPELINE_DEFINITIONS, type OpportunitySnapshot } from "@/lib/pipeline-performance-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const exactCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

export type OpportunityListMode = "open" | "won" | "lost" | "closed" | "new" | "stalled"

const modeLabels: Record<OpportunityListMode, string> = {
  open: "Open opportunities",
  won: "Won opportunities",
  lost: "Lost opportunities",
  closed: "Closed opportunities",
  new: "New opportunity inflow",
  stalled: "Aging attention candidates",
}

export function OpportunityDrilldown({
  rows,
  mode,
  selectedStage,
  periodLabel,
  onClearStage,
}: {
  rows: OpportunitySnapshot[]
  mode: OpportunityListMode
  selectedStage: string | null
  periodLabel: string
  onClearStage: () => void
}) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunitySnapshot | null>(null)
  const listTitle = selectedStage ? `${selectedStage} opportunities` : modeLabels[mode]
  const listDescription = selectedStage === "Won" || selectedStage === "Lost" || mode === "won" || mode === "lost" || mode === "closed"
    ? `Opportunities closed in ${periodLabel}.`
    : selectedStage
      ? `Open opportunities currently in ${selectedStage}, as of the reporting period end date.`
      : mode === "stalled"
        ? "Open opportunities unchanged beyond the selected attention threshold, as of the period-end snapshot."
        : mode === "new"
          ? `Opportunities created during ${periodLabel}, shown at the period-end snapshot.`
          : "Open opportunities at the reporting period end date."

  return (
    <>
      <Card className="min-w-0 gap-0 py-0">
        <CardHeader className="gap-1 px-5 pt-5 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1"><CardTitle className="text-base">{listTitle}</CardTitle><CardDescription>{listDescription}</CardDescription></div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border bg-muted/30 px-2.5 py-1.5 text-xs font-medium tabular-nums">{rows.length} records</span>
              {selectedStage && <Button type="button" variant="ghost" size="sm" onClick={onClearStage}>Clear stage</Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {rows.length === 0 ? (
            <Empty className="min-h-48 rounded-none border-0 border-t">
              <EmptyHeader><EmptyTitle>No matching opportunities</EmptyTitle><EmptyDescription>Try another stage or change the filters above. The active filters and reporting window are preserved.</EmptyDescription></EmptyHeader>
              {selectedStage && <EmptyContent><Button type="button" size="sm" variant="outline" onClick={onClearStage}>Clear stage selection</Button></EmptyContent>}
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader><TableRow>
                  <TableHead>Opportunity</TableHead><TableHead>Company</TableHead><TableHead>Owner</TableHead><TableHead>Stage</TableHead><TableHead className="text-right">Deal value</TableHead><TableHead className="text-right">Win probability</TableHead><TableHead className="text-right">Days in stage</TableHead><TableHead>Expected close</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.opportunity.id}>
                      <TableCell><button type="button" onClick={() => setSelectedOpportunity(row)} className="max-w-48 truncate rounded-sm text-left font-medium text-link hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label={`Open ${row.opportunity.name} details`}>{row.opportunity.name}</button><span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{row.opportunity.id}</span></TableCell>
                      <TableCell>{row.opportunity.company}</TableCell>
                      <TableCell>{row.opportunity.owner}</TableCell>
                      <TableCell>{row.stage}</TableCell>
                      <TableCell className="text-right font-data tabular-nums">{exactCurrency.format(row.opportunity.value)}</TableCell>
                      <TableCell className="text-right font-data tabular-nums">{Math.round(row.winProbability * 100)}%</TableCell>
                      <TableCell className="text-right font-data tabular-nums">{row.daysInStage}</TableCell>
                      <TableCell>{dateFormatter.format(row.opportunity.expectedCloseAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={selectedOpportunity !== null} onOpenChange={(open) => { if (!open) setSelectedOpportunity(null) }}>
        <SheetContent data-parry-theme side="right" className="w-[min(100vw,34rem)] max-w-none gap-0 overflow-y-auto p-0 sm:max-w-[34rem]">
          {selectedOpportunity && <OpportunityDetails snapshot={selectedOpportunity} />}
        </SheetContent>
      </Sheet>
    </>
  )
}

function OpportunityDetails({ snapshot }: { snapshot: OpportunitySnapshot }) {
  const { opportunity } = snapshot
  const snapshotStageIndex = opportunity.history.findIndex((transition) => transition.stage === snapshot.stage)
  const visibleHistory = opportunity.history.slice(0, snapshotStageIndex + 1)
  const probability = Math.round(snapshot.winProbability * 100)
  const pipelineName = PIPELINE_DEFINITIONS.find((pipeline) => pipeline.id === opportunity.pipelineId)?.name ?? "Pipeline"

  return (
    <>
      <SheetHeader className="border-b p-5 pr-14">
        <SheetTitle className="text-lg leading-snug">{opportunity.name}</SheetTitle>
        <SheetDescription>{opportunity.id} · {opportunity.company}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <DetailMetric label="Deal value" value={exactCurrency.format(opportunity.value)} />
          <DetailMetric label="Win probability" value={`${probability}%`} />
          <DetailMetric label="Current stage" value={snapshot.stage} />
          <DetailMetric label="Days in stage" value={`${snapshot.daysInStage} days`} />
        </div>
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-sm font-semibold">Opportunity details</p>
          <DetailLine icon={UserRoundIcon} label="Owner" value={opportunity.owner} />
          <DetailLine icon={Building2Icon} label="Lead source" value={opportunity.leadSource} />
          <DetailLine icon={CalendarDaysIcon} label="Expected close" value={dateFormatter.format(opportunity.expectedCloseAt)} />
          <DetailLine icon={CalendarDaysIcon} label="Pipeline" value={pipelineName} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Stage history</h3><span className="text-xs text-muted-foreground">Through selected snapshot</span></div>
          <ol className="flex flex-col gap-0 border-l pl-4">
            {visibleHistory.map((transition, index) => (
              <li key={`${transition.stage}-${transition.changedAt.toISOString()}`} className="relative flex items-start justify-between gap-3 border-b py-3 last:border-0">
                <span aria-hidden="true" className={`absolute -left-[1.3rem] top-4 size-2 rounded-full border-2 border-background ${index === visibleHistory.length - 1 ? "bg-primary" : "bg-muted-foreground/60"}`} />
                <span className="min-w-0"><span className="block text-sm font-medium">{transition.stage}</span><span className="mt-0.5 block text-xs text-muted-foreground">{Math.round(transition.winProbability * 100)}% probability</span></span>
                <span className="shrink-0 text-xs text-muted-foreground">{dateFormatter.format(transition.changedAt)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground"><p>Fictional demo record. Current snapshot and active filters remain in place when this detail panel closes.</p></div>
      </div>
      <div className="mt-auto flex justify-end border-t p-4"><SheetClose asChild><Button type="button" variant="outline">Close details</Button></SheetClose></div>
    </>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-md border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate font-data text-sm font-semibold tabular-nums">{value}</p></div>
}

function DetailLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex items-start gap-2.5 text-sm"><Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span className="w-24 shrink-0 text-muted-foreground">{label}</span><span className="min-w-0 font-medium">{value}</span></div>
}
