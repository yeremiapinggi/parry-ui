import { AppHeader } from "@/components/blocks/_parts/app-header"

export const meta = {
  id: "ticket-inbox-01",
  title: "Ticket inbox",
  description: "Queue rail, ticket list, conversation and ticket context for the agent inbox.",
  category: "Main pages",
} as const

export default function TicketInbox01() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <AppHeader active="ticket" />
    </div>
  )
}
