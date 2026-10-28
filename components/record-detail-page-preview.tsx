"use client"

import { useState } from "react"

import { RecordDetailPage, type RecordDetailPreviewState } from "@/components/record-detail-page"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const previewStates: Record<RecordDetailPreviewState, string> = {
  default: "Default contact record",
  loading: "Loading state",
  "not-found": "Record not found",
  empty: "Empty directory",
}

export function RecordDetailPagePreview() {
  const [state, setState] = useState<RecordDetailPreviewState>("default")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Label htmlFor="record-detail-demo-state">Demo state</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">Switch between record lifecycle and fallback states. All data is fictional.</p>
        </div>
        <Select value={state} onValueChange={(value) => setState(value as RecordDetailPreviewState)}>
          <SelectTrigger id="record-detail-demo-state" aria-label="Record detail demo state" className="w-full sm:w-56">
            <SelectValue>{previewStates[state]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="default">Default contact record</SelectItem>
              <SelectItem value="loading">Loading state</SelectItem>
              <SelectItem value="not-found">Record not found</SelectItem>
              <SelectItem value="empty">Empty directory</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <RecordDetailPage previewState={state} onPreviewStateChange={setState} />
    </div>
  )
}
