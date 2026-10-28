"use client"

import { useState } from "react"

import { ApplicationShell, type ApplicationShellLayout } from "@/components/application-shell"
import { applicationShellNavigation } from "@/components/application-shell-navigation"
import { AnalyticsDashboard, type AnalyticsDemoState } from "@/components/analytics-dashboard"
import { DataManagementListPreview } from "@/components/data-management-list-preview"
import { OperationalDashboard } from "@/components/operational-dashboard"
import { SettingsPanelsPreview } from "@/components/settings-panels-preview"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const layouts: { value: ApplicationShellLayout; label: string }[] = [
  { value: "sidebar", label: "Sidebar" },
  { value: "top", label: "Top navigation" },
  { value: "hybrid", label: "Hybrid" },
]

type ApplicationShellDemoProps = {
  initialPageId?: string
  analyticsState?: AnalyticsDemoState
  operationalState?: "default" | "empty" | "no-results"
  dashboardTemplate?: "analytics" | "operational"
}

export function ApplicationShellDemo({
  initialPageId = "dashboard",
  analyticsState = "default",
  operationalState = "default",
  dashboardTemplate = "analytics",
}: ApplicationShellDemoProps) {
  const [layout, setLayout] = useState<ApplicationShellLayout>("sidebar")
  const [activePageId, setActivePageId] = useState(initialPageId)
  const activeModule = applicationShellNavigation[0].items.find((item) => item.id === activePageId || item.children?.some((child) => child.id === activePageId))?.id ?? "dashboard"

  const content = activeModule === "data-management" ? (
    <DataManagementListPreview showControls />
  ) : activeModule === "settings" ? (
    <SettingsPanelsPreview />
  ) : activeModule === "analytics" ? (
    <AnalyticsDashboard state={analyticsState} />
  ) : dashboardTemplate === "operational" ? (
    <OperationalDashboard previewState={operationalState} />
  ) : (
    <AnalyticsDashboard state={analyticsState} />
  )

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Label className="font-data text-sm font-medium">Layout variant</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">Switch the navigation frame without leaving the current page.</p>
        </div>
        <ToggleGroup
          type="single"
          value={layout}
          onValueChange={(value) => { if (value) setLayout(value as ApplicationShellLayout) }}
          variant="outline"
          size="sm"
          aria-label="Application shell layout"
          className="max-w-full flex-wrap"
        >
          {layouts.map((item) => <ToggleGroupItem key={item.value} value={item.value}>{item.label}</ToggleGroupItem>)}
        </ToggleGroup>
      </div>
      <ApplicationShell variant={layout} activeItemId={activePageId} onNavigate={setActivePageId}>
        {content}
      </ApplicationShell>
    </div>
  )
}

export function ApplicationShellThumbnail() {
  return (
    <div aria-hidden="true" className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      <div className="flex w-[28%] min-w-20 flex-col border-r bg-card p-2.5">
        <div className="mb-3 flex items-center gap-2 border-b pb-2"><span className="grid size-5 place-items-center rounded bg-primary text-primary-foreground">N</span><span className="truncate text-[9px] font-semibold">Northstar</span></div>
        <span className="mb-1 text-[7px] font-semibold tracking-widest text-muted-foreground">WORKSPACE</span>
        {["Dashboard", "Data Management", "Analytics", "Settings"].map((item, index) => <span key={item} className={`mb-1 flex items-center gap-1.5 rounded px-1.5 py-1 text-[8px] ${index === 0 ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}><span className="size-1.5 rounded-full bg-current" />{item}</span>)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-3 py-2 text-[8px]"><span className="text-muted-foreground">Northstar / Dashboard / Overview</span><span className="size-4 rounded-full bg-muted" /></div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3">
          <div className="flex items-center justify-between"><span className="text-[10px] font-semibold">Analytics Overview</span><span className="rounded border px-1.5 py-0.5 text-[7px] text-muted-foreground">Last 30 days</span></div>
          <div className="grid grid-cols-4 gap-1">{["2.4k", "684", "72%", "4.2s"].map((value) => <div key={value} className="rounded border bg-card p-1.5"><span className="block h-1 w-6 rounded bg-muted" /><span className="mt-1 block text-[8px] font-semibold">{value}</span></div>)}</div>
          <div className="flex min-h-0 flex-1 flex-col justify-between rounded border bg-card p-2"><span className="text-[8px] font-medium">Activity trend</span><div className="flex h-12 items-end gap-1">{[35, 55, 42, 76, 61, 88, 69, 96, 74, 84, 62, 91].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${height}%` }} />)}</div></div>
        </div>
      </div>
    </div>
  )
}
