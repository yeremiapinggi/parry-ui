"use client"

import { useState } from "react"

import { PipelinePerformanceWorkspace, type PipelineDemoState } from "@/components/pipeline-performance-workspace"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const demoStateLabels: Record<PipelineDemoState, string> = {
  default: "Live fictional data",
  loading: "Loading state",
  unavailable: "Data unavailable",
  empty: "Empty pipeline",
}

export function PipelinePerformancePreview() {
  const [state, setState] = useState<PipelineDemoState>("default")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="pipeline-demo-state">Preview state</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">Switch between the fictional dataset, loading, unavailable, and empty-pipeline states.</p>
        </div>
        <Select value={state} onValueChange={(value) => setState(value as PipelineDemoState)}>
          <SelectTrigger id="pipeline-demo-state" aria-label="Pipeline preview state" className="w-full sm:w-52"><SelectValue>{demoStateLabels[state]}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="default">Live fictional data</SelectItem>
            <SelectItem value="loading">Loading state</SelectItem>
            <SelectItem value="unavailable">Data unavailable</SelectItem>
            <SelectItem value="empty">Empty pipeline</SelectItem>
          </SelectGroup></SelectContent>
        </Select>
      </div>
      <PipelinePerformanceWorkspace demoState={state} onRetry={() => setState("default")} />
    </div>
  )
}
