"use client"

import { useState } from "react"
import { ArrowLeftIcon, MenuIcon, PanelRightIcon } from "lucide-react"

import { cn } from "cn"

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

// ≥1280 four panes · ≥1024 details in a Sheet · ≥768 icon rail · below that, list and conversation stack.
export function Inbox() {
  const [queue, setQueue] = useState<QueueKey>("view:progress")
  const [selectedId, setSelectedId] = useState(380)
  const [mobilePane, setMobilePane] = useState<"list" | "conversation">("list")
  const [queuesOpen, setQueuesOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const shown = inQueue(queue)
  const ticket = tickets.find((t) => t.id === selectedId)!

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <AppHeader active="ticket" />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[56px_320px_minmax(0,1fr)] lg:grid-cols-[232px_360px_minmax(0,1fr)] xl:grid-cols-[232px_360px_minmax(0,1fr)_280px]">
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
          onSelect={(id) => {
            setSelectedId(id)
            setMobilePane("conversation")
          }}
          className={cn(mobilePane === "conversation" && "max-md:hidden")}
        />
        <Conversation
          ticket={ticket}
          currentAgent={currentAgent.name}
          className={cn(mobilePane === "list" && "max-md:hidden")}
          leading={
            <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Back to tickets" onClick={() => setMobilePane("list")}>
              <ArrowLeftIcon />
            </Button>
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
