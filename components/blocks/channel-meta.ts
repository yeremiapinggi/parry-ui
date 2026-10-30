import { AtSignIcon, CameraIcon, MailIcon, MessagesSquareIcon, SendIcon, StoreIcon, ThumbsUpIcon, type LucideIcon } from "lucide-react"

export type ChannelId = "facebook" | "instagram" | "twitter" | "email" | "chat" | "telegram" | "google-business"

// The only place brand colours live (blocks otherwise use theme tokens). lucide v1 ships no brand logos,
// so each channel gets a generic glyph (in channelGlyphColor) on its brand colour.
export const channelGlyphColor = "#FFFFFF"

export const channelMeta: Record<ChannelId, { label: string; typeLabel: string; icon: LucideIcon; color: string }> = {
  facebook: { label: "Facebook", typeLabel: "Facebook", icon: ThumbsUpIcon, color: "#1877F2" },
  instagram: { label: "Instagram", typeLabel: "Instagram DM", icon: CameraIcon, color: "#C13584" },
  twitter: { label: "Twitter", typeLabel: "Twitter DM", icon: AtSignIcon, color: "#0F1419" },
  email: { label: "Email", typeLabel: "Email", icon: MailIcon, color: "#B45309" },
  chat: { label: "Chat", typeLabel: "Webchat", icon: MessagesSquareIcon, color: "#1A6CCC" },
  telegram: { label: "Telegram", typeLabel: "Telegram", icon: SendIcon, color: "#1C7CB0" },
  "google-business": { label: "Google Business", typeLabel: "Google Business", icon: StoreIcon, color: "#1E7E34" },
}
