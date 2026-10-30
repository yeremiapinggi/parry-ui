import { channels } from "@/components/blocks/_data/channels"
import { team } from "@/components/blocks/_data/team"
import type { ChannelId } from "@/components/blocks/channel-meta"

export type ReportId = "tickets" | "agents" | "channels" | "sla" | "sentiment"

export const reportTypes: { id: ReportId; label: string; description: string }[] = [
  { id: "tickets", label: "Ticket report", description: "Every ticket in the period with channel, status and handling agent." },
  { id: "agents", label: "Agent performance", description: "Handled tickets, response time and reply rate per agent." },
  { id: "channels", label: "Channel report", description: "Volume, response time and sentiment per channel." },
  { id: "sla", label: "SLA report", description: "First response against the SLA target, per ticket." },
  { id: "sentiment", label: "Sentiment", description: "Daily split of positive, neutral and negative tickets." },
]

const customers = [
  "Andi Wijaya", "Siti Rahmawati", "Bambang Hidayat", "Rina Kusuma", "Yoga Saputra", "Maya Anggraini",
  "Fajar Nugroho", "Lina Marlina", "Hendra Gunawan", "Dian Puspita", "Agus Salim", "Wulan Sari",
]
const groups = ["Customer Care", "Billing", "Dealer Support", "Digital"]
const statuses = ["Open", "Pending", "Closed"] as const
const connected = channels.filter((c) => c.connected).map((c) => c.id)
const agents = team.filter((a) => a.presence !== "offline").map((a) => a.name)

export type TicketRow = { id: number; customer: string; channel: ChannelId; group: string; agent: string; status: (typeof statuses)[number]; created: string; replies: number }
export type SlaRow = { id: number; channel: ChannelId; agent: string; group: string; firstResponse: number; target: number }

// Deterministic sample rows (index-based picks), enough for a few pages.
export const ticketRows: TicketRow[] = Array.from({ length: 28 }, (_, i) => ({
  id: 380 - i,
  customer: customers[i % customers.length],
  channel: connected[(i * 5) % connected.length],
  group: groups[i % groups.length],
  agent: agents[(i * 3) % agents.length],
  status: statuses[(i * 7) % 3],
  created: `Sep ${24 - Math.floor(i / 6)}, ${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
  replies: (i * 7) % 9,
}))

export const slaRows: SlaRow[] = ticketRows.map((t, i) => ({
  id: t.id,
  channel: t.channel,
  agent: t.agent,
  group: t.group,
  firstResponse: [8, 12, 25, 6, 41, 14, 19, 9, 33, 11][i % 10],
  target: 20,
}))

export const agentRows = team.map((a, i) => ({
  agent: a.name,
  group: groups[i % groups.length],
  handled: [38, 31, 44, 17, 0, 29][i],
  art: [11, 13, 19, 15, 0, 12][i],
  arr: [100, 98, 91, 94, 0, 97][i],
  outSla: [0, 1, 3, 1, 0, 0][i],
}))

export const channelRows = channels.map((c, i) => ({
  channel: c.id,
  tickets: [42, 35, 12, 28, 64, 0, 9][i],
  art: [16, 14, 22, 41, 9, 0, 18][i],
  positive: [41, 52, 30, 38, 47, 0, 55][i],
}))

export const sentimentRows = [
  { day: "Sep 18", positive: 38, neutral: 52, negative: 9 },
  { day: "Sep 19", positive: 22, neutral: 31, negative: 6 },
  { day: "Sep 20", positive: 18, neutral: 24, negative: 4 },
  { day: "Sep 21", positive: 44, neutral: 61, negative: 15 },
  { day: "Sep 22", positive: 41, neutral: 57, negative: 11 },
  { day: "Sep 23", positive: 47, neutral: 55, negative: 8 },
  { day: "Sep 24", positive: 52, neutral: 63, negative: 12 },
]

export const reportGroups = groups
