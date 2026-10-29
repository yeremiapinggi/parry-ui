import { Inbox } from "@/components/blocks/ticket-inbox-01/components/inbox"

export const meta = {
  id: "ticket-inbox-01",
  title: "Ticket inbox",
  description: "Queue rail, ticket list, conversation and ticket context for the agent inbox.",
  category: "Main pages",
} as const

export default function TicketInbox01() {
  return <Inbox />
}
