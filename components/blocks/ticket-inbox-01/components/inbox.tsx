"use client"

import { useState } from "react"
import { ArrowLeftIcon, MenuIcon, PanelRightIcon } from "lucide-react"

import { channels } from "@/components/blocks/_data/channels"
import { currentAgent } from "@/components/blocks/_data/team"
import { tickets, views } from "@/components/blocks/_data/tickets"
import { AppHeader } from "@/components/blocks/_parts/app-header"
import { QueueRail, type QueueKey } from "@/components/blocks/_parts/queue-rail"
import { channelMeta } from "@/components/blocks/channel-meta"
import { ContextPanel } from "@/components/blocks/ticket-inbox-01/components/context-panel"
import { Conversation } from "@/components/blocks/ticket-inbox-01/components/conversation"
import { TicketList } from "@/components/blocks/ticket-inbox-01/components/ticket-list"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
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

// The page is rail + list; a ticket opens as a full-screen dialog (conversation, plus details from 1280 or in a Sheet).
// Rail: full from 1024, icons from 768, in a Sheet below that.
export function Inbox() {
  const [queue, setQueue] = useState<QueueKey>("view:progress")
  const [selectedId, setSelectedId] = useState<number>()
  const [openId, setOpenId] = useState<number | null>(null)
  const [queuesOpen, setQueuesOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const shown = inQueue(queue)
  const ticket = tickets.find((t) => t.id === openId)

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <AppHeader active="ticket" />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[232px_minmax(0,1fr)]">
        <QueueRail selected={queue} onSelect={setQueue} counts={counts} className="max-md:hidden" />
        <TicketList
          title={queueTitle(queue)}
          leading={
            <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open queues" onClick={() => setQueuesOpen(true)}>
              <MenuIcon />
            </Button>
          }
          tickets={shown}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpen={setOpenId}
          className="border-r-0"
        />
      </div>

      <Dialog open={ticket !== undefined} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          // Opened from state, not a DialogTrigger, so hand focus back to the ticket row ourselves.
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            document.querySelector<HTMLElement>('[data-ticket-row][aria-current="true"]')?.focus()
          }}
          className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none bg-background p-0 ring-0 sm:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100"
        >
          {ticket && (
            <>
              <DialogTitle className="sr-only">
                Ticket #{ticket.id} · {ticket.customer}
              </DialogTitle>
              <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
                <Conversation
                  ticket={ticket}
                  currentAgent={currentAgent.name}
                  leading={
                    <DialogClose asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Back to tickets">
                        <ArrowLeftIcon />
                      </Button>
                    </DialogClose>
                  }
                  trailing={
                    <Button variant="outline" size="icon-sm" className="xl:hidden" aria-label="Show ticket details" onClick={() => setDetailsOpen(true)}>
                      <PanelRightIcon />
                    </Button>
                  }
                />
                <aside aria-label="Ticket details" className="hidden min-h-0 flex-col border-l xl:flex">
                  <ContextPanel key={ticket.id} ticket={ticket} className="min-h-0 flex-1" />
                </aside>
              </div>
              <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
                <SheetContent side="right" className="w-80 gap-0 p-0">
                  <SheetHeader className="border-b">
                    <SheetTitle>Ticket details</SheetTitle>
                  </SheetHeader>
                  <ContextPanel key={ticket.id} ticket={ticket} className="min-h-0 flex-1" />
                </SheetContent>
              </Sheet>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={queuesOpen} onOpenChange={setQueuesOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
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
            className="h-full border-r-0"
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
