import Image from "next/image"
import { AtSignIcon, BookmarkIcon, CameraIcon, HeartIcon } from "lucide-react"

const mentions = [
  { author: "Ava Laurent", handle: "@avalovescoffee", source: "Instagram", time: "18m", text: "The new oat latte is the smoothest one I have tried…", sentiment: "Positive", tags: ["Product feedback", "Brand love"], active: true },
  { author: "Marcus Reed", handle: "@marcusreed", source: "X", time: "1h", text: "Nice packaging, but I wish the cold brew was a little less sweet.", sentiment: "Neutral", tags: ["Product feedback"], active: false },
  { author: "Sienna Park", handle: "@siennapark", source: "TikTok", time: "4h", text: "A week into switching to compostable pods and I am genuinely impressed.", sentiment: "Positive", tags: ["Sustainability"], active: false },
]

export function MonitoringFeedThumbnail() {
  return <div aria-hidden="true" data-parry-theme className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
    <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-heading text-[10px] font-semibold sm:text-xs">Social Listening</span><span className="truncate text-[8px] text-muted-foreground sm:text-[9px]">8 mentions · 4 unreviewed · Demo data</span></div>
      <span className="shrink-0 rounded border bg-card px-1.5 py-1 text-[8px] text-muted-foreground sm:text-[9px]">Simulate New Mention</span>
    </div>
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col border-r">
        <div className="flex flex-col gap-1.5 border-b px-2.5 py-2 sm:px-3">
          <span className="flex h-6 items-center gap-1 rounded border bg-card px-2 text-[8px] text-muted-foreground sm:h-7 sm:text-[9px]"><AtSignIcon className="size-2.5" />Search content or author</span>
          <span className="flex gap-1 overflow-hidden text-[7px] sm:text-[8px]"><span className="truncate rounded border bg-card px-1.5 py-1">All sources</span><span className="truncate rounded border bg-card px-1.5 py-1">All sentiments</span><span className="truncate rounded border bg-card px-1.5 py-1">Unreviewed</span></span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-1.5 sm:p-2">
          {mentions.map((mention) => <div key={mention.author} className={`flex min-w-0 gap-1.5 rounded border px-1.5 py-1.5 sm:gap-2 sm:px-2 ${mention.active ? "border-primary/35 bg-accent/60" : "border-transparent"}`}>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex min-w-0 items-center gap-1"><span className="truncate text-[8px] font-semibold sm:text-[9px]">{mention.author}</span><span className="truncate text-[7px] text-muted-foreground sm:text-[8px]">{mention.handle}</span><span className="ml-auto shrink-0 text-[7px] text-muted-foreground sm:text-[8px]">{mention.time}</span></span>
              <span className="flex items-center gap-1 text-[7px] text-muted-foreground sm:text-[8px]">{mention.source === "Instagram" ? <CameraIcon className="size-2.5" /> : <AtSignIcon className="size-2.5" />}{mention.source}</span>
              <span className="line-clamp-2 text-[8px] leading-relaxed text-muted-foreground sm:text-[9px]">{mention.text}</span>
              <span className="flex flex-wrap items-center gap-1"><span className="rounded bg-secondary px-1 py-0.5 text-[6px] text-secondary-foreground sm:text-[7px]">{mention.sentiment}</span><span className="flex items-center gap-0.5 text-[7px] text-muted-foreground"><HeartIcon className="size-2" />248</span>{mention.tags.slice(0, 1).map((tag) => <span key={tag} className="truncate rounded border px-1 py-0.5 text-[6px] text-muted-foreground sm:text-[7px]">{tag}</span>)}</span>
            </span>
            {mention.active && <BookmarkIcon className="mt-0.5 size-2.5 shrink-0 fill-current text-primary" />}
          </div>)}
        </div>
      </div>
      <div className="flex w-[36%] min-w-24 flex-col sm:min-w-32">
        <div className="flex items-center justify-between gap-1 border-b px-2 py-2"><span className="truncate text-[8px] font-semibold sm:text-[9px]">Mention details</span><span className="rounded border px-1 py-0.5 text-[6px] sm:text-[7px]">Positive</span></div>
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-2 sm:gap-2 sm:p-2.5">
          <span className="text-[8px] font-semibold sm:text-[9px]">Ava Laurent</span><span className="text-[7px] leading-relaxed text-muted-foreground sm:text-[8px]">The new oat latte is the smoothest one I have tried. That vanilla finish is perfect for a slow morning.</span>
          <div className="relative aspect-[16/9] overflow-hidden rounded border"><Image src="/images/monitoring-feed-demo.png" alt="" fill sizes="150px" className="object-cover" /></div>
          <div className="flex items-center justify-between gap-1 border-t pt-1.5 text-[7px] text-muted-foreground sm:text-[8px]"><span>Likes</span><span>Comments</span><span>Shares</span></div>
          <div className="flex items-center justify-between gap-1 font-data text-[7px] font-semibold sm:text-[8px]"><span>248</span><span>31</span><span>18</span></div>
        </div>
      </div>
    </div>
  </div>
}
