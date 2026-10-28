import type { Metadata } from "next"
import Link from "next/link"

import { OperationalDashboardPreview } from "@/components/operational-dashboard-preview"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Operational Dashboard · Templates · Parry UI",
  description: "Monitor operational workloads, service health, SLA risks, and issues requiring attention.",
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
  { title: "Global Filters and Refresh", text: "Channel and work status filters define one shared demo view. Manual refresh advances to the next deterministic snapshot, displays a refreshing state, and reports when that snapshot is updated." },
  { title: "Operational KPI Cards", text: "Active work, pending queue, SLA-at-risk items, and available agent coverage are derived from the same filtered work-item records. Selecting a card focuses the relevant work." },
  { title: "Workload and Queue", text: "A horizontal chart compares work by channel, and the queue breakdown shows pending, active, and completed items. Clicking either view filters the records." },
  { title: "Service Health and Attention", text: "Channel health uses explicit connected, degraded, and disconnected states. The attention queue prioritizes warning and critical issues with acknowledgement, resolution, and inspection actions." },
  { title: "Sortable Work Items", text: "The compact table supports search and sorting by ID, channel, status, and SLA time. Selecting a work item opens its inspection drawer with requester, assignment, and related alert context." },
  { title: "Issue Inspection Drawer", text: "Issue details explain what happened, when it was detected, the related work item, and a suggested demo action. Acknowledging an issue updates its state; resolving it removes it from attention and completes its linked demo item." },
]

const interactionStates = [
  ["Default", "A deterministic fictional snapshot supplies the operational metrics, chart, queue, channel health, attention items, and work-item table."],
  ["Filtered", "Channel and status filters update the work-item list, KPI values, queue distribution, and workload chart together. Chart bars, queue rows, and KPI cards also focus the corresponding records."],
  ["Refreshing / Updated", "Manual refresh briefly displays a refreshing state, advances to a predefined next snapshot, resets issue actions for that snapshot, and shows an updated timestamp. Nothing refreshes automatically."],
  ["Acknowledged / Resolved", "Acknowledgement changes the issue state and reduces the unacknowledged count. Resolution removes an issue from the active attention queue and completes its linked work item."],
  ["Empty / No Matches", "The documentation preview can switch to an empty snapshot or no-matching-results state. The dashboard keeps its structure and explains the difference between no records and a search with no matches."],
  ["Warning / Critical", "SLA warnings and critical items use semantic status labels and colors. Severity remains labeled in text and is never communicated by color alone."],
  ["Detail Inspection", "Work-item rows and attention details open an accessible side drawer. Closing the drawer returns focus to the dashboard and preserves the current filters."],
]

const doGuidelines = [
  "Use operational dashboards for decisions that need attention now: workload, service health, SLA windows, and active issues.",
  "Keep global filters synchronized and derive every displayed total from the same source records.",
  "Define what qualifies as at risk, critical, acknowledged, and resolved, and show those definitions in the interface.",
  "Make the next action visible in the issue queue and keep details one interaction away.",
  "Offer a sortable, searchable table so users can move from a workload summary to a precise record.",
  "Label sample data clearly and make refresh behavior explicit when it does not contact a live system.",
]

const dontGuidelines = [
  "Do not imply that a local demo snapshot reflects a connected service or real-time telemetry.",
  "Do not mix historical trend analysis into the operational view when the goal is immediate triage.",
  "Do not hide resolved issues in a way that obscures why the workload changed; make resolution behavior clear.",
  "Do not make charts the only way to filter or understand records; provide labels, controls, and a table.",
  "Do not use severity color without a readable status label or let refresh happen unexpectedly.",
]

const componentNames = ["badge", "button", "card", "chart", "dialog", "input", "select", "table", "tooltip"]

export default function OperationalDashboardPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Dashboard</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Operational Dashboard</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">Monitor operational workloads, service health, SLA risks, and issues requiring attention.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Operational Dashboard is designed for the current state of work: what is waiting, what is being handled, which service channels need attention, and which deadlines are at risk. Its fictional dataset is deterministic, and every metric, chart, alert, and table count is derived from shared work-item records.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Choose the dashboard for the question</CardTitle><CardDescription>Analytics explains how performance changes; operations helps decide what to do next.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-lg border p-4"><Badge variant="secondary" className="w-fit">Analytics Dashboard</Badge><h3 className="text-sm font-semibold">Historical trends and comparisons</h3><p className="text-sm leading-relaxed text-muted-foreground">Use period-based KPIs, activity trends, and outcome breakdowns to understand performance over time.</p></div>
              <div className="flex flex-col gap-2 rounded-lg border p-4"><Badge variant="secondary" className="w-fit">Operational Dashboard</Badge><h3 className="text-sm font-semibold">Current workload and actionable monitoring</h3><p className="text-sm leading-relaxed text-muted-foreground">Use queue state, current SLA risks, service health, alerts, and record inspection to prioritize immediate work.</p></div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Filter by channel or status, click workload and queue segments, sort the table, refresh the deterministic snapshot, and inspect an issue or work item.</p></div>
          <div className="rounded-lg border bg-background p-3 sm:p-5"><OperationalDashboardPreview /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">The page combines synchronized operational filters, workload and queue views, service states, prioritized issues, and a sortable inspection table. It intentionally focuses on actionable current work rather than trend reporting.</p>
          <Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>All actions update local demo state only; there is no backend connection.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Channel and status filters", "Clickable KPI focus", "Interactive workload chart", "Queue status breakdown", "Connected / degraded / disconnected health", "Acknowledge and resolve issues", "Issue and work-item drawers", "Sortable searchable table", "Manual deterministic refresh", "Empty and no-match states"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{interactionStates.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Use this pattern for a team that needs a shared picture of current work and an explicit route from a warning to a next action. Replace the fictional records, service checks, and issue actions with domain-specific data and permissions when adapting the template.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Responsive behavior</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">KPI cards collapse to one or two columns on narrow screens. Workload and queue views stack, as do service health and attention items. The table retains horizontal scrolling for detailed columns, while inspection drawers use the available viewport width.</p></CardContent></Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The dashboard uses Parry UI primitives, the existing shadcn chart wrapper with Recharts, and a small deterministic demo-data module.</p>
          <div className="flex flex-wrap gap-2">{componentNames.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link>, compare the <Link href="/templates/analytics-dashboard" className="font-medium text-link hover:underline">Analytics Dashboard</Link>, or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
