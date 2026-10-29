import type { Metadata } from "next"
import Link from "next/link"

import { ActivityTimelineWorkspace } from "@/components/activity-timeline-workspace"
import { TemplateDocumentationLayout } from "@/components/template-documentation-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Activity Timeline · Templates · Parry UI",
  description: "A chronological activity timeline for tracking user actions, status changes, and entity history.",
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
  { title: "Timeline Container", text: "Owns the shared timeline surface, filter state, visible-event limit, variant, and local demo states. Filtering and sorting always operate on the same event collection." },
  { title: "Timeline Group", text: "Separates events into Today, Yesterday, and Earlier while keeping each group newest-first or oldest-first according to the selected sort." },
  { title: "Timeline Event", text: "Combines a semantic icon, event title, short description, actor, and timestamp in a compact row. Its disclosure control preserves expansion when the list is filtered or sorted." },
  { title: "Event Details", text: "Expands in place to show the actor, exact timestamp, activity type, related entity, changed fields, before-and-after values, and optional notes. Sections without data are omitted." },
  { title: "Change Comparison", text: "Presents each changed field as a readable previous value and updated value pair, with labels that remain understandable without color." },
  { title: "Timeline Filters", text: "Shares one filter model for search, activity-type multi-select, actor, date range, sort order, and reset. Search also checks notes and changed values." },
  { title: "Comment Composer", text: "Adds a local comment to the activity data immediately and expands the new event. It uses the shared form primitives and a 400-character limit." },
]

const features = [
  "Eight configurable activity types",
  "Newest-first and oldest-first sorting",
  "Today, Yesterday, and Earlier grouping",
  "Search titles, notes, actors, entities, and changed values",
  "Activity type multi-select and actor filter",
  "Today, 7-day, 30-day, and all-time date ranges",
  "Expand and collapse individual events or all visible events",
  "Before-and-after field comparisons",
  "Copy event details",
  "Load more historical activities",
  "Functional local comment composer",
  "Loading, recoverable error, and empty states",
  "Responsive layouts and keyboard-visible focus",
]

const variants = [
  { title: "Full Timeline", text: "Complete activity history, toolbar, filter controls, event details, and comment composer for a dedicated activity page." },
  { title: "Compact Timeline", text: "Reduced spacing and shorter collapsed rows for sidebars, record inspectors, or narrow detail panels." },
  { title: "Embedded Timeline", text: "A record-detail section with an optional header and four initial events; show more activities as the user needs them." },
]

const states = [
  ["Default Timeline", "The Live timeline state shows the deterministic CRM customer history, grouped by date, with the current sort and filter controls."],
  ["Expanded Event", "Select an event to inspect its actor, exact timestamp, activity type, related entity, changes, and optional notes."],
  ["Collapsed Event", "Select the same event again to close its details. Expanded event IDs are retained when filters or sorting change."],
  ["Filtered Activities", "Combine search, event types, actor, date range, and sort. Every control narrows or orders the same underlying activity list."],
  ["No Search Results", "Search for a phrase that is not present. Reset filters returns the entire activity set."],
  ["Empty Timeline", "Choose Empty timeline in Preview state. Restore demo activity recovers the preview without changing the template."],
  ["Loading", "Choose Loading in Preview state to inspect the skeleton rows and busy announcement."],
  ["Error", "Choose Error in Preview state. Try again restores the live timeline and its local data."],
  ["Comment Added", "Write a note and select Add comment. The new comment appears at the top, opens automatically, and is included in search and filters."],
  ["All Events Loaded", "Load more history adds the older fictional records. The preview confirms when the complete history has been loaded."],
]

const productExamples = [
  { title: "Cognivo", text: "Lead and customer activity: ownership, qualification, field changes, comments, and account milestones." },
  { title: "Sociomile", text: "Conversation assignment, queue transfers, escalation history, status changes, and agent notes." },
  { title: "Agentics", text: "Agent configuration changes, permission updates, version changes, and approval history." },
  { title: "Ripple10", text: "Mention review, classification changes, moderation decisions, and follow-up history." },
]

const componentNames = ["alert", "avatar", "badge", "button", "checkbox", "empty", "field", "input", "popover", "select", "skeleton", "switch", "textarea", "toast"]

export default function ActivityTimelinePage() {
  return (
    <TemplateDocumentationLayout items={toc}>
      
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Layouts &amp; Details</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Activity Timeline</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A chronological activity timeline for tracking user actions, status changes, and entity history.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Activity Timeline gives a business entity a readable history of human actions and meaningful record changes. The CRM customer scenario is fictional; the timeline components and event model are product-neutral and can be reused wherever users need context about how a record reached its current state.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Activity history, not execution telemetry</CardTitle><CardDescription>Choose a timeline for people-oriented changes and an execution log for technical operations.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
              <div className="flex flex-col gap-2"><Badge variant="secondary" className="w-fit">Activity Timeline</Badge><p>Explains who changed a business entity, what changed, when it happened, and any notes that help a teammate continue the work. Events are grouped and readable in customer or record context.</p></div>
              <div className="flex flex-col gap-2"><Badge variant="outline" className="w-fit">Execution Log Viewer</Badge><p>Inspects technical runs, jobs, traces, retries, durations, payloads, and machine-readable diagnostics. It serves operators debugging system behavior, not users reviewing a customer&apos;s history.</p></div>
            </CardContent>
          </Card>
          <p className="leading-relaxed text-muted-foreground">All demo activities and comments live only in component state. There is no backend, persistence layer, real customer data, or technical execution log.</p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Switch variants, test all filter controls, expand event details, copy a record, add a comment, and inspect empty, loading, and error states. The gallery preview uses this same interactive component.</p></div>
          <div className="rounded-xl border bg-background p-3 sm:p-5"><ActivityTimelineWorkspace /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <Card><CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>All controls share the same local event collection.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
          <div className="grid gap-3 md:grid-cols-3">{variants.map((variant) => <Card key={variant.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{variant.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{variant.text}</p></CardContent></Card>)}</div>
          <Card><CardHeader><CardTitle className="text-base">One reusable pattern, multiple products</CardTitle><CardDescription>Configure activity types and entity context without creating product-specific templates.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{productExamples.map((example) => <div key={example.title} className="flex flex-col gap-1"><h3 className="text-sm font-semibold">{example.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{example.text}</p></div>)}</CardContent></Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">Use the Live Preview controls to switch the timeline variant and directly inspect loading, error, and empty states. Other states are reached through the event and filter interactions.</p>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Use this pattern when users need to understand the people, decisions, and record changes behind an entity. Keep the timeline compact and scannable; show the detail a user needs only when they expand an event.</p>
          <Card><CardHeader><CardTitle className="text-base">Good fits</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Customer, lead, and opportunity histories</li><li>Conversation assignment and escalation history</li><li>Agent configuration and approval changes</li><li>Content review and classification history</li></ul></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Design principles</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Keep the event order, actor, action, and time understandable without relying on color.</li><li>Use semantic icons, a continuous connector, concise descriptions, and compact date groups.</li><li>Show before-and-after values only for events with field changes.</li><li>Keep filters composable and apply them consistently to one activity dataset.</li><li>Preserve expanded states while the visible event order changes.</li><li>Use a separate execution log for machine-level runs, traces, and diagnostics.</li></ul></CardContent></Card>
          <p className="text-sm leading-relaxed text-muted-foreground">Names and records in the preview are fictional. Do not enter sensitive or real customer information.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The timeline composes existing Parry UI primitives and semantic theme tokens. Its event types, data, container, groups, details, filters, and composer remain independent of any specific product shell.</p>
          <div className="flex flex-wrap gap-2">{componentNames.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Compare the <Link href="/templates/record-detail-page" className="font-medium text-link hover:underline">Record Detail Page</Link> or <Link href="/templates/tabbed-detail-workspace" className="font-medium text-link hover:underline">Tabbed Detail Workspace</Link>, explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link>, or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
    </TemplateDocumentationLayout>
  )
}
