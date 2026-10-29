import type { Metadata } from "next"
import Link from "next/link"

import { DocsToc } from "@/components/docs-nav"
import { PipelinePerformancePreview } from "@/components/pipeline-performance-preview"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Pipeline Performance Workspace · Templates · Parry UI",
  description: "An analytical workspace for tracking pipeline conversion, stage performance, deal aging, and revenue forecasts.",
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
  { title: "Pipeline Filters", text: "Reporting period, pipeline, owner, and lead source define one shared filtered cohort. Reset restores the Cognivo Sales Pipeline and the last 30 days. Custom dates validate start and end order." },
  { title: "Compact Overview", text: "Pipeline value and forecast use the period-end snapshot. Won revenue and win rate use close events in the selected period. Each card opens its corresponding opportunity set." },
  { title: "Conversion Funnel", text: "Selectable stages show open opportunity counts and value at the period-end snapshot. Stage entry, next-stage conversion, and explicit loss are calculated from observed transitions in the selected period." },
  { title: "Stage Performance", text: "A sortable table exposes count, total and average value, average age, conversion, and drop-off. Selecting a stage synchronizes the funnel highlight and the opportunity list." },
  { title: "Aging Review", text: "The distribution shows time in the current stage at period end. A configurable 7-, 14-, or 30-day threshold opens attention candidates without labeling every older deal as a problem." },
  { title: "Forecast and Detail", text: "Expected close value and weighted forecast are grouped by month. Selecting an opportunity opens a side drawer with ownership, probability, expected close, and stage history." },
]

const states = [
  ["Default Overview", "The Cognivo Sales Pipeline starts on a 30-day window. Overview, funnel, stage table, aging, forecast, and drill-down all use one fictional opportunity dataset."],
  ["Stage Selected", "Selecting a funnel or table stage highlights that stage and filters the opportunity list. Clearing the selection leaves the global filters untouched."],
  ["Comparison Enabled", "The overview and stage funnel compare with the immediately preceding equal-length period. Stage snapshot counts remain distinct from transition-based conversion."],
  ["Bottleneck Highlighted", "The aging section compares average stage age and exposes records beyond the configured threshold as attention candidates for human review."],
  ["Filtered Opportunities", "Pipeline, owner, source, time window, stage, and KPI drill-downs act on the same data. A stage selection and filters remain when opening or closing a record drawer."],
  ["Opportunity Detail Open", "The right-side drawer shows opportunity identity, deal value, win probability, current stage, days in stage, expected close, and stage history through the selected snapshot."],
  ["No Matching Data", "A valid filter combination with no records shows an explicit no-match state and a reset action rather than invented zeros presented as results."],
  ["Loading / Data Unavailable", "The preview-state selector shows layout-preserving skeletons or an unavailable-data message with retry. Unavailable data is not represented as zero activity."],
  ["Empty Pipeline", "An explicit empty-data preview distinguishes a pipeline with no records from a filter combination that matches no opportunities."],
]

const useCases = [
  { title: "Sales", text: "Replace the sample stages with qualification, discovery, proposal, and close milestones. Connect probabilities and transition events to the sales process before interpreting conversion." },
  { title: "Recruitment", text: "Use candidate stages such as sourced, screened, interviewed, and offer. Adapt the entity label, stage names, aging expectations, and outcome definitions." },
  { title: "Other stage-based work", text: "Adapt the same workspace for onboarding, service delivery, procurement, or review workflows by providing an ordered stage definition and timestamped transitions." },
]

const components = ["badge", "button", "card", "chart", "empty", "input", "label", "select", "sheet", "skeleton", "switch", "table", "toggle-group"]

export default function PipelinePerformanceWorkspacePage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Analytics &amp; Workflow</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Pipeline Performance Workspace</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">An analytical workspace for tracking pipeline conversion, stage performance, deal aging, and revenue forecasts.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Pipeline Performance is an investigation workspace for understanding how work moves through ordered stages, where progression slows, and what outcomes or revenue to expect. Its fictional Cognivo Sales Pipeline example is interactive; every overview metric, funnel count, aging measure, forecast, comparison, and opportunity row is calculated from the same stage-history dataset.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">How this template differs from neighboring patterns</CardTitle><CardDescription>Choose the workspace based on the decision users need to make.</CardDescription></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Analytics Dashboard</h3><p className="text-sm leading-relaxed text-muted-foreground">Analytics Dashboard summarizes trends and breakdowns across broad activity data. Pipeline Performance centers on ordered stage transitions, current pipeline snapshots, conversion cohorts, aging, and opportunity-level follow-up.</p><Link href="/templates/analytics-dashboard" className="text-sm font-medium text-link hover:underline">View Analytics Dashboard</Link></div>
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Kanban / Pipeline Board</h3><p className="text-sm leading-relaxed text-muted-foreground">Kanban / Pipeline Board is an operational surface for organizing and moving individual records through stages. Pipeline Performance is an analytical surface for comparing stage throughput and investigating revenue or aging signals; it does not replace board-based record management.</p><Link href="/templates/kanban-pipeline-board" className="text-sm font-medium text-link hover:underline">View Kanban / Pipeline Board</Link></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Metric time bases</CardTitle><CardDescription>Period definitions are visible so historical comparisons stay interpretable.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1"><h3 className="text-sm font-semibold">Period events</h3><p className="text-sm leading-relaxed text-muted-foreground">New opportunity inflow and realized Won Revenue count creation or won events inside the selected date window.</p></div>
              <div className="flex flex-col gap-1"><h3 className="text-sm font-semibold">Period-end snapshot</h3><p className="text-sm leading-relaxed text-muted-foreground">Open pipeline value, current stage, probability, and deal aging are reconstructed at the selected period end.</p></div>
              <div className="flex flex-col gap-1"><h3 className="text-sm font-semibold">Observed transitions</h3><p className="text-sm leading-relaxed text-muted-foreground">Stage entry, advancement, and explicit loss use transitions in the selected window and outcomes observed by its end.</p></div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Filter the pipeline, select a stage, compare periods, change the aging threshold, and open opportunity details. Use the preview-state selector to inspect loading and empty-data states.</p></div>
          <div className="rounded-lg border bg-background p-3 sm:p-5"><PipelinePerformancePreview /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">The workspace uses a configurable pipeline definition (ordered stage names, entity label, and currency) with shared opportunity, owner, source, probability, expected-close, and transition-history fields. No separate sales or recruitment template is required.</p>
          <Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>All interactions use one deterministic fictional dataset and the period definitions above.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["7D / 30D / 90D / custom", "Pipeline / owner / lead-source filters", "Combined filters and reset", "Previous equal-length period", "Selectable conversion funnel", "Sortable stage analysis", "7 / 14 / 30-day aging threshold", "Monthly expected-close chart", "Weighted revenue forecast", "Opportunity detail drawer", "Loading / unavailable / empty states", "Responsive and light / dark modes"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
          <div className="grid gap-3 sm:grid-cols-3">{useCases.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Define an ordered stage model and explicit terminal outcomes for each workflow.</li><li>Keep event-based inflow and revenue metrics separate from period-end open-pipeline snapshots.</li><li>Document how conversion and drop-off cohorts are calculated, including their observation cutoff.</li><li>Use aging as a prompt for contextual review; consider service-level expectations and next steps before labeling a record stalled.</li><li>Keep forecasts tied to the same opportunity values, probabilities, filters, and as-of date.</li><li>Replace fictional sample data with a validated event source before using this pattern for business decisions.</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Do not compare current-stage counts with event conversion rates as if they had the same time basis.</li><li>Do not call every opportunity above an aging threshold stalled or at risk.</li><li>Do not combine realized Won Revenue with forecasted pipeline value.</li><li>Do not interpret missing records as zero-valued deals or zero conversion.</li><li>Do not use a single sales-specific stage vocabulary for unrelated workflows without mapping their entities and outcomes.</li></ul></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Responsive and accessible review</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Filters wrap on narrow screens, the stage funnel stacks, and wide metric tables remain horizontally scrollable. Stage selection uses keyboard-operable buttons, table headers expose sorting actions, and opportunity details move into a right-side sheet. Status is labeled with text and semantic tokens rather than color alone.</p></CardContent></Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">Built from the existing Parry UI semantic theme and shadcn primitives for filters, charting, tables, feedback states, and the opportunity drawer.</p>
          <div className="flex flex-wrap gap-2">{components.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
