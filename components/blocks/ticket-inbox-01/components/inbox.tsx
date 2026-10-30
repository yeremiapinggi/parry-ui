"use client"

import { useState } from "react"
import { PanelLeftOpenIcon } from "lucide-react"

import { cn } from "cn"

import { channels } from "@/components/blocks/_data/channels"
import { tickets, views } from "@/components/blocks/_data/tickets"
import { AppShell } from "@/components/blocks/_parts/app-shell"
import { QueueRail, type QueueKey } from "@/components/blocks/_parts/queue-rail"
import { channelMeta } from "@/components/blocks/channel-meta"
import { TicketDetail } from "@/components/blocks/ticket-inbox-01/components/ticket-detail"
import { TicketList } from "@/components/blocks/ticket-inbox-01/components/ticket-list"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const inQueue = (key: QueueKey) => {
  const [kind, id] = key.split(":")
  return tickets.filter((t) => (kind === "view" ? t.views.includes(id as never) : t.channel === id))
}

const counts = Object.fromEntries(
  [...views.map((v) => `view:${v.id}`), ...channels.map((c) => `channel:${c.id}`)].map((key) => [key, inQueue(key as QueueKey).length])
) as Record<QueueKey, number>

const queueTitle = (key: QueueKey) => {
  const [kind, id] = key.split(":")
  return kind === "view" ? views.find((v) => v.id === id)!.label : channelMeta[id as keyof typeof channelMeta].label
}

// The page is queue rail + ticket list inside the app shell; a ticket opens TicketDetail in a dialog that is full
// screen by default and can shrink to a large window. Below 1024 the queue rail moves into a Sheet.
export function Inbox() {
  const [queue, setQueue] = useState<QueueKey>("view:progress")
  const [selectedId, setSelectedId] = useState<number>()
  const [openId, setOpenId] = useState<number | null>(null)
  const [queuesOpen, setQueuesOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const shown = inQueue(queue)
  const ticket = tickets.find((t) => t.id === openId)

  return (
    <AppShell active="ticket" title="Tickets" hideHeader fill>
      {/* Both columns are capped at the window height: the rail scrolls on its own, the ticket card scrolls its rows. */}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ScrollArea className="min-h-0 overflow-hidden max-lg:hidden [&_[data-slot=scroll-area-viewport]>div]:block!">
          <QueueRail selected={queue} onSelect={setQueue} counts={counts} className="pr-3 pb-2" />
        </ScrollArea>
        <TicketList
          title={queueTitle(queue)}
          leading={
            <Button variant="outline" size="icon-sm" className="mr-1 lg:hidden" aria-label="Open queues" onClick={() => setQueuesOpen(true)}>
              <PanelLeftOpenIcon />
            </Button>
          }
          tickets={shown}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpen={setOpenId}
        />
      </div>

      <Dialog open={ticket !== undefined} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          // Focus the dialog, not its first button, so no tooltip pops on open; Tab then walks the header.
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).focus()
          }}
          // Esc in an inline edit cancels that edit only.
          onEscapeKeyDown={(e) => {
            if ((e.target as HTMLElement | null)?.closest("[data-inline-edit]")) e.preventDefault()
          }}
          // Opened from state, not a DialogTrigger, so hand focus back to the ticket row ourselves.
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            document.querySelector<HTMLElement>('[data-ticket-row][aria-current="true"]')?.focus()
          }}
          className={cn(
            "flex max-w-none gap-0 overflow-hidden bg-background p-0 sm:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100",
            expanded
              ? "top-0 left-0 h-dvh w-screen translate-x-0 translate-y-0 rounded-none ring-0"
              : "top-[4dvh] h-[92dvh] w-[min(1280px,94vw)] translate-y-0 rounded-2xl"
          )}
        >
          {ticket && <TicketDetail key={ticket.id} ticket={ticket} expanded={expanded} onToggleExpanded={() => setExpanded((e) => !e)} />}
        </DialogContent>
      </Dialog>

      <Sheet open={queuesOpen} onOpenChange={setQueuesOpen}>
        <SheetContent side="left" className="w-72 gap-0 overflow-y-auto p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Ticket queues</SheetTitle>
          </SheetHeader>
          <QueueRail
            selected={queue}
            onSelect={(key) => {
              setQueue(key)
              setQueuesOpen(false)
            }}
            counts={counts}
          />
        </SheetContent>
      </Sheet>
    </AppShell>
  )
}
