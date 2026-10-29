import { cn } from "cn"

import { channelGlyphColor, channelMeta, type ChannelId } from "@/components/blocks/channel-meta"

// Brand-coloured glyph tile; decorative, so callers render the channel label next to it.
export function ChannelIcon({ channel, muted, className }: { channel: ChannelId; muted?: boolean; className?: string }) {
  const { icon: Icon, color } = channelMeta[channel]
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid size-5 shrink-0 place-items-center rounded-sm [&_svg]:size-3", muted && "opacity-40 grayscale", className)}
      style={{ backgroundColor: color, color: channelGlyphColor }}
    >
      <Icon />
    </span>
  )
}
