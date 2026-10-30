"use client"

import { useState } from "react"
import { UsersIcon } from "lucide-react"

import { tickets } from "@/components/blocks/_data/tickets"
import { AppShell } from "@/components/blocks/_parts/app-shell"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { monthDay } from "@/components/blocks/_parts/time"
import { channelMeta } from "@/components/blocks/channel-meta"
import { ContactDetail, type ContactRow } from "@/components/blocks/contacts-01/components/contact-detail"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, DataTableColumnHeader, type DataTableColumnDef } from "@/components/ui/data-table"
import { DataToolbar } from "@/components/ui/data-toolbar"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

// One row per customer, built from the sample tickets (newest first, so tickets[0] is the latest).
const contacts: ContactRow[] = Object.values(
  tickets.reduce<Record<string, ContactRow>>((acc, t) => {
    const row = acc[t.customer]
    if (row) row.tickets.push(t)
    else acc[t.customer] = { ...t.contact, name: t.customer, initials: t.initials, tickets: [t] }
    return acc
  }, {})
)

// Built once with the page's opener; DataTable rebuilds its row models when `columns` changes identity.
const buildColumns = (open: (c: ContactRow, trigger: HTMLElement) => void): DataTableColumnDef<ContactRow>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>{row.original.initials}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={(e) => open(row.original, e.currentTarget)}
          className="rounded-sm font-medium underline-offset-4 outline-none hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {row.original.name}
        </button>
      </span>
    ),
  },
  {
    id: "channels",
    header: "Channel",
    cell: ({ row }) => (
      <span className="flex flex-col gap-1">
        {row.original.identities.map((i) => (
          <span key={i.channel + i.handle} className="flex items-center gap-1.5">
            <ChannelIcon channel={i.channel} className="size-4 [&_svg]:size-2.5" />
            <span className="sr-only">{channelMeta[i.channel].label}:</span>
            <span className="truncate">{i.handle}</span>
          </span>
        ))}
      </span>
    ),
  },
  { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? <span className="text-muted-foreground">—</span> },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => <span className="tabular-nums">{row.original.phone ?? "—"}</span> },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <span className="flex flex-wrap gap-1">
        {row.original.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </span>
    ),
  },
  {
    id: "tickets",
    accessorFn: (c) => c.tickets.length,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tickets" />,
    cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.tickets.length}</span>,
  },
  {
    id: "lastAt",
    accessorFn: (c) => c.tickets[0].createdAt,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last ticket" />,
    cell: ({ row }) => (
      <span className="tabular-nums">
        <span className="font-mono">#{row.original.tickets[0].id}</span> · {monthDay(row.original.tickets[0].createdAt)}
      </span>
    ),
  },
]

export function Contacts() {
  // Keeps the clicked name too: the dialog has no DialogTrigger, so focus goes back to it by hand.
  const [selected, setSelected] = useState<{ contact: ContactRow; trigger: HTMLElement } | null>(null)
  const [columns] = useState(() => buildColumns((contact, trigger) => setSelected({ contact, trigger })))

  return (
    <AppShell active="contact" title="Contact" description={`${contacts.length} customers across all channels · sample data`}>
      <Card className="py-0">
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={contacts}
            pageSize={10}
            toolbar={(table) => <DataToolbar table={table} searchPlaceholder="Search contacts…" />}
            emptyText={
              <Empty className="py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UsersIcon />
                  </EmptyMedia>
                  <EmptyTitle>No matching contacts</EmptyTitle>
                  <EmptyDescription>Try another name, email or phone.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
          />
        </CardContent>
      </Card>
      <ContactDetail
        contact={selected?.contact ?? null}
        onOpenChange={(open) => !open && setSelected(null)}
        onClosed={() => selected?.trigger.focus()}
      />
    </AppShell>
  )
}
