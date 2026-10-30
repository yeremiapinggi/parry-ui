import { cn } from "cn"

import { channelMeta, type ChannelId } from "@/components/blocks/channel-meta"

// Full-colour brand logo; decorative, so callers render the channel label next to it.
export function ChannelIcon({ channel, muted, className }: { channel: ChannelId; muted?: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-grid size-5 shrink-0 place-items-center", muted && "opacity-40 grayscale", className)}>
      {/* A plain img keeps each SVG's internal ids isolated; next/image adds nothing for tiny static SVGs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/channels/${channel}.svg`} alt="" className={cn("size-full object-contain", channelMeta[channel].monoLogo && "dark:invert")} />
    </span>
  )
}
