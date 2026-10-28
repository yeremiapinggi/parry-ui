"use client"

import { useState } from "react"

import { OperationalDashboard } from "@/components/operational-dashboard"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const previewStates = {
  default: "Default demo snapshot",
  empty: "Empty data state",
  "no-results": "No matching results",
} as const

type PreviewState = keyof typeof previewStates

export function OperationalDashboardPreview() {
  const [state, setState] = useState<PreviewState>("default")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="operational-demo-state">Demo state</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">Explore default, empty-data, and no-match states. All records are fictional.</p>
        </div>
        <Select value={state} onValueChange={(value) => setState(value as PreviewState)}>
          <SelectTrigger id="operational-demo-state" aria-label="Operational dashboard demo state" className="w-full sm:w-52">
            <SelectValue>{previewStates[state]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="default">Default demo snapshot</SelectItem>
              <SelectItem value="empty">Empty data state</SelectItem>
              <SelectItem value="no-results">No matching results</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <OperationalDashboard previewState={state} />
    </div>
  )
}
