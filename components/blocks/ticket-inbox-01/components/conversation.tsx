"use client"

import { useEffect, useRef } from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "cn"

import { team } from "@/components/blocks/_data/team"
import type { Ticket } from "@/components/blocks/_data/tickets"
import { MessageBubble } from "@/components/blocks/_parts/message-bubble"
import { channelMeta } from "@/components/blocks/channel-meta"
import { Composer } from "@/components/blocks/ticket-inbox-01/components/composer"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Conversation({
  ticket: t,
  currentAgent,
  leading,
  trailing,
  className,
}: {
  ticket: Ticket
  currentAgent: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  className?: string
}) {
  const end = useRef<HTMLLIElement>(null)
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [t.id])
  const lockedBy = t.lockedBy && t.lockedBy !== currentAgent ? t.lockedBy : undefined

  return (
    <section aria-label={`Conversation with ${t.customer}`} className={cn("flex min-h-0 min-w-0 flex-col bg-background", className)}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-card px-4 py-2.5 text-card-foreground">
        {leading}
        <Avatar>
          <AvatarFallback>{t.initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate font-heading text-base font-semibold">{t.customer}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {channelMeta[t.channel].typeLabel} · {t.account} · opened {t.openedAt}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={Boolean(lockedBy)}>
                Assign
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Assign to me</DropdownMenuItem>
              <DropdownMenuItem>Release</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Agents</DropdownMenuLabel>
              {team.map((a) => (
                <DropdownMenuItem key={a.id}>{a.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" disabled={Boolean(lockedBy)}>
            Pending
          </Button>
          <Button size="sm" disabled={Boolean(lockedBy)}>
            Close ticket
          </Button>
          {trailing}
        </div>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <ol aria-label="Messages" className="flex flex-col gap-3 px-4 py-4">
          {t.thread.map((item, i) => (
            <MessageBubble key={i} item={item} />
          ))}
          <li ref={end} aria-hidden="true" />
        </ol>
      </ScrollArea>

      <div className="p-3 pt-0">
        <Composer key={t.id} lockedBy={lockedBy} />
      </div>
    </section>
  )
}
