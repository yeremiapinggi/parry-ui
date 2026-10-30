"use client"

import { CircleCheckIcon, HistoryIcon, MailIcon, PhoneIcon, ShieldAlertIcon } from "lucide-react"

import { cn } from "cn"

import type { Contact, Ticket, TicketStatus } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { byTime, monthDay, relativeTime, shortDateTime } from "@/components/blocks/_parts/time"
import { channelMeta } from "@/components/blocks/channel-meta"
import { statusMeta } from "@/components/blocks/ticket-inbox-01/components/ticket-meta"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Timeline, TimelineItem } from "@/components/ui/timeline"

export type ContactRow = Contact & { name: string; initials: string; tickets: Ticket[] }

type Step = { key: string; at: string; icon: React.ReactNode; title: React.ReactNode; detail?: React.ReactNode }

const Status = ({ status }: { status: TicketStatus }) => (
  <span className="inline-flex items-center gap-1.5">
    <span aria-hidden="true" className={cn("size-1.5 rounded-full", statusMeta[status].dot)} />
    {statusMeta[status].label}
  </span>
)

const Id = ({ id }: { id: number }) => <span className="font-mono">#{id}</span>

/**
 * Customer journey, newest first: each current ticket (opened via channel, escalations, closing) plus earlier tickets
 * from `history`, deduped by id. Internal events (distribution, locks) are left out.
 */
function journeyOf(c: ContactRow) {
  const current = new Set(c.tickets.map((t) => t.id))
  const steps: Step[] = []
  for (const t of c.tickets) {
    steps.push({
      key: `open-${t.id}`,
      at: t.createdAt,
      icon: <ChannelIcon channel={t.channel} className="size-4 [&_svg]:size-2.5" />,
      title: (
        <>
          <Id id={t.id} /> via {channelMeta[t.channel].typeLabel}
        </>
      ),
      detail: (
        <span className="flex flex-col gap-0.5">
          <Status status={t.status} />
          <span className="line-clamp-2">{t.preview}</span>
        </span>
      ),
    })
    t.thread.forEach((i, n) => {
      if (i.kind === "escalation")
        steps.push({ key: `${t.id}-${n}`, at: i.at, icon: <ShieldAlertIcon />, title: `Escalated to ${i.to}`, detail: <>by {i.agent} · <Id id={t.id} /></> })
      else if (i.kind === "system" && i.body.startsWith("Ticket closed"))
        steps.push({ key: `${t.id}-${n}`, at: i.at, icon: <CircleCheckIcon />, title: i.body, detail: <Id id={t.id} /> })
    })
  }
  const earlier = new Map(c.tickets.flatMap((t) => t.history).filter((h) => !current.has(h.id)).map((h) => [h.id, h]))
  for (const h of earlier.values()) {
    steps.push({
      key: `history-${h.id}`,
      at: h.at,
      icon: <HistoryIcon />,
      title: (
        <>
          <Id id={h.id} /> {h.subject}
        </>
      ),
      detail: <Status status={h.status} />,
    })
  }
  return { steps: steps.sort((a, b) => byTime(b, a)), total: current.size + earlier.size, hasEarlier: earlier.size > 0 }
}

function InfoItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex min-h-7 items-center gap-2.5">
      <span className="grid size-4 shrink-0 place-items-center text-muted-foreground">{icon}</span>
      <span className="sr-only">{label}:</span>
      <span className="min-w-0 truncate">{children}</span>
    </li>
  )
}

const heading = "text-xs font-semibold tracking-wide text-muted-foreground uppercase"

// Read-only contact card; one dialog for the whole page, opened from the Name cell.
export function ContactDetail({
  contact: c,
  onOpenChange,
  onClosed,
}: {
  contact: ContactRow | null
  onOpenChange: (open: boolean) => void
  onClosed: () => void
}) {
  const journey = c && journeyOf(c)

  return (
    <Dialog open={c !== null} onOpenChange={onOpenChange}>
      {c && journey && (
        <DialogContent
          className="gap-5 sm:max-w-2xl"
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            onClosed()
          }}
        >
          <DialogHeader className="flex-row items-center gap-3">
            <Avatar size="lg" aria-hidden="true">
              <AvatarFallback>{c.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>{c.name}</DialogTitle>
              <DialogDescription>
                {journey.total} {journey.total === 1 ? "ticket" : "tickets"} · first contact {monthDay(journey.steps.at(-1)!.at)} · last contact{" "}
                {monthDay(journey.steps[0].at)}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <section aria-labelledby="contact-info-heading" className="flex flex-col gap-2">
              <h3 id="contact-info-heading" className={heading}>
                Contact information
              </h3>
              <ul className="flex flex-col">
                {c.identities
                  .filter((i) => i.handle !== c.email && i.handle !== c.phone)
                  .map((i) => (
                    <InfoItem key={i.channel + i.handle} icon={<ChannelIcon channel={i.channel} className="size-4 [&_svg]:size-2.5" />} label={channelMeta[i.channel].label}>
                      {i.handle}
                    </InfoItem>
                  ))}
                {c.email && (
                  <InfoItem icon={<MailIcon className="size-4" />} label="Email">
                    {c.email}
                  </InfoItem>
                )}
                {c.phone && (
                  <InfoItem icon={<PhoneIcon className="size-4" />} label="Phone">
                    <span className="tabular-nums">{c.phone}</span>
                  </InfoItem>
                )}
              </ul>
              {c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1" aria-label="Tags">
                  {c.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="journey-heading" className="flex min-h-0 flex-col gap-3">
              <h3 id="journey-heading" className={heading}>
                Customer journey
              </h3>
              <ScrollArea className="max-h-80 pr-3">
                <Timeline>
                  {journey.steps.map((s) => (
                    <TimelineItem
                      key={s.key}
                      icon={s.icon}
                      title={s.title}
                      time={
                        <time dateTime={s.at} title={relativeTime(s.at)}>
                          {shortDateTime(s.at)}
                        </time>
                      }
                    >
                      {s.detail}
                    </TimelineItem>
                  ))}
                </Timeline>
                {!journey.hasEarlier && <p className="mt-4 text-xs text-muted-foreground">No earlier interactions.</p>}
              </ScrollArea>
            </section>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
