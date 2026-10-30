import { FrownIcon, MehIcon, SmileIcon, type LucideIcon } from "lucide-react"

import type { Sentiment, TicketStatus } from "@/components/blocks/_data/tickets"

// One status control covers the whole lifecycle; colours follow status tokens (green / amber / grey / red / blue).
export const statusMeta: Record<TicketStatus, { label: string; dot: string }> = {
  open: { label: "Open", dot: "bg-success" },
  pending: { label: "Pending", dot: "bg-warning" },
  closed: { label: "Closed", dot: "bg-muted-foreground" },
  spam: { label: "Spam", dot: "bg-destructive" },
  other: { label: "Other", dot: "bg-info" },
}

export const sentimentMeta: Record<Sentiment, { label: string; icon: LucideIcon; tone: string }> = {
  positive: { label: "Positive", icon: SmileIcon, tone: "text-success" },
  neutral: { label: "Neutral", icon: MehIcon, tone: "text-muted-foreground" },
  negative: { label: "Negative", icon: FrownIcon, tone: "text-destructive" },
}

export const escalationGroups = ["Dealer Support", "Billing", "Digital", "Warranty Team"]

// Shortcut labels shown in tooltips; the handlers live in TicketDetail and the composer.
export const shortcuts = {
  send: "Ctrl Enter",
  sendClose: "Ctrl Shift Enter",
  reply: "Alt 1",
  escalate: "Alt 2",
  note: "Alt 3",
  closeReopen: "Alt C",
  assign: "Alt A",
}
