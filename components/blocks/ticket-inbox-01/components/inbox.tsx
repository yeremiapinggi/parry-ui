"use client"

import { useState } from "react"

import { channels } from "@/components/blocks/_data/channels"
import { tickets, views } from "@/components/blocks/_data/tickets"
import { currentAgent } from "@/components/blocks/_data/team"
import { AppHeader } from "@/components/blocks/_parts/app-header"
import { QueueRail, type QueueKey } from "@/components/blocks/_parts/queue-rail"
import { channelMeta } from "@/components/blocks/channel-meta"
import { Conversation } from "@/components/blocks/ticket-inbox-01/components/conversation"
import { TicketList } from "@/components/blocks/ticket-inbox-01/components/ticket-list"

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

export function Inbox() {
  const [queue, setQueue] = useState<QueueKey>("view:progress")
  const [selectedId, setSelectedId] = useState(380)
  const shown = inQueue(queue)
  const ticket = tickets.find((t) => t.id === selectedId)!

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <AppHeader active="ticket" />
      <div className="grid min-h-0 flex-1 grid-cols-[232px_360px_minmax(0,1fr)_280px]">
        <QueueRail selected={queue} onSelect={setQueue} counts={counts} />
        <TicketList title={queueTitle(queue)} tickets={shown} selectedId={selectedId} onSelect={setSelectedId} />
        <Conversation ticket={ticket} currentAgent={currentAgent.name} />
        <aside aria-label="Ticket details" className="border-l bg-card" />
      </div>
    </div>
  )
}
