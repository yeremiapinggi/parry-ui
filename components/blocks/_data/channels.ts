import type { ChannelId } from "@/components/blocks/channel-meta"

export type Channel = { id: ChannelId; account: string; connected: boolean }

// Order matches the queue rail. Telegram is the sample disconnected channel.
export const channels: Channel[] = [
  { id: "facebook", account: "Demo Motor ID", connected: true },
  { id: "instagram", account: "@sociomile.demo", connected: true },
  { id: "twitter", account: "@demomotor_id", connected: true },
  { id: "email", account: "cs@demo-motor.example", connected: true },
  { id: "chat", account: "Pingot Chat", connected: true },
  { id: "telegram", account: "@demomotor_bot", connected: false },
  { id: "google-business", account: "Demo Motor Kemang", connected: true },
]
