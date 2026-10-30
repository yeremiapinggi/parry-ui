export type ChannelId =
  | "facebook"
  | "instagram"
  | "twitter"
  | "email"
  | "chat"
  | "telegram"
  | "google-business"
  | "whatsapp"
  | "whatsapp-business"
  | "whatsapp-scan"
  | "line"
  | "threads"
  | "youtube"
  | "play-store"
  | "gmail"
  | "exchange"
  | "voice"
  | "custom"

// Brand logos live as full-colour SVGs in public/channels/<id>.svg, so blocks stay free of brand hex values.
// monoLogo: a near-black logo that ChannelIcon inverts in dark themes.
export const channelMeta: Record<ChannelId, { label: string; typeLabel: string; monoLogo?: boolean }> = {
  facebook: { label: "Facebook", typeLabel: "Facebook" },
  instagram: { label: "Instagram", typeLabel: "Instagram DM" },
  twitter: { label: "Twitter", typeLabel: "Twitter DM", monoLogo: true },
  email: { label: "Email", typeLabel: "Email" },
  chat: { label: "Chat", typeLabel: "Webchat" },
  telegram: { label: "Telegram", typeLabel: "Telegram" },
  "google-business": { label: "Google Business", typeLabel: "Google Business" },
  whatsapp: { label: "WhatsApp", typeLabel: "WhatsApp" },
  "whatsapp-business": { label: "WhatsApp Business", typeLabel: "WhatsApp Business" },
  "whatsapp-scan": { label: "WhatsApp Scan", typeLabel: "WhatsApp Scan" },
  line: { label: "LINE", typeLabel: "LINE" },
  threads: { label: "Threads", typeLabel: "Threads" },
  youtube: { label: "YouTube", typeLabel: "YouTube comment" },
  "play-store": { label: "Play Store", typeLabel: "Play Store review" },
  gmail: { label: "Gmail", typeLabel: "Gmail" },
  exchange: { label: "Exchange", typeLabel: "Exchange mail" },
  voice: { label: "Voice", typeLabel: "Voice call" },
  custom: { label: "Custom channel", typeLabel: "Custom channel" },
}
