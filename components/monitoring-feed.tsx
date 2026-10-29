"use client"

import Image from "next/image"
import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import {
  AtSignIcon,
  BookmarkIcon,
  CameraIcon,
  ChevronDownIcon,
  Clock3Icon,
  CopyIcon,
  ExternalLinkIcon,
  FilterXIcon,
  HeartIcon,
  LinkIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  Music2Icon,
  NewspaperIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Share2Icon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export type MonitoringPlatform = string
export type MonitoringSentiment = string
export type MonitoringContentType = string
export type MonitoringReviewStatus = string

export type MonitoringFeedItem = {
  id: string
  author: string
  handle: string
  platform: MonitoringPlatform
  publishedAt: string
  content: string
  contentType: MonitoringContentType
  mediaUrl?: string
  mediaAlt?: string
  originalUrl?: string
  sentiment: MonitoringSentiment
  engagement: { likes: number; comments: number; shares: number }
  tags: string[]
  reviewed: boolean
  bookmarked: boolean
  [field: string]: unknown
}

export type MonitoringMetadataField = {
  label: string
  value: (item: MonitoringFeedItem) => ReactNode
}

export type MonitoringFeedOptions = {
  title?: string
  description?: string
  enabledFilters?: Partial<Record<"source" | "sentiment" | "dateRange" | "reviewStatus" | "sort", boolean>>
  sourceOptions?: MonitoringPlatform[]
  sentimentOptions?: MonitoringSentiment[]
  tagOptions?: string[]
  reviewLabels?: { reviewed: string; unreviewed: string }
  actions?: Partial<Record<"review" | "bookmark" | "tags" | "copy" | "original", boolean>>
  renderContent?: (item: MonitoringFeedItem, mode: "preview" | "detail") => ReactNode
  metadataFields?: MonitoringMetadataField[]
  detailSections?: { title: string; content: (item: MonitoringFeedItem) => ReactNode }[]
}

export type MonitoringFeedProps = {
  initialItems?: MonitoringFeedItem[]
  options?: MonitoringFeedOptions
  showPreviewStates?: boolean
}

type DemoState = "ready" | "loading" | "unavailable" | "empty"
type EnabledMonitoringActions = Required<NonNullable<MonitoringFeedOptions["actions"]>>
type SourceFilter = "All sources" | MonitoringPlatform
type SentimentFilter = "All sentiments" | MonitoringSentiment
type ReviewFilter = "All items" | "Unreviewed" | "Reviewed"
type SortMode = "Newest" | "Oldest" | "Highest engagement"
type DateRange = "Any time" | "Past 24 hours" | "Past 7 days" | "Past 30 days"

const DAY = 24 * 60 * 60 * 1000
const DEMO_REFERENCE_TIME = Date.UTC(2026, 9, 28, 10)
const baseTime = DEMO_REFERENCE_TIME

const demoItems: MonitoringFeedItem[] = [
  {
    id: "mention-ava-01",
    author: "Ava Laurent",
    handle: "@avalovescoffee",
    platform: "Instagram",
    publishedAt: new Date(baseTime - 18 * 60 * 1000).toISOString(),
    content: "The new oat latte from Northstar is honestly the smoothest one I have tried. That little vanilla finish is perfect for a slow morning.",
    contentType: "Post",
    mediaUrl: "/images/monitoring-feed-demo.png",
    mediaAlt: "Iced oat latte on a bright cafe table",
    originalUrl: "https://example.com/demo/social-post/mention-ava-01",
    sentiment: "Positive",
    engagement: { likes: 248, comments: 31, shares: 18 },
    tags: ["Product feedback", "Brand love"],
    reviewed: false,
    bookmarked: true,
  },
  {
    id: "mention-marcus-02",
    author: "Marcus Reed",
    handle: "@marcusreed",
    platform: "X",
    publishedAt: new Date(baseTime - 72 * 60 * 1000).toISOString(),
    content: "Tried Northstar Coffee for the first time today. Nice packaging, but I wish the cold brew was a little less sweet.",
    contentType: "Post",
    originalUrl: "https://example.com/demo/social-post/mention-marcus-02",
    sentiment: "Neutral",
    engagement: { likes: 86, comments: 12, shares: 5 },
    tags: ["Product feedback"],
    reviewed: true,
    bookmarked: false,
  },
  {
    id: "mention-sienna-03",
    author: "Sienna Park",
    handle: "@siennapark",
    platform: "TikTok",
    publishedAt: new Date(baseTime - 4 * 60 * 60 * 1000).toISOString(),
    content: "A week into switching to Northstar's compostable pods and I am genuinely impressed. Easy to brew, no plastic guilt.",
    contentType: "Video",
    originalUrl: "https://example.com/demo/social-post/mention-sienna-03",
    sentiment: "Positive",
    engagement: { likes: 2840, comments: 164, shares: 392 },
    tags: ["Sustainability", "Brand love"],
    reviewed: false,
    bookmarked: false,
  },
  {
    id: "mention-jordan-04",
    author: "Jordan Blake",
    handle: "@jordanbakes",
    platform: "Facebook",
    publishedAt: new Date(baseTime - 9 * 60 * 60 * 1000).toISOString(),
    content: "Has anyone else had an issue with their monthly delivery arriving two days late? The coffee is great, but the shipping updates could be clearer.",
    contentType: "Post",
    originalUrl: "https://example.com/demo/social-post/mention-jordan-04",
    sentiment: "Negative",
    engagement: { likes: 34, comments: 19, shares: 2 },
    tags: ["Shipping", "Support"],
    reviewed: false,
    bookmarked: false,
  },
  {
    id: "mention-city-05",
    author: "City Plate Journal",
    handle: "cityplate.example",
    platform: "News",
    publishedAt: new Date(baseTime - 28 * 60 * 60 * 1000).toISOString(),
    content: "Northstar Coffee opens its first neighborhood tasting room, pairing small-batch roasts with a rotating local bakery menu.",
    contentType: "Article",
    originalUrl: "https://example.com/demo/news/city-plate-northstar",
    sentiment: "Positive",
    engagement: { likes: 18, comments: 4, shares: 27 },
    tags: ["Press", "Campaign"],
    reviewed: true,
    bookmarked: false,
  },
  {
    id: "mention-noah-06",
    author: "Noah Kim",
    handle: "@noahmakes",
    platform: "X",
    publishedAt: new Date(baseTime - 3 * DAY).toISOString(),
    content: "Northstar's new single-origin bags look lovely on the shelf. How long do you recommend resting the roast before brewing?",
    contentType: "Post",
    originalUrl: "https://example.com/demo/social-post/mention-noah-06",
    sentiment: "Neutral",
    engagement: { likes: 47, comments: 8, shares: 3 },
    tags: [],
    reviewed: false,
    bookmarked: false,
  },
  {
    id: "mention-lila-07",
    author: "Lila Santos",
    handle: "@lilasips",
    platform: "Instagram",
    publishedAt: new Date(baseTime - 5 * DAY).toISOString(),
    content: "The cinnamon seasonal blend is back! I grabbed two bags for my parents before they sell out again.",
    contentType: "Story",
    sentiment: "Positive",
    engagement: { likes: 312, comments: 22, shares: 41 },
    tags: ["Seasonal", "Brand love"],
    reviewed: true,
    bookmarked: true,
  },
  {
    id: "mention-priya-08",
    author: "Priya Nair",
    handle: "@priyawrites",
    platform: "Facebook",
    publishedAt: new Date(baseTime - 11 * DAY).toISOString(),
    content: "Customer service replaced my cracked brewer the same day I reached out. Appreciate how easy the whole thing was.",
    contentType: "Post",
    originalUrl: "https://example.com/demo/social-post/mention-priya-08",
    sentiment: "Positive",
    engagement: { likes: 129, comments: 14, shares: 9 },
    tags: ["Support"],
    reviewed: true,
    bookmarked: false,
  },
]

const defaultTagOptions = ["Product feedback", "Brand love", "Sustainability", "Shipping", "Support", "Press", "Campaign", "Seasonal", "Feature request", "Partnership"]
const sourceOptions: MonitoringPlatform[] = ["X", "Instagram", "Facebook", "TikTok", "News"]
const sentimentTone: Partial<Record<MonitoringSentiment, string>> = {
  Positive: "bg-success-soft text-success",
  Neutral: "bg-secondary text-secondary-foreground",
  Negative: "bg-destructive-soft text-destructive",
}
const platformIcon: Partial<Record<MonitoringPlatform, typeof AtSignIcon>> = {
  X: AtSignIcon,
  Instagram: CameraIcon,
  Facebook: MessageCircleIcon,
  TikTok: Music2Icon,
  News: NewspaperIcon,
}

function formatPublicationDate(value: string, full = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return new Intl.DateTimeFormat("en", full
    ? { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }
    : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date)
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value)
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

function SelectFilter({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string
  value: string
  options: string[]
  onValueChange: (value: string) => void
}) {
  return <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger aria-label={label} className="h-8 w-full min-w-0 sm:w-auto sm:min-w-32"><SelectValue /></SelectTrigger>
    <SelectContent position="popper"><SelectGroup>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectGroup></SelectContent>
  </Select>
}

function SentimentBadge({ sentiment }: { sentiment: MonitoringSentiment }) {
  const tone = sentimentTone[sentiment] ?? "bg-secondary text-secondary-foreground"
  return <Badge variant="secondary" className={`h-5 border-0 px-1.5 text-[10px] font-medium ${tone}`}>{sentiment}</Badge>
}

function ReviewBadge({ reviewed, labels }: { reviewed: boolean; labels: { reviewed: string; unreviewed: string } }) {
  return <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
    <span aria-hidden="true" className={`size-1.5 rounded-full ${reviewed ? "bg-muted-foreground/50" : "bg-info"}`} />
    {reviewed ? labels.reviewed : labels.unreviewed}
  </span>
}

function DefaultContent({ item, mode }: { item: MonitoringFeedItem; mode: "preview" | "detail" }) {
  if (mode === "preview") return <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{item.content}</p>
  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>
}

function FeedItemCard({
  item,
  selected,
  labels,
  actions,
  renderContent,
  onSelect,
  onToggleReview,
  onToggleBookmark,
  onCopy,
  buttonRef,
  onKeyDown,
}: {
  item: MonitoringFeedItem
  selected: boolean
  labels: { reviewed: string; unreviewed: string }
  actions: EnabledMonitoringActions
  renderContent: NonNullable<MonitoringFeedOptions["renderContent"]>
  onSelect: () => void
  onToggleReview: () => void
  onToggleBookmark: () => void
  onCopy: () => void
  buttonRef: (button: HTMLButtonElement | null) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  const SourceIcon = platformIcon[item.platform] ?? LinkIcon
  return <li className={`group rounded-md border transition-colors ${selected ? "border-primary/40 bg-accent/60" : "border-transparent hover:border-border hover:bg-muted/40"}`}>
    <div className="flex min-w-0 items-start gap-2 px-3 py-3">
      <button ref={buttonRef} type="button" onKeyDown={onKeyDown} aria-current={selected ? "true" : undefined} aria-label={`Select mention by ${item.author} on ${item.platform}`} onClick={onSelect} className="flex min-w-0 flex-1 items-start gap-2.5 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar aria-hidden="true" className="mt-0.5 size-8 shrink-0"><AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">{getInitials(item.author)}</AvatarFallback></Avatar>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="truncate text-xs font-semibold">{item.author}</span>
            <span className="truncate text-[11px] text-muted-foreground">{item.handle}</span>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground"><SourceIcon aria-hidden="true" className="size-3" />{item.platform}</span>
            <time dateTime={item.publishedAt} className="ml-auto shrink-0 text-[10px] text-muted-foreground">{formatPublicationDate(item.publishedAt)}</time>
          </span>
          <span className="block min-w-0">{renderContent(item, "preview")}</span>
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <SentimentBadge sentiment={item.sentiment} />
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><HeartIcon aria-hidden="true" className="size-3" />{compactNumber(item.engagement.likes + item.engagement.comments + item.engagement.shares)}</span>
            <ReviewBadge reviewed={item.reviewed} labels={labels} />
            {item.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="outline" className="h-5 max-w-32 truncate px-1.5 text-[10px] font-normal text-muted-foreground">{tag}</Badge>)}
            {item.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{item.tags.length - 2}</span>}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        {actions.bookmark && <Button type="button" variant="ghost" size="icon-xs" aria-label={item.bookmarked ? "Remove bookmark" : "Bookmark mention"} aria-pressed={item.bookmarked} onClick={onToggleBookmark} className={item.bookmarked ? "text-primary" : "text-muted-foreground"}><BookmarkIcon aria-hidden="true" className={item.bookmarked ? "fill-current" : undefined} /></Button>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-xs" aria-label={`More actions for ${item.author}`}><MoreHorizontalIcon aria-hidden="true" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" data-parry-theme>
            {actions.review && <DropdownMenuItem onClick={onToggleReview}>{item.reviewed ? "Mark as unreviewed" : "Mark as reviewed"}</DropdownMenuItem>}
            {actions.bookmark && <DropdownMenuItem onClick={onToggleBookmark}>{item.bookmarked ? "Remove bookmark" : "Bookmark mention"}</DropdownMenuItem>}
            {actions.copy && <DropdownMenuItem onClick={onCopy}><CopyIcon aria-hidden="true" />Copy content</DropdownMenuItem>}
            {actions.original && item.originalUrl && <><DropdownMenuSeparator /><DropdownMenuItem asChild><a href={item.originalUrl} target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" />Open original post</a></DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </li>
}

function DetailContent({
  item,
  options,
  labels,
  actions,
  onToggleReview,
  onToggleBookmark,
  onRemoveTag,
  onAddTag,
  onCopy,
}: {
  item: MonitoringFeedItem
  options: MonitoringFeedOptions
  labels: { reviewed: string; unreviewed: string }
  actions: EnabledMonitoringActions
  onToggleReview: () => void
  onToggleBookmark: () => void
  onRemoveTag: (tag: string) => void
  onAddTag: (tag: string) => void
  onCopy: () => void
}) {
  const SourceIcon = platformIcon[item.platform] ?? LinkIcon
  const [tagMenuOpen, setTagMenuOpen] = useState(false)
  const customFields = options.metadataFields ?? []
  const tags = options.tagOptions ?? defaultTagOptions
  const addableTags = tags.filter((tag) => !item.tags.includes(tag))
  const renderContent = options.renderContent ?? ((current, mode) => <DefaultContent item={current} mode={mode} />)

  return <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
    <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <Avatar aria-hidden="true" className="size-10 shrink-0"><AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">{getInitials(item.author)}</AvatarFallback></Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-sm font-semibold">{item.author}</p>
          <p className="truncate text-xs text-muted-foreground">{item.handle}</p>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><SourceIcon aria-hidden="true" className="size-3.5" />{item.platform}<span aria-hidden="true">·</span>{item.contentType}</span>
        </div>
        <SentimentBadge sentiment={item.sentiment} />
      </div>
      <div className="text-sm leading-relaxed">{renderContent(item, "detail")}</div>
      {item.mediaUrl ? <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border bg-muted">
        <Image src={item.mediaUrl} alt={item.mediaAlt ?? `Media attached to ${item.author}'s ${item.platform} mention`} fill sizes="(max-width: 768px) 90vw, 34vw" loading="eager" className="object-cover" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground"><CameraIcon aria-hidden="true" className="size-3" />Media preview</span>
      </div> : <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2.5 text-xs text-muted-foreground"><CameraIcon aria-hidden="true" className="size-4 shrink-0" />This item has no media attachment.</div>}
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock3Icon aria-hidden="true" className="size-3.5" /><time dateTime={item.publishedAt}>{formatPublicationDate(item.publishedAt, true)}</time></p>
      {customFields.map((field) => <div key={field.label} className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{field.label}</span><span className="text-right">{field.value(item)}</span></div>)}
    </div>

    <Separator />
    <section aria-labelledby="monitoring-analytics-heading" className="flex flex-col gap-3 px-4 py-4 sm:px-5">
      <h3 id="monitoring-analytics-heading" className="text-xs font-semibold">Engagement</h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Likes", value: item.engagement.likes, icon: HeartIcon },
          { label: "Comments", value: item.engagement.comments, icon: MessageCircleIcon },
          { label: "Shares", value: item.engagement.shares, icon: Share2Icon },
          { label: "Total", value: item.engagement.likes + item.engagement.comments + item.engagement.shares, icon: SparklesIcon },
        ].map(({ label, value, icon: Icon }) => <div key={label} className="flex min-w-0 flex-col items-center gap-1 rounded-md bg-muted/60 px-1.5 py-2">
          <Icon aria-hidden="true" className="size-3.5 text-muted-foreground" />
          <span className="font-data text-xs font-semibold tabular-nums">{compactNumber(value)}</span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>)}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">Sentiment</span><SentimentBadge sentiment={item.sentiment} /></div>
    </section>

    <Separator />
    <section aria-labelledby="monitoring-organization-heading" className="flex flex-col gap-3 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-2"><h3 id="monitoring-organization-heading" className="text-xs font-semibold">Organization</h3><ReviewBadge reviewed={item.reviewed} labels={labels} /></div>
      <div className="flex flex-wrap items-center gap-1.5">
        {item.tags.length ? item.tags.map((tag) => <Badge key={tag} variant="outline" className="h-6 gap-1 px-2 text-[10px] font-normal">{tag}{actions.tags && <button type="button" aria-label={`Remove ${tag} tag`} onClick={() => onRemoveTag(tag)} className="ml-0.5 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><XIcon aria-hidden="true" className="size-3" /></button>}</Badge>) : <p className="text-xs text-muted-foreground">No tags assigned.</p>}
        {actions.tags && addableTags.length > 0 && <DropdownMenu open={tagMenuOpen} onOpenChange={setTagMenuOpen}>
          <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="xs"><PlusIcon data-icon="inline-start" />Add tag</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="start" data-parry-theme><DropdownMenuGroup>{addableTags.map((tag) => <DropdownMenuItem key={tag} onClick={() => { onAddTag(tag); setTagMenuOpen(false) }}>{tag}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuContent>
        </DropdownMenu>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions.review && <Button type="button" variant="outline" size="sm" onClick={onToggleReview}>{item.reviewed ? "Mark unreviewed" : "Mark reviewed"}</Button>}
        {actions.bookmark && <Button type="button" variant={item.bookmarked ? "secondary" : "outline"} size="sm" aria-pressed={item.bookmarked} onClick={onToggleBookmark}><BookmarkIcon data-icon="inline-start" className={item.bookmarked ? "fill-current" : undefined} />{item.bookmarked ? "Bookmarked" : "Bookmark"}</Button>}
      </div>
    </section>

    <Separator />
    <section aria-labelledby="monitoring-actions-heading" className="flex flex-col gap-2 px-4 py-4 sm:px-5">
      <h3 id="monitoring-actions-heading" className="text-xs font-semibold">Actions</h3>
      <div className="flex flex-wrap gap-2">
        {actions.copy && <Button type="button" variant="outline" size="sm" onClick={onCopy}><CopyIcon data-icon="inline-start" />Copy content</Button>}
        {actions.original && item.originalUrl ? <Button asChild variant="outline" size="sm"><a href={item.originalUrl} target="_blank" rel="noreferrer">Open original<ExternalLinkIcon data-icon="inline-end" /></a></Button> : actions.original ? <Button type="button" variant="outline" size="sm" disabled><LinkIcon data-icon="inline-start" />Original unavailable</Button> : null}
      </div>
      {!item.originalUrl && <p className="text-[11px] leading-relaxed text-muted-foreground">This demo item does not include an external post URL.</p>}
    </section>

    {options.detailSections?.map((section) => <div key={section.title} className="contents"><Separator /><section className="flex flex-col gap-3 px-4 py-4 sm:px-5"><h3 className="text-xs font-semibold">{section.title}</h3>{section.content(item)}</section></div>)}
  </div>
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-1 text-[10px] font-medium text-muted-foreground sm:min-w-28"><span>{label}</span>{children}</div>
}

function DetailPanel({
  item,
  options,
  labels,
  actions,
  onClose,
  onToggleReview,
  onToggleBookmark,
  onRemoveTag,
  onAddTag,
  onCopy,
}: {
  item: MonitoringFeedItem | undefined
  options: MonitoringFeedOptions
  labels: { reviewed: string; unreviewed: string }
  actions: EnabledMonitoringActions
  onClose?: () => void
  onToggleReview: () => void
  onToggleBookmark: () => void
  onRemoveTag: (tag: string) => void
  onAddTag: (tag: string) => void
  onCopy: () => void
}) {
  return <section aria-label="Selected mention details" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
    <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5"><h2 className="truncate text-sm font-semibold">Mention details</h2><p className="truncate text-[11px] text-muted-foreground">{item ? `${item.platform} · ${item.contentType}` : "Select an item to inspect"}</p></div>
      {onClose && <Button type="button" variant="ghost" size="icon-sm" aria-label="Close mention details" onClick={onClose}><XIcon aria-hidden="true" /></Button>}
    </header>
    {item ? <DetailContent item={item} options={options} labels={labels} actions={actions} onToggleReview={onToggleReview} onToggleBookmark={onToggleBookmark} onRemoveTag={onRemoveTag} onAddTag={onAddTag} onCopy={onCopy} /> : <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"><SearchIcon aria-hidden="true" className="size-5 text-muted-foreground" /><p className="text-sm font-medium">No mention selected</p><p className="text-xs leading-relaxed text-muted-foreground">Choose an item in the feed to see its content and engagement.</p></div>}
  </section>
}

export function MonitoringFeed({ initialItems, options = {}, showPreviewStates = true }: MonitoringFeedProps) {
  const [items, setItems] = useState<MonitoringFeedItem[]>(() => initialItems ?? demoItems)
  const [selectedId, setSelectedId] = useState<string | null>(() => initialItems?.[0]?.id ?? demoItems[0]?.id ?? null)
  const [query, setQuery] = useState("")
  const [source, setSource] = useState<SourceFilter>("All sources")
  const [sentiment, setSentiment] = useState<SentimentFilter>("All sentiments")
  const [dateRange, setDateRange] = useState<DateRange>("Any time")
  const [reviewStatus, setReviewStatus] = useState<ReviewFilter>("All items")
  const [sortMode, setSortMode] = useState<SortMode>("Newest")
  const [demoState, setDemoState] = useState<DemoState>("ready")
  const [detailCollapsed, setDetailCollapsed] = useState(false)
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const [newItemIds, setNewItemIds] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const itemButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const workspaceRef = useRef<HTMLDivElement>(null)
  const enabledFilters = { source: true, sentiment: true, dateRange: true, reviewStatus: true, sort: true, ...options.enabledFilters }
  const labels = options.reviewLabels ?? { reviewed: "Reviewed", unreviewed: "Unreviewed" }
  const actions = { review: true, bookmark: true, tags: true, copy: true, original: true, ...options.actions }
  const availableSources = options.sourceOptions ?? sourceOptions
  const availableSentiments = options.sentimentOptions ?? ["Positive", "Neutral", "Negative"]
  const renderContent = options.renderContent ?? ((item, mode) => <DefaultContent item={item} mode={mode} />)

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const dateReference = items.reduce((latest, item) => Math.max(latest, Date.parse(item.publishedAt) || 0), DEMO_REFERENCE_TIME)
    const dateBoundary = dateRange === "Past 24 hours" ? dateReference - DAY : dateRange === "Past 7 days" ? dateReference - 7 * DAY : dateRange === "Past 30 days" ? dateReference - 30 * DAY : null
    return items.filter((item) => {
      const matchesQuery = !normalizedQuery || [item.author, item.handle, item.content, item.platform, ...item.tags].some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
      const matchesSource = source === "All sources" || item.platform === source
      const matchesSentiment = sentiment === "All sentiments" || item.sentiment === sentiment
      const matchesDate = dateBoundary === null || new Date(item.publishedAt).getTime() >= dateBoundary
      const matchesReview = reviewStatus === "All items" || (reviewStatus === "Reviewed" ? item.reviewed : !item.reviewed)
      return matchesQuery && matchesSource && matchesSentiment && matchesDate && matchesReview
    }).sort((left, right) => {
      if (sortMode === "Oldest") return new Date(left.publishedAt).getTime() - new Date(right.publishedAt).getTime()
      if (sortMode === "Highest engagement") return (right.engagement.likes + right.engagement.comments + right.engagement.shares) - (left.engagement.likes + left.engagement.comments + left.engagement.shares)
      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
    })
  }, [dateRange, items, query, reviewStatus, sentiment, sortMode, source])
  const selectedItem = items.find((item) => item.id === selectedId)
  const visibleItems = filteredItems.slice(0, visibleCount)
  const newMentionsHidden = newItemIds.some((id) => !visibleItems.some((item) => item.id === id))
  const unreviewedCount = items.filter((item) => !item.reviewed).length

  function resetFilters() {
    setQuery("")
    setSource("All sources")
    setSentiment("All sentiments")
    setDateRange("Any time")
    setReviewStatus("All items")
    setSortMode("Newest")
    setVisibleCount(6)
  }

  function updateItem(id: string, update: (item: MonitoringFeedItem) => MonitoringFeedItem) {
    setItems((current) => current.map((item) => item.id === id ? update(item) : item))
  }

  function onSelectItem(item: MonitoringFeedItem) {
    setSelectedId(item.id)
    const workspaceWidth = workspaceRef.current?.getBoundingClientRect().width ?? window.innerWidth
    if (workspaceWidth < 1024) setMobileDetailsOpen(true)
  }

  function toggleReview(item: MonitoringFeedItem) {
    updateItem(item.id, (current) => ({ ...current, reviewed: !current.reviewed }))
  }

  function toggleBookmark(item: MonitoringFeedItem) {
    updateItem(item.id, (current) => ({ ...current, bookmarked: !current.bookmarked }))
  }

  function addTag(item: MonitoringFeedItem, tag: string) {
    updateItem(item.id, (current) => ({ ...current, tags: current.tags.includes(tag) ? current.tags : [...current.tags, tag] }))
  }

  function removeTag(item: MonitoringFeedItem, tag: string) {
    updateItem(item.id, (current) => ({ ...current, tags: current.tags.filter((currentTag) => currentTag !== tag) }))
  }

  async function copyContent(item: MonitoringFeedItem) {
    try {
      await navigator.clipboard.writeText(item.content)
      toast.success("Content copied")
    } catch {
      toast.error("Could not copy content", { description: "Clipboard access is unavailable in this browser." })
    }
  }

  function simulateNewMention() {
    setDemoState("ready")
    const mention: MonitoringFeedItem = {
      id: `mention-demo-${Date.now()}`,
      author: "Riley Morgan",
      handle: "@rileymorgan",
      platform: "Instagram",
      publishedAt: new Date().toISOString(),
      content: "Stopped by the Northstar tasting room today. The seasonal pour-over was a lovely surprise.",
      contentType: "Post",
      originalUrl: "https://example.com/demo/social-post/new-northstar-mention",
      sentiment: "Positive",
      engagement: { likes: 12, comments: 2, shares: 1 },
      tags: ["Brand love"],
      reviewed: false,
      bookmarked: false,
    }
    setItems((current) => [mention, ...current])
    setNewItemIds((current) => [mention.id, ...current])
    setVisibleCount((current) => Math.max(6, current))
  }

  function refreshFeed() {
    setItems((current) => [...current])
    setIsRefreshing(true)
    window.setTimeout(() => setIsRefreshing(false), 450)
  }

  function handleItemKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentItem: MonitoringFeedItem) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    event.preventDefault()
    const currentIndex = visibleItems.findIndex((item) => item.id === currentItem.id)
    const nextIndex = event.key === "ArrowDown" ? Math.min(currentIndex + 1, visibleItems.length - 1) : Math.max(currentIndex - 1, 0)
    const nextItem = visibleItems[nextIndex]
    if (nextItem) {
      onSelectItem(nextItem)
      itemButtonRefs.current.get(nextItem.id)?.focus()
    }
  }

  const detailProps = {
    item: selectedItem,
    options,
    labels,
    actions,
    onToggleReview: () => selectedItem && toggleReview(selectedItem),
    onToggleBookmark: () => selectedItem && toggleBookmark(selectedItem),
    onRemoveTag: (tag: string) => selectedItem && removeTag(selectedItem, tag),
    onAddTag: (tag: string) => selectedItem && addTag(selectedItem, tag),
    onCopy: () => selectedItem && void copyContent(selectedItem),
  }

  return <div ref={workspaceRef} className="flex h-[min(80dvh,800px)] min-h-[600px] w-full min-w-0 flex-col overflow-hidden rounded-lg border bg-background text-foreground @5xl:min-h-[620px]">
    <header className="flex shrink-0 flex-col gap-2 border-b px-3 py-3 @2xl:flex-row @2xl:items-center @2xl:justify-between sm:px-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2"><h2 className="font-heading text-sm font-semibold">{options.title ?? "Social Listening"}</h2><Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">Demo data</Badge></div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{options.description ?? `${items.length} mentions · ${unreviewedCount} unreviewed · local demonstration only`}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {showPreviewStates && <Select value={demoState} onValueChange={(value) => setDemoState(value as DemoState)}>
          <SelectTrigger aria-label="Choose preview state" className="h-7 w-auto min-w-28 text-[11px]"><SelectValue /></SelectTrigger>
          <SelectContent position="popper"><SelectGroup><SelectItem value="ready">Default feed</SelectItem><SelectItem value="loading">Loading</SelectItem><SelectItem value="unavailable">Data unavailable</SelectItem><SelectItem value="empty">Empty feed</SelectItem></SelectGroup></SelectContent>
        </Select>}
        <Button type="button" size="sm" variant="outline" onClick={simulateNewMention}><SparklesIcon data-icon="inline-start" />Simulate New Mention</Button>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Refresh feed" disabled={isRefreshing} onClick={refreshFeed}><RefreshCwIcon aria-hidden="true" className={isRefreshing ? "animate-spin" : undefined} /></Button>
      </div>
    </header>

    <div className="flex min-h-0 flex-1">
      <section aria-label="Monitoring feed" className={`flex min-h-0 min-w-0 flex-col ${detailCollapsed ? "flex-1" : "w-full @5xl:w-[60%] @5xl:flex-none"}`}>
        <div className="flex shrink-0 flex-col gap-2 border-b px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search content or author" placeholder="Search content or author" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(6) }} className="h-8 pl-8 text-xs" />
            </div>
            <span aria-live="polite" className="shrink-0 text-[11px] text-muted-foreground">{filteredItems.length} results</span>
            <Button type="button" variant="ghost" size="icon-sm" className="hidden @5xl:inline-flex" aria-label={detailCollapsed ? "Expand detail panel" : "Collapse detail panel"} aria-pressed={detailCollapsed} onClick={() => setDetailCollapsed((collapsed) => !collapsed)}>{detailCollapsed ? <PanelRightOpenIcon aria-hidden="true" /> : <PanelRightCloseIcon aria-hidden="true" />}</Button>
          </div>
          <div className="grid grid-cols-2 gap-2 @2xl:flex @2xl:flex-wrap">
            {enabledFilters.source && <FilterField label="Source"><SelectFilter label="Filter by source" value={source} options={["All sources", ...availableSources]} onValueChange={(value) => { setSource(value as SourceFilter); setVisibleCount(6) }} /></FilterField>}
            {enabledFilters.sentiment && <FilterField label="Sentiment"><SelectFilter label="Filter by sentiment" value={sentiment} options={["All sentiments", ...availableSentiments]} onValueChange={(value) => { setSentiment(value as SentimentFilter); setVisibleCount(6) }} /></FilterField>}
            {enabledFilters.dateRange && <FilterField label="Date range"><SelectFilter label="Filter by date range" value={dateRange} options={["Any time", "Past 24 hours", "Past 7 days", "Past 30 days"]} onValueChange={(value) => { setDateRange(value as DateRange); setVisibleCount(6) }} /></FilterField>}
            {enabledFilters.reviewStatus && <FilterField label="Review status"><SelectFilter label="Filter by review status" value={reviewStatus} options={["All items", "Unreviewed", "Reviewed"]} onValueChange={(value) => { setReviewStatus(value as ReviewFilter); setVisibleCount(6) }} /></FilterField>}
            {enabledFilters.sort && <FilterField label="Sort"><SelectFilter label="Sort feed" value={sortMode} options={["Newest", "Oldest", "Highest engagement"]} onValueChange={(value) => { setSortMode(value as SortMode); setVisibleCount(6) }} /></FilterField>}
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters} className="self-end text-muted-foreground"><FilterXIcon data-icon="inline-start" />Reset filters</Button>
          </div>
        </div>

        {newMentionsHidden && <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-info-soft px-3 py-2 text-info sm:px-4">
          <p className="text-xs font-medium">New mentions available outside this view.</p>
          <Button type="button" size="xs" variant="outline" className="border-info/30 bg-background text-foreground" onClick={() => { resetFilters(); setDemoState("ready") }}>Show new mentions</Button>
        </div>}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {demoState === "loading" ? <div role="status" aria-label="Loading mentions" className="flex flex-col gap-2 p-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex flex-col gap-2 rounded-md border p-3"><div className="flex items-center gap-2"><span className="size-8 rounded-full bg-muted" /><span className="h-3 w-32 rounded bg-muted" /></div><span className="h-3 w-full rounded bg-muted" /><span className="h-3 w-3/4 rounded bg-muted" /></div>)}</div> : demoState === "unavailable" ? <div role="alert" className="flex min-h-56 flex-col items-center justify-center gap-2 px-5 text-center"><div className="flex size-10 items-center justify-center rounded-full bg-destructive-soft text-destructive"><RefreshCwIcon aria-hidden="true" className="size-4" /></div><p className="text-sm font-medium">Feed data is unavailable</p><p className="max-w-xs text-xs leading-relaxed text-muted-foreground">This preview state represents a temporary data issue. No external service is connected.</p><Button type="button" variant="outline" size="sm" onClick={() => setDemoState("ready")}>Retry demo feed</Button></div> : demoState === "empty" ? <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-5 text-center"><div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><SearchIcon aria-hidden="true" className="size-4" /></div><p className="text-sm font-medium">No mentions yet</p><p className="max-w-xs text-xs leading-relaxed text-muted-foreground">New items will appear here when available. Add a fictional mention to explore the empty feed state.</p><Button type="button" size="sm" variant="outline" onClick={simulateNewMention}>Simulate New Mention</Button></div> : items.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-5 text-center"><div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><SearchIcon aria-hidden="true" className="size-4" /></div><p className="text-sm font-medium">Your feed is clear</p><p className="max-w-xs text-xs leading-relaxed text-muted-foreground">There are no items in this feed yet. Add a fictional mention to see how the workspace works.</p><Button type="button" variant="outline" size="sm" onClick={simulateNewMention}>Simulate New Mention</Button></div> : visibleItems.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-5 text-center"><div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><SearchIcon aria-hidden="true" className="size-4" /></div><p className="text-sm font-medium">No mentions match these filters</p><p className="max-w-xs text-xs leading-relaxed text-muted-foreground">Try a different search or reset the source, sentiment, date, and review filters.</p><Button type="button" variant="outline" size="sm" onClick={resetFilters}>Reset filters</Button></div> : <ul aria-label="Mentions, use up and down arrow keys to move between items" className="flex flex-col gap-1 p-2">
            {visibleItems.map((item) => <FeedItemCard
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              labels={labels}
              actions={actions}
              renderContent={renderContent}
              onSelect={() => onSelectItem(item)}
              onToggleReview={() => toggleReview(item)}
              onToggleBookmark={() => toggleBookmark(item)}
              onCopy={() => void copyContent(item)}
              buttonRef={(button) => { if (button) itemButtonRefs.current.set(item.id, button); else itemButtonRefs.current.delete(item.id) }}
              onKeyDown={(event) => handleItemKeyDown(event, item)}
            />)}
          </ul>}
          {demoState === "ready" && visibleItems.length > 0 && visibleCount < filteredItems.length && <div className="flex justify-center border-t px-3 py-3"><Button type="button" variant="outline" size="sm" onClick={() => setVisibleCount((count) => count + 6)}>Load more mentions<ChevronDownIcon data-icon="inline-end" /></Button></div>}
        </div>
      </section>

      {!detailCollapsed && <div className="hidden min-h-0 min-w-0 flex-1 border-l @5xl:flex @5xl:w-[40%] @5xl:flex-none"><DetailPanel {...detailProps} />
      </div>}
      {detailCollapsed && <div className="hidden @5xl:flex @5xl:w-12 @5xl:shrink-0 @5xl:items-start @5xl:justify-center @5xl:border-l @5xl:pt-3"><Button type="button" variant="ghost" size="icon-sm" aria-label="Expand detail panel" onClick={() => setDetailCollapsed(false)}><PanelRightOpenIcon aria-hidden="true" /></Button></div>}
      <div className="@5xl:hidden"><Sheet open={mobileDetailsOpen} onOpenChange={setMobileDetailsOpen}><SheetContent side="right" showCloseButton={false} className="w-[min(92vw,28rem)] max-w-[min(92vw,28rem)] gap-0 p-0"><SheetHeader className="sr-only"><SheetTitle>Selected mention details</SheetTitle><SheetDescription>Details for the selected monitoring feed item.</SheetDescription></SheetHeader><DetailPanel {...detailProps} onClose={() => setMobileDetailsOpen(false)} /></SheetContent></Sheet></div>
    </div>
  </div>
}
