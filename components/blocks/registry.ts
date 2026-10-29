import type { ReactNode } from "react"

import TicketInbox01, { meta as ticketInbox01 } from "@/components/blocks/ticket-inbox-01/page"

export type BlockMeta = { id: string; title: string; description: string; category: "Main pages" }

export const blocks: { meta: BlockMeta; Component: () => ReactNode; path: string }[] = [
  { meta: ticketInbox01, Component: TicketInbox01, path: "components/blocks/ticket-inbox-01/page.tsx" },
]
