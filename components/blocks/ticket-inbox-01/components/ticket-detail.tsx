"use client"

import { useEffect, useRef, useState } from "react"
import { LockIcon, RotateCcwIcon } from "lucide-react"

import { currentAgent } from "@/components/blocks/_data/team"
import type { Sentiment, ThreadItem, Ticket, TicketStatus } from "@/components/blocks/_data/tickets"
import { demoNowIso } from "@/components/blocks/_parts/time"
import { TicketComposer, type ComposerMode, type ComposerSend } from "@/components/blocks/ticket-inbox-01/components/ticket-composer"
import { TicketHeader } from "@/components/blocks/ticket-inbox-01/components/ticket-header"
import { sentimentMeta, shortcuts, statusMeta } from "@/components/blocks/ticket-inbox-01/components/ticket-meta"
import { TicketSidebar } from "@/components/blocks/ticket-inbox-01/components/ticket-sidebar"
import { TicketTimeline } from "@/components/blocks/ticket-inbox-01/components/ticket-timeline"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const me = currentAgent.id

/**
 * Ticket detail: header with metadata and inline actions, filterable timeline, composer, and a context sidebar
 * (a Sheet below 1280px). State is local to the open ticket; actions are logged into the thread as system events.
 * Shortcuts: Alt+1/2/3 composer mode, Alt+C close/reopen, Alt+A assign; Ctrl/⌘+Enter sends (in the composer).
 */
export function TicketDetail({ ticket, expanded, onToggleExpanded }: { ticket: Ticket; expanded: boolean; onToggleExpanded: () => void }) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [assignee, setAssignee] = useState<string | null>(ticket.assignee)
  const [sentiment, setSentiment] = useState<Sentiment>(ticket.sentiment)
  const [bookmarked, setBookmarked] = useState(ticket.views.includes("bookmark"))
  const [thread, setThread] = useState<ThreadItem[]>(ticket.thread)
  const [mode, setMode] = useState<ComposerMode>("reply")
  const [assignOpen, setAssignOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const textarea = useRef<HTMLTextAreaElement>(null)

  const closed = status === "closed"
  const lockedBy = ticket.lockedBy && ticket.lockedBy !== currentAgent.name ? ticket.lockedBy : undefined

  const log = (body: string) => setThread((t) => [...t, { kind: "system", body, at: demoNowIso() }])
  const changeStatus = (next: TicketStatus) => {
    if (next === status) return
    setStatus(next)
    log(next === "open" && closed ? `Ticket reopened by ${me}` : `Status changed to ${statusMeta[next].label} by ${me}`)
  }
  const assign = (agent: string | null) => {
    setAssignee(agent)
    log(agent ? `Assigned to ${agent} by ${me}` : `Assignment released by ${me}`)
  }
  const changeSentiment = (s: Sentiment) => {
    setSentiment(s)
    log(`Sentiment set to ${sentimentMeta[s].label} by ${me}`)
  }
  const focusComposer = (m: ComposerMode) => {
    setMode(m)
    setDetailsOpen(false)
    requestAnimationFrame(() => textarea.current?.focus())
  }

  const send = ({ mode, body, to, close }: ComposerSend) => {
    const at = demoNowIso()
    const item: ThreadItem =
      mode === "reply"
        ? { kind: "out", body, at, agent: me, delivery: "sent" }
        : mode === "note"
          ? { kind: "note", body, at, agent: me }
          : { kind: "escalation", body, at, agent: me, to: to! }
    setThread((t) => [...t, item])
    if (close) changeStatus("closed")
  }

  // Re-bound every render so the handler always sees the current status; binding a listener is cheap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return
      const modeKey: Record<string, ComposerMode> = { Digit1: "reply", Digit2: "escalate", Digit3: "note" }
      if (modeKey[e.code]) focusComposer(modeKey[e.code])
      else if (e.code === "KeyC") changeStatus(closed ? "open" : "closed")
      else if (e.code === "KeyA") setAssignOpen(true)
      else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const sidebar = (
    <TicketSidebar ticket={ticket} status={status} thread={thread} sentiment={sentiment} onSentimentChange={changeSentiment} onAddNote={() => focusComposer("note")} className="min-h-0 flex-1" />
  )

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <TicketHeader
        ticket={ticket}
        status={status}
        onStatusChange={changeStatus}
        assignee={assignee}
        onAssign={assign}
        assignOpen={assignOpen}
        onAssignOpenChange={setAssignOpen}
        sentiment={sentiment}
        onSentimentChange={changeSentiment}
        bookmarked={bookmarked}
        onBookmarkedChange={setBookmarked}
        expanded={expanded}
        onToggleExpanded={onToggleExpanded}
        onOpenDetails={() => setDetailsOpen(true)}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label={`Conversation with ${ticket.customer}`} className="flex min-h-0 min-w-0 flex-col bg-background">
          <TicketTimeline thread={thread} channel={ticket.channel} initials={ticket.initials} className="flex-1" />

          <div className="flex flex-col gap-2 p-3 md:px-6 md:pb-4">
            {closed && (
              <Alert className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <AlertTitle>This ticket is closed — Reopen to reply</AlertTitle>
                  <AlertDescription>Reopening moves it back to Open and logs the change.</AlertDescription>
                </div>
                <Button size="sm" onClick={() => changeStatus("open")}>
                  <RotateCcwIcon />
                  Reopen
                  <Kbd className="bg-primary-foreground/20 text-primary-foreground">{shortcuts.closeReopen}</Kbd>
                </Button>
              </Alert>
            )}
            {!closed && lockedBy && (
              <Alert>
                <LockIcon />
                <AlertTitle>Locked by {lockedBy}</AlertTitle>
                <AlertDescription>You can read this ticket but not reply until the lock is released.</AlertDescription>
              </Alert>
            )}
            <TicketComposer
              key={ticket.id}
              ticket={ticket}
              mode={mode}
              onModeChange={setMode}
              onSend={send}
              disabled={closed || Boolean(lockedBy)}
              textareaRef={textarea}
            />
          </div>
        </section>

        <aside aria-label="Ticket details" className="hidden min-h-0 flex-col border-l xl:flex">
          {sidebar}
        </aside>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-[22rem] gap-0 p-0 sm:max-w-[22rem]">
          <SheetHeader className="border-b">
            <SheetTitle>Ticket details</SheetTitle>
          </SheetHeader>
          {sidebar}
        </SheetContent>
      </Sheet>
    </div>
  )
}
