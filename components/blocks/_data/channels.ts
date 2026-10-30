import type { ChannelId } from "@/components/blocks/channel-meta"

// `accounts` lists extra sending accounts; the composer shows a From picker only when there is more than one.
export type Channel = { id: ChannelId; account: string; connected: boolean; accounts?: string[] }

// Order matches the queue rail. Telegram is the sample disconnected channel.
// Ivosights (Sociomile's maker) accounts: @ivosights_id and hello@ivosights.com are confirmed public; the rest are unconfirmed.
export const channels: Channel[] = [
  { id: "facebook", account: "Ivosights", connected: true },
  { id: "instagram", account: "@ivosights_id", connected: true },
  { id: "twitter", account: "@ivosights", connected: true },
  { id: "email", account: "hello@ivosights.com", connected: true, accounts: ["hello@ivosights.com", "support@ivosights.com"] },
  { id: "chat", account: "Sociomile Live Chat", connected: true },
  { id: "telegram", account: "@ivosights_bot", connected: false },
  { id: "google-business", account: "Ivosights Jakarta", connected: true },
]
