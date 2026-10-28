import type { Metadata } from "next"
import Link from "next/link"

import { DocsToc } from "@/components/docs-nav"
import { MonitoringFeed } from "@/components/monitoring-feed"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Monitoring Feed · Templates · Parry UI",
  description: "A content monitoring workspace for tracking incoming items, reviewing details, and managing follow-up actions.",
}

const toc = [
  { id: "overview", label: "Overview" },
  { id: "live-preview", label: "Live Preview" },
  { id: "anatomy", label: "Anatomy" },
  { id: "features-variants", label: "Features & Variants" },
  { id: "interaction-states", label: "Interaction States" },
  { id: "usage-guidelines", label: "Usage Guidelines" },
  { id: "components-used", label: "Components Used" },
]

const sectionHeading = "scroll-mt-24 font-heading text-2xl font-semibold tracking-tight"

const anatomy = [
  { title: "Feed Header", text: "Names the monitoring context, identifies demonstration data, and keeps refresh and simulated-item controls visible without suggesting a live connection." },
  { title: "Combined Filter Toolbar", text: "Search, source, sentiment, publication date, review status, and sort controls operate on one shared item collection." },
  { title: "Compact Content Items", text: "Each row gives the author, platform, timestamp, a short content preview, sentiment, engagement, tags, and review state enough hierarchy for quick scanning." },
  { title: "Selection and Keyboard Navigation", text: "Selecting a row highlights it and updates the detail panel. Up and Down Arrow keys move between visible items without resetting the feed scroll position." },
  { title: "Detail Panel", text: "The independently collapsible desktop panel groups the complete post, optional media, engagement, organization, and follow-up actions. On small screens it opens as a side drawer." },
  { title: "Local State and Feedback", text: "Review, bookmark, tag, filter, sort, and simulated-mention changes update the same local dataset and synchronize between the feed and detail panel." },
]

const features = [
  "Combined search and filters",
  "Newest, oldest, and engagement sorting",
  "Date-range presets",
  "Review and bookmark management",
  "Tag assignment and removal",
  "Copy content and open original link",
  "Load more and keyboard navigation",
  "Simulate New Mention",
  "Non-blocking hidden-mention notice",
  "Collapsible detail panel and mobile drawer",
  "Loading, unavailable, empty, and no-results states",
  "Local demonstration data only",
]

const states = [
  ["Default Feed", "A chronological social listening sample with multiple sources, sentiments, engagement levels, review states, tags, and optional media."],
  ["Item Selected", "The current row receives a visible selection treatment and its complete information appears in the detail panel."],
  ["Detail Panel Collapsed", "Hide the desktop detail area to give the feed more room; expand it again without changing the selection."],
  ["Unreviewed Items", "Filter to items that need follow-up. Marking an item reviewed updates its feed indicator and the shared unreviewed count."],
  ["Filtered Results and No Search Results", "Combine any filters with keyword search. An empty match set offers a reset action instead of showing misleading data."],
  ["New Mentions Available", "A simulated item that falls outside the current filters or visible page produces a non-blocking notice. Choosing Show new mentions is an explicit opt-in to reset filters."],
  ["Loading", "The loading preview keeps the feed layout while the rows are represented by skeletons."],
  ["Data Unavailable", "An unavailable-state message explains the demo boundary and offers a retry that restores the local feed."],
  ["Empty Feed", "A feed with no records offers a clear action to add a fictional mention. A separate item may also have no media or original URL."],
]

const reuseExamples = [
  { title: "Ripple10", text: "Social Listening Feed: public posts, author/source details, sentiment, engagement, tags, and review actions." },
  { title: "Sociomile", text: "Conversation Activity Feed: customer conversation events, channel metadata, resolution status, and assignment actions." },
  { title: "Agentics", text: "AI Execution Activity Feed: run events, agent and tool metadata, execution outcomes, and replay or inspection actions." },
  { title: "Cognivo", text: "Customer Activity Feed: customer events, lifecycle context, account metadata, and follow-up actions." },
]

const doGuidelines = [
  "Keep the stream chronological unless the user explicitly changes sort order; show the active sort in the toolbar.",
  "Use the same filtered collection for the visible count, empty state, pagination, and new-mention notice.",
  "Keep content excerpts short in the feed and show the complete content in the detail panel.",
  "Use text labels as well as subtle semantic color for sentiment and review state.",
  "Preserve selection and scroll position when the user opens another item or a simulated item arrives.",
  "Treat media and original URLs as optional fields and explain when either is unavailable.",
]

const dontGuidelines = [
  "Do not imply streaming, alerts, or a real platform connection in a local demonstration.",
  "Do not duplicate full post content in every feed row or add dashboard KPI cards above the stream.",
  "Do not use color alone to communicate sentiment, review status, or selection.",
  "Do not silently remove active filters when a new item arrives; let users decide whether to change their view.",
  "Do not use a Monitoring Feed for routine CRUD or metric-based rank comparison; choose the dedicated template instead.",
]

const components = ["avatar", "badge", "button", "dropdown-menu", "input", "select", "separator", "sheet", "sonner"]

const usageExample = `import { MonitoringFeed, type MonitoringFeedItem } from "@/components/monitoring-feed"

const items: MonitoringFeedItem[] = [
  {
    id: "event-1042",
    author: "Ava Laurent",
    handle: "@avalovescoffee",
    platform: "Instagram",
    publishedAt: "2026-10-28T09:40:00.000Z",
    content: "A sample incoming item",
    contentType: "Post",
    sentiment: "Positive",
    engagement: { likes: 42, comments: 5, shares: 3 },
    tags: ["Product feedback"],
    reviewed: false,
    bookmarked: false,
    campaign: "Autumn seasonal launch",
  },
]

<MonitoringFeed
  initialItems={items}
  options={{
    title: "Activity Feed",
    enabledFilters: { source: false },
    metadataFields: [{ label: "Campaign", value: (item) => String(item.campaign ?? "Unassigned") }],
    detailSections: [{ title: "Follow-up", content: () => <p>Owner and next step</p> }],
  }}
/>`

export default function MonitoringFeedPage() {
  return <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
    <article className="flex min-w-0 flex-col gap-12 py-10">
      <header className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Monitoring</span></div>
        <Badge variant="secondary">Page template</Badge>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Monitoring Feed</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A content monitoring workspace for tracking incoming items, reviewing details, and managing follow-up actions.</p>
      </header>

      <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
        <p className="leading-relaxed text-muted-foreground">Monitoring Feed is a compact workspace for incoming content that needs timely inspection and follow-up. A chronological stream keeps authors, sources, short excerpts, sentiment, engagement, tags, and review status scannable; selecting an item opens its full context alongside the feed.</p>
        <p className="leading-relaxed text-muted-foreground">The included social listening dataset is fictional and runs entirely in local component state. Search, all filters, counts, sorting, review changes, bookmarks, tags, pagination, and simulated mentions read from the same dataset. No APIs, persistence, streaming, or alert engine are connected.</p>
        <Card>
          <CardHeader><CardTitle className="text-base">Choose the right list pattern</CardTitle><CardDescription>These templates solve different jobs, even when they share filtering and selection controls.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Monitoring Feed</h3><p className="text-sm leading-relaxed text-muted-foreground">Use for time-ordered incoming content and events that need review, tagging, bookmarking, or follow-up. The content itself is the primary record.</p></div>
            <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Data Management List</h3><p className="text-sm leading-relaxed text-muted-foreground">Use for routine creation and maintenance of structured records, with CRUD actions, stable table columns, and conventional pagination.</p><Link href="/templates/data-management-list" className="text-sm font-medium text-link hover:underline">View Data Management List</Link></div>
            <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Conversation Table</h3><p className="text-sm leading-relaxed text-muted-foreground">Use for queue-level conversation operations such as assignment, status, priority, and workload management. A conversation workspace is optimized for replying within one thread.</p><Link href="/templates/conversation-table" className="text-sm font-medium text-link hover:underline">View Conversation Table</Link></div>
            <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Ranking &amp; Analytics Table</h3><p className="text-sm leading-relaxed text-muted-foreground">Use when entities must be compared and ordered by metrics, rank movement, and reporting-period trends rather than reviewed one incoming item at a time.</p><Link href="/templates/ranking-analytics-table" className="text-sm font-medium text-link hover:underline">View Ranking &amp; Analytics Table</Link></div>
          </CardContent>
        </Card>
      </section>

      <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
        <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Search and combine filters, select an item, update review state and tags, collapse the detail panel, or simulate a new mention. Preview-state controls expose loading, unavailable, and empty examples.</p></div>
        <MonitoringFeed />
      </section>

      <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
        <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
        <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
      </section>

      <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
        <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
        <p className="leading-relaxed text-muted-foreground">The interaction surface is product-neutral. Configure its item shape, content rendering, metadata, enabled filters, status labels, detail sections, tag vocabulary, and available actions without creating another template.</p>
        <Card><CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>All actions update the shared local dataset.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
        <div className="grid gap-3 sm:grid-cols-2">{reuseExamples.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        <Card><CardHeader><CardTitle className="text-base">Configurable component API</CardTitle><CardDescription>Start with the shared item schema, then add renderer and detail metadata as needed.</CardDescription></CardHeader><CardContent><pre className="overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground"><code>{usageExample}</code></pre></CardContent></Card>
      </section>

      <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
        <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
        <p className="leading-relaxed text-muted-foreground">Use the Preview state control in the feed header to inspect states that are not naturally visible in the default sample.</p>
        <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
      </section>

      <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
        <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
        <p className="leading-relaxed text-muted-foreground">Keep the stream focused on the incoming item and its next action. Use the detail panel for deeper context instead of adding a separate dashboard layer above the feed.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">On desktop, keep the feed near 60% width and detail near 40%. On small screens, let the feed use the full width and open item details in a side drawer. Retain visible focus rings and ensure the selection remains understandable without color.</p>
      </section>

      <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
        <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
        <p className="leading-relaxed text-muted-foreground">The workspace composes existing Parry UI primitives for selection, actions, filtering, and responsive detail. The reusable feed and item types live in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">components/monitoring-feed.tsx</code>.</p>
        <div className="flex flex-wrap gap-2">{components.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
        <Separator />
        <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
      </section>
    </article>
    <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
  </div>
}
