import type { ChannelId } from "@/components/blocks/channel-meta"

import type { Kpi } from "@/components/blocks/_data/kpis"
import type { KpiTrend } from "@/components/blocks/_parts/kpi-tile"

// Sample dashboard figures for "today"; `change` is the real % move vs yesterday, `goodWhen` says which way is good.
export const dashboardKpis: (Kpi & { trend: KpiTrend })[] = [
  { label: "ART", value: "14s", hint: "Average response time", trend: { change: -8, goodWhen: "down" } },
  { label: "TR", value: "186", hint: "Total replies", trend: { change: 12, goodWhen: "up" } },
  { label: "ARR", value: "96%", hint: "Agent reply rate", trend: { change: 2, goodWhen: "up" } },
  { label: "Target", value: "24", hint: "Tickets left to today's target", trend: { change: -6, goodWhen: "down" } },
  { label: "Open tickets", value: "41", hint: "Open and pending tickets", trend: { change: -5, goodWhen: "down" } },
  { label: "Out SLA", value: "3", hint: "Tickets past their SLA", trend: { change: 2, goodWhen: "down" } },
]

export const ticketsPerChannel: { channel: ChannelId; tickets: number }[] = [
  { channel: "chat", tickets: 64 },
  { channel: "facebook", tickets: 42 },
  { channel: "instagram", tickets: 35 },
  { channel: "email", tickets: 28 },
  { channel: "twitter", tickets: 12 },
  { channel: "google-business", tickets: 9 },
  { channel: "telegram", tickets: 0 },
]

// Average response time per hour today, in seconds, against a 20s target.
export const responseTrend = [
  { hour: "08:00", art: 22 },
  { hour: "09:00", art: 18 },
  { hour: "10:00", art: 15 },
  { hour: "11:00", art: 19 },
  { hour: "12:00", art: 26 },
  { hour: "13:00", art: 21 },
  { hour: "14:00", art: 13 },
  { hour: "15:00", art: 11 },
  { hour: "16:00", art: 12 },
  { hour: "17:00", art: 14 },
]
export const artTarget = 20

export const sentimentByDay = [
  { day: "Fri", positive: 38, neutral: 52, negative: 9 },
  { day: "Sat", positive: 22, neutral: 31, negative: 6 },
  { day: "Sun", positive: 18, neutral: 24, negative: 4 },
  { day: "Mon", positive: 44, neutral: 61, negative: 15 },
  { day: "Tue", positive: 41, neutral: 57, negative: 11 },
  { day: "Wed", positive: 47, neutral: 55, negative: 8 },
  { day: "Thu", positive: 52, neutral: 63, negative: 12 },
]

// Per-agent figures for today, keyed by team agent id.
export const agentStats: Record<string, { handled: number; art: string; arr: number }> = {
  pingottestting: { handled: 38, art: "11s", arr: 100 },
  dewi: { handled: 31, art: "13s", arr: 98 },
  rizky: { handled: 44, art: "19s", arr: 91 },
  sari: { handled: 17, art: "15s", arr: 94 },
  budi: { handled: 0, art: "–", arr: 0 },
  intan: { handled: 29, art: "12s", arr: 97 },
}
