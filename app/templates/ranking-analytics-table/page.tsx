import type { Metadata } from "next"
import Link from "next/link"

import { DocsToc } from "@/components/docs-nav"
import { RankingAnalyticsTable } from "@/components/ranking-analytics-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Ranking & Analytics Table · Templates · Parry UI",
  description: "A ranked analytics table for comparing entities, tracking performance changes, and exploring metric details.",
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
  { title: "Ranking Header", text: "Names the ranked cohort, clarifies that the sample is fictional, and keeps the selected reporting period and export action visible." },
  { title: "Shared Filter Toolbar", text: "Search, period, platform, and sentiment filters operate on the same entity set. The ranking metric is separate from the manual table sort." },
  { title: "Rank and Movement", text: "Rank is recalculated from the selected metric after filters. Movement compares the current position with the previous equivalent period; ties use competition ranking and stable name ordering." },
  { title: "Metric and Sentiment Columns", text: "Right-aligned numeric values use tabular figures. Sentiment uses a compact, labeled distribution bar rather than a standalone chart." },
  { title: "Inline Trend", text: "A small sparkline summarizes the selected metric over the same reporting window without competing with the table for attention." },
  { title: "Analytics Detail Drawer", text: "Selecting a row opens identity, rank movement, metric comparisons, engagement history, and sentiment breakdown without leaving the table." },
]

const features = [
  "Metric-driven rank recalculation", "7D / 30D / 90D / custom range", "Previous equivalent period", "Search and platform filters",
  "Sentiment filter", "Rank movement indicators", "Stable tied ranks", "Independent manual sorting", "Column visibility",
  "Horizontal table scrolling", "Inline trend sparklines", "Analytics detail drawer", "Filtered CSV export", "Pagination",
]

const states = [
  ["Default ranking", "The deterministic demo starts with accounts ranked by engagement over the last 30 days."],
  ["Filtered ranking", "Search, platform, sentiment, and reporting period all filter the same account dataset before ranks are calculated."],
  ["Comparison enabled", "Each numeric table value includes its previous-period value, absolute delta, and percentage change. The detail trend can add the previous series."],
  ["Ranking movement and ties", "Movement is relative to the previous rank. Equal metric values share a competition rank (1, 1, 3) and ties resolve consistently by account name."],
  ["Empty search results", "A contextual empty state offers a reset action and does not replace unavailable data with invented zeros."],
  ["Loading and unavailable", "The preview-state selector exposes skeleton loading and an unavailable-data message with a retry action."],
  ["Exporting and detail open", "CSV export has a visible busy state. Selecting any visible row opens its analytics drawer; selecting another row replaces the drawer content."],
]

const useCases = [
  { title: "Social Media Account Ranking", text: "Compare accounts by mentions, engagement, reach, or engagement rate, with sentiment and reporting-window trends." },
  { title: "Agent Performance Ranking", text: "Rank agents on resolved conversations, customer satisfaction, response time, or quality scores. Define whether a lower metric is favorable before showing change cues." },
  { title: "Sales Representative Ranking", text: "Compare quota attainment, pipeline, revenue, or conversion rates. Keep territory and role filters synchronized with the ranked cohort." },
  { title: "Campaign Performance Ranking", text: "Compare campaigns by impressions, interactions, conversions, or cost efficiency, with previous-period movement and inline trends." },
]

const doGuidelines = [
  "Choose one primary ranking metric at a time and state it beside the rank column.",
  "Keep ranking order distinct from manual sort order; never silently recalculate rank when a user sorts another column.",
  "Use equal-length, clearly labeled periods for comparison and define the direction of favorable change for inverse metrics.",
  "Use stable tie-breaking and a documented tie policy so rank positions do not jump between renders.",
  "Keep identity and rank visible while horizontally scrolling, and expose exact values in the table even when sparklines are present.",
  "Replace the fictional dataset with one validated source and keep filters, ranks, charts, comparisons, and exports on the same query result.",
]

const dontGuidelines = [
  "Do not treat rank position as a metric or let manual sorting rewrite ranking movement.",
  "Do not compare unequal time windows or label a missing prior value as a zero change.",
  "Do not imply that an increase is favorable for every metric, such as response time or cost.",
  "Do not present this deterministic social media sample as real account analytics.",
  "Do not compress the table to fit every column on mobile; allow horizontal scrolling and preserve readable values.",
]

const components = ["badge", "button", "chart", "checkbox", "input", "label", "popover", "select", "sheet", "skeleton", "switch", "table", "toggle-group"]

export default function RankingAnalyticsTablePage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Data &amp; Tables</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Ranking &amp; Analytics Table</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A ranked analytics table for comparing entities, tracking performance changes, and exploring metric details.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Ranking &amp; Analytics Table is a compact comparison surface for deciding which entities are leading, changing position, or need closer inspection. The primary metric drives rank; shared filters determine the ranked cohort; sorting changes only the visible row order. A matching previous window provides movement context without turning the page into a separate analytics dashboard.</p>
          <p className="leading-relaxed text-muted-foreground">The social media example uses fictional, deterministic account data. Totals, sentiment counts, engagement rates, period comparisons, ranking movement, and trend lines are derived from the same daily records. No live platform data is connected.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">How it differs from neighboring table templates</CardTitle><CardDescription>Choose the pattern by the job users need to complete.</CardDescription></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Data Management List</h3><p className="text-sm leading-relaxed text-muted-foreground">Use Data Management List for routine record maintenance: create, edit, delete, and manage operational records. Ranking &amp; Analytics Table instead prioritizes metric-based ordering, period-over-period movement, and analytical inspection.</p><Link href="/templates/data-management-list" className="text-sm font-medium text-link hover:underline">View Data Management List</Link></div>
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Advanced Filterable Table</h3><p className="text-sm leading-relaxed text-muted-foreground">Use Advanced Filterable Table to build reusable queries with advanced conditions, grouping, and saved views across a large collection. Ranking &amp; Analytics Table uses a focused set of shared filters and a metric-led rank, comparison, and trend workflow.</p><Link href="/templates/advanced-filterable-table" className="text-sm font-medium text-link hover:underline">View Advanced Filterable Table</Link></div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Search, filter, change the ranking metric and period, compare results, customize columns, export CSV, or open an account detail drawer.</p></div>
          <div className="rounded-lg border bg-background p-3 sm:p-5"><RankingAnalyticsTable /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">Keep the ranked table as the primary surface. Comparison details stay within metric cells, while the right-side drawer provides the deeper trend and sentiment context.</p>
          <Card><CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>All controls operate on the same deterministic demo dataset.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
          <div className="grid gap-3 sm:grid-cols-2">{useCases.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">This pattern is most useful when people need a defensible order, a way to understand movement, and fast access to entity-level context. Keep metric definitions and comparison windows explicit.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">On small screens, retain the identity and rank columns and allow the remaining columns to scroll horizontally. Use the detail drawer for a focused, readable mobile inspection view.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI controls, the shared shadcn table and sheet primitives, and the chart wrapper with Recharts. The sample aggregation helpers remain separate from the reusable interaction surface.</p>
          <div className="flex flex-wrap gap-2">{components.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
