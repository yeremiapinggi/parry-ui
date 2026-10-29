import type { Metadata } from "next"
import Link from "next/link"

import { AnalyticsDashboardPreview } from "@/components/analytics-dashboard-preview"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Analytics Dashboard · Templates · Parry UI",
  description: "A data-driven dashboard for monitoring KPIs, trends, and performance breakdowns.",
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
  { title: "Global Date Controls", text: "One shared date range drives every summary, visualization, and table row. The optional comparison uses an equal-length immediately preceding period." },
  { title: "KPI Summary", text: "Four outcome-oriented metrics lead the page. Help tooltips explain definitions; comparison arrows distinguish direction from whether that direction is beneficial." },
  { title: "Activity Trend", text: "The full-width line chart receives the strongest visual emphasis. Daily ranges show daily points; longer ranges use weekly buckets. Its legend can hide either series." },
  { title: "Channel and Outcome Views", text: "A horizontal bar chart compares channels. The donut shows completed versus incomplete activity, while the ranked list exposes the leading business segments." },
  { title: "Performance Breakdown", text: "A compact, keyboard-sortable table gives channel activity, share, completion rate, and weighted response time for closer comparison." },
  { title: "Accessible Inspection", text: "Chart tooltips expose dates and values on pointer hover and keyboard focus. Labels, focus rings, and semantic table headers preserve context without color alone." },
]

const interactionStates = [
  ["Default · Last 30 Days", "A deterministic demo dataset drives all metrics and charts from the same daily records."],
  ["Filtered · 7 / 90 Days", "Changing the date range recalculates KPI totals, comparison values, trend buckets, charts, segment ranking, and table rows together."],
  ["Custom Range", "Choose valid start and end dates. If the start follows the end, the dashboard announces a validation error; dates outside the available dataset produce a no-results message."],
  ["Comparison Enabled", "The KPI cards show percentage change against the immediately preceding period and the trend chart adds a separately toggleable comparison series."],
  ["Loading", "Layout-preserving skeletons show the dashboard structure while data is pending. The documentation preview can switch to this explicit demo state."],
  ["Empty / No Results", "An empty-data explanation is distinct from a valid range with no matching demo records, with a reset action for the latter."],
]

const doGuidelines = [
  "Choose a small set of KPIs that map to product or service outcomes, not just available fields.",
  "Define each metric, unit, aggregation window, and whether an increase is favorable before showing comparisons.",
  "Keep global filters synchronized across all dependent content and use the same underlying data definitions.",
  "Use a trend chart for change over time, bars for category comparison, and a donut only for a small part-to-whole breakdown.",
  "Show a useful explanation for incomplete or empty datasets, and preserve the dashboard layout while loading.",
  "Keep chart labels readable on narrow screens, use keyboard-accessible legends, and retain a sortable table for precision.",
]

const dontGuidelines = [
  "Do not mix unrelated metrics or use different date windows across neighboring cards without saying so.",
  "Do not imply that an increase is always positive; response time and other inverse metrics need outcome-aware comparisons.",
  "Do not use more than a few slices in a donut or rely on color alone to distinguish chart series.",
  "Do not fill a missing-data state with fabricated zeros or random values that imply real activity.",
  "Do not make tooltips the only way to inspect a value; provide readable axes, labels, and a supporting table.",
]

export default function AnalyticsDashboardPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Dashboards</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Analytics Dashboard</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A data-driven dashboard for monitoring KPIs, trends, and performance breakdowns. A reusable enterprise SaaS pattern for CRM, contact center, social listening, and AI agent analytics.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Analytics Dashboard prioritizes a small KPI summary, then gives the activity trend the most space, followed by category-level context and a sortable performance table. Its fictional 180-day time series is deterministic: totals, unique users, response times, channel shares, completion outcomes, and segments all derive from the same daily records.
          </p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">A consistent analytics surface</CardTitle>
              <CardDescription>Designed for enterprise SaaS teams that need to monitor performance without separating the headline from its context.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Prioritize outcomes</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Use a handful of decision-relevant KPIs. Define what is counted, the aggregation window, and whether increases or decreases are favorable.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Keep context global</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">A shared date filter and optional equal-length comparison keep summaries, charts, and detail rows aligned.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Offer precise detail</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Charts help people see shape and distribution; the supporting table provides exact values and sortable comparisons.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Change the date window, inspect the accessible chart tooltips, compare periods, sort the breakdown, or switch the demo state above the dashboard.</p>
          </div>
          <div className="rounded-lg border bg-background p-3 sm:p-5">
            <AnalyticsDashboardPreview />
          </div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomy.map((item) => (
              <Card key={item.title} className="gap-2 py-4">
                <CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">The template demonstrates synchronized date filters, optional previous-period comparison, tooltips and series visibility, a horizontal category comparison, a two-outcome distribution, ranked segments, and sortable channel performance.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>All interactions operate on local, repeatable demo data.</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["7 / 30 / 90 day ranges", "Custom date range", "Previous-period comparison", "Daily and weekly trend", "Keyboard-accessible chart inspection", "Toggleable trend series", "Sortable breakdown", "Reset to Last 30 Days", "Loading and empty states"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <p className="text-sm leading-relaxed text-muted-foreground">The default Last 30 Days view is daily. The 90-day and longer custom views use weekly buckets to preserve chart legibility. All comparison buckets align to the corresponding dates in the preceding equal-length period.</p>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {interactionStates.map(([title, text]) => (
              <Card key={title} className="gap-2 py-4">
                <CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Use this pattern when users need to scan performance across time and compare a few meaningful dimensions. It is suitable for CRM activity, contact-center operations, social listening, and AI agent analytics when each product supplies its own metrics and definitions.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader>
              <CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader>
              <CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Responsive and incomplete data</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-muted-foreground">Keep KPI cards to four columns on wide screens, two on tablet, and one on mobile. Stack charts on narrow screens, avoid clipping date controls, and keep units and legends visible. For incomplete datasets, make missing values explicit and avoid interpreting absent data as zero. For a valid date range outside the available data, show a no-results state with a direct reset action.</p></CardContent>
          </Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The dashboard is composed from Parry UI primitives, the existing shadcn chart wrapper with Recharts, and a small reusable data aggregation module.</p>
          <div className="flex flex-wrap gap-2">
            {["badge", "button", "card", "chart", "input", "label", "select", "skeleton", "switch", "table", "tooltip"].map((name) => (
              <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>
            ))}
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block">
        <div className="sticky top-24"><DocsToc items={toc} /></div>
      </aside>
    </div>
  )
}
