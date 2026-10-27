"use client"

import { useState } from "react"

import { ConversationWorkspace, type ConversationWorkspaceDemoState } from "@/components/conversation-workspace"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const states: { value: ConversationWorkspaceDemoState; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "no-selection", label: "No conversation selected" },
  { value: "empty-thread", label: "Empty thread" },
  { value: "loading", label: "Loading" },
  { value: "send-failed", label: "Failed send" },
]

export function ConversationWorkspacePreview() {
  const [state, setState] = useState<ConversationWorkspaceDemoState>("default")
  return <div className="flex min-w-0 flex-col gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-primary" /><p className="text-sm font-medium">Interactive demo</p><span className="hidden text-sm text-muted-foreground sm:inline">Fictional records · simulated messaging only.</span></div>
      <div className="flex items-center gap-2"><Label htmlFor="conversation-workspace-demo-state" className="text-xs text-muted-foreground">Preview state</Label><Select value={state} onValueChange={(value) => setState(value as ConversationWorkspaceDemoState)}><SelectTrigger id="conversation-workspace-demo-state" aria-label="Choose workspace demo state" className="h-8 w-52"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup>{states.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
    </div>
    <ConversationWorkspace key={state} demoState={state} />
  </div>
}
