"use client"

import { useState } from "react"

import { TabbedDetailWorkspace, type TabbedDetailWorkspaceDemoState } from "@/components/tabbed-detail-workspace"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const previewStates: { value: TabbedDetailWorkspaceDemoState; label: string }[] = [
  { value: "default", label: "Default / Active" },
  { value: "archived", label: "Archived" },
  { value: "validation-error", label: "Validation error" },
  { value: "empty-activity", label: "Empty activity" },
  { value: "loading", label: "Loading" },
  { value: "not-found", label: "Not found" },
]

export function TabbedDetailWorkspacePreview() {
  const [demoState, setDemoState] = useState<TabbedDetailWorkspaceDemoState>("default")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 sm:px-4">
        <p className="text-sm text-muted-foreground">Choose a starting state to explore the workspace.</p>
        <div className="flex items-center gap-2">
          <Label htmlFor="workspace-preview-state" className="sr-only">Preview state</Label>
          <Select value={demoState} onValueChange={(value) => setDemoState(value as TabbedDetailWorkspaceDemoState)}>
            <SelectTrigger id="workspace-preview-state" className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent data-parry-theme><SelectGroup>{previewStates.map((state) => <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </div>
      </div>
      <TabbedDetailWorkspace key={demoState} demoState={demoState} />
    </div>
  )
}
