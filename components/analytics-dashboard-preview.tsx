"use client"

import { useState } from "react"

import { ApplicationShellDemo } from "@/components/application-shell-demo"
import { AnalyticsDashboard, type AnalyticsDemoState } from "@/components/analytics-dashboard"
import { TemplateShellPreview } from "@/components/template-shell-preview"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const demoStateLabels: Record<AnalyticsDemoState, string> = {
  default: "Live demo data",
  loading: "Loading skeletons",
  empty: "Empty data state",
}

export function AnalyticsDashboardPreview() {
  const [state, setState] = useState<AnalyticsDemoState>("default")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="analytics-demo-state">Demo state</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">Explore the dashboard&apos;s layout-preserving loading and empty states.</p>
        </div>
        <Select value={state} onValueChange={(value) => setState(value as AnalyticsDemoState)}>
          <SelectTrigger id="analytics-demo-state" aria-label="Demo state" className="w-full sm:w-48">
            <SelectValue>{demoStateLabels[state]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="default">Live demo data</SelectItem>
              <SelectItem value="loading">Loading skeletons</SelectItem>
              <SelectItem value="empty">Empty data state</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <TemplateShellPreview
        standalone={<AnalyticsDashboard state={state} />}
        withAppShell={<ApplicationShellDemo dashboardTemplate="analytics" analyticsState={state} />}
      />
    </div>
  )
}
