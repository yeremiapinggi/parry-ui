"use client"

import { MailIcon, PhoneIcon } from "lucide-react"

import type { Contact, Ticket } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { monthDay } from "@/components/blocks/_parts/time"
import { channelMeta } from "@/components/blocks/channel-meta"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type ContactRow = Contact & { name: string; initials: string; tickets: Ticket[] }

function InfoItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex min-h-7 items-center gap-2.5">
      <span className="grid size-4 shrink-0 place-items-center text-muted-foreground">{icon}</span>
      <span className="sr-only">{label}:</span>
      <span className="min-w-0 truncate">{children}</span>
    </li>
  )
}

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
  return (
    <Dialog open={c !== null} onOpenChange={onOpenChange}>
      {c && (
        <DialogContent
          className="sm:max-w-2xl"
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
                {c.tickets.length} active {c.tickets.length === 1 ? "ticket" : "tickets"} · last contact {monthDay(c.tickets[0].createdAt)}
              </DialogDescription>
            </div>
          </DialogHeader>

          <section aria-labelledby="contact-info-heading" className="flex flex-col gap-2">
            <h3 id="contact-info-heading" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
        </DialogContent>
      )}
    </Dialog>
  )
}
