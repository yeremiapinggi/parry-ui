"use client"

import { useState } from "react"
import { FileTextIcon, LockIcon, PaperclipIcon, SendHorizontalIcon, SmileIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function Composer({ lockedBy }: { lockedBy?: string }) {
  const [draft, setDraft] = useState("")
  const [mode, setMode] = useState("reply")
  const locked = Boolean(lockedBy)

  return (
    <Card className="gap-0 py-0 shadow-none" aria-disabled={locked || undefined}>
      {locked && (
        <p className="flex items-center gap-2 border-b bg-muted px-3 py-2 text-sm text-muted-foreground">
          <LockIcon aria-hidden="true" className="size-4 shrink-0" />
          Locked by {lockedBy}. You can read this ticket but not reply.
        </p>
      )}
      <Textarea
        aria-label={mode === "note" ? "Internal note" : "Reply message"}
        placeholder={mode === "note" ? "Write an internal note, only agents can see it…" : "Type a reply…"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={locked}
        rows={3}
        className="min-h-20 resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <div className="flex flex-wrap items-center gap-1 border-t px-2 py-1.5">
        <Button variant="ghost" size="icon-sm" aria-label="Attach file" disabled={locked}>
          <PaperclipIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Insert emoji" disabled={locked}>
          <SmileIcon />
        </Button>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={mode}
          onValueChange={(v) => v && setMode(v)}
          disabled={locked}
          aria-label="Message type"
          className="ml-1"
        >
          <ToggleGroupItem value="reply">Reply</ToggleGroupItem>
          <ToggleGroupItem value="note">Note</ToggleGroupItem>
        </ToggleGroup>
        <Button variant="ghost" size="sm" disabled={locked}>
          <FileTextIcon />
          Template
        </Button>
        <Button size="sm" className="ml-auto" disabled={locked || !draft.trim()} onClick={() => setDraft("")}>
          <SendHorizontalIcon />
          {mode === "note" ? "Add note" : "Send"}
        </Button>
      </div>
    </Card>
  )
}
