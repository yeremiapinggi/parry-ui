import type { ChannelId } from "@/components/blocks/channel-meta"

// `accounts` lists extra sending accounts; the composer shows a From picker only when there is more than one.
export type Channel = { id: ChannelId; account: string; connected: boolean; accounts?: string[] }

// Order matches the queue rail. Telegram is the sample disconnected channel.
export const channels: Channel[] = [
  { id: "facebook", account: "Demo Motor ID", connected: true },
  { id: "instagram", account: "@sociomile.demo", connected: true },
  { id: "twitter", account: "@demomotor_id", connected: true },
  { id: "email", account: "cs@demo-motor.example", connected: true, accounts: ["cs@demo-motor.example", "billing@demo-motor.example"] },
  { id: "chat", account: "Pingot Chat", connected: true },
  { id: "telegram", account: "@demomotor_bot", connected: false },
  { id: "google-business", account: "Demo Motor Kemang", connected: true },
]
