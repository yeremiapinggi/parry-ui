import type { Metadata } from "next"
import Link from "next/link"

import { ConversationTablePreview } from "@/components/conversation-table-preview"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Conversation Table · Templates · Parry UI",
  description: "Monitor, filter, assign, and manage omnichannel customer conversations in a reusable enterprise table.",
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
  { title: "Conversation Header", text: "Names the queue, explains its purpose, exposes the live matching count, and starts a new conversation." },
  { title: "Status & Query Toolbar", text: "Combines keyword search, a single active status, channel, priority, assignee, sort, and clear-filter controls." },
  { title: "Conversation Rows", text: "Keeps the conversation ID, customer and message context, channel, status, priority, assignee, last activity, SLA, and actions in a compact scannable row." },
  { title: "Bulk Action Bar", text: "Appears only when conversations are selected and applies assignment, priority, or status changes without losing selections across pages." },
  { title: "Conversation Preview", text: "Opens a read-only side drawer with recent messages, customer information, and conversation metadata." },
  { title: "Feedback & Pagination", text: "Distinguishes loading, empty, no-results, error, and success feedback while preserving table context and accessible page navigation." },
]

const features = [
  "Customer, ID, and message search", "Single-select status filters", "Channel and priority filters", "Assignee and unassigned filters",
  "Latest, oldest, priority, and customer sorting", "Selection across pages", "Bulk assignment, priority, and status", "Close confirmation", "Bookmarked conversations", "Read-only conversation drawer", "Demo creation dialog", "Horizontal scrolling",
]

const states = [
  ["Default", "The fictional conversation dataset opens with matching counts, the current page, and the latest activity first."],
  ["Loading", "Skeleton rows preserve table geometry while the conversation list is unavailable."],
  ["Empty", "A new workspace message offers a direct action to create its first demo conversation."],
  ["No search results", "Search and filters combine with AND logic; unmatched queries show a clear way back to the full list."],
  ["Selected rows", "The selection count and bulk action bar appear only when one or more conversations are selected."],
  ["Bulk action success", "Successful assignment, priority, or status changes update the shared dataset and display confirmation."],
  ["Action error", "The preview-state selector can simulate rejected row and bulk updates; the table stays unchanged and announces the error."],
]

const doGuidelines = [
  "Keep customer, latest message, status, and SLA visible without opening the preview.",
  "Combine independent filters with AND logic, and keep status mutually exclusive.",
  "Preserve selections when the query or page changes; make the selected count explicit.",
  "Confirm bulk status changes to Closed and clearly report success or failure.",
  "Use channel labels alongside icons and SLA labels alongside their semantic indicator colors.",
]

const dontGuidelines = [
  "Do not turn the row preview into a full conversation workspace or add reply controls.",
  "Do not treat a message preview or channel icon as a substitute for its readable label.",
  "Do not silently drop selections when a filter or page changes.",
  "Do not rely on color alone for status, priority, or SLA meaning.",
  "Do not present fictional preview records as live customer data.",
]

const componentLinks = ["avatar", "badge", "button", "checkbox", "dialog", "dropdown-menu", "input", "select", "table", "toggle-group"]

export default function ConversationTablePage() {
  return <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
    <article className="flex min-w-0 flex-col gap-12 py-10">
      <header className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Table &amp; Data</span></div>
        <Badge variant="secondary">Page template</Badge>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Conversation Table</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A conversation management table for monitoring, filtering, assigning, and managing customer conversations.</p>
      </header>

      <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
        <p className="leading-relaxed text-muted-foreground">Conversation Table is an omnichannel queue for contact center teams. It brings customer context, message previews, assignment, status, priority, last activity, and SLA health into one compact list so agents can quickly decide what needs attention.</p>
        <p className="leading-relaxed text-muted-foreground">Use <Link href="/templates/data-management-list" className="font-medium text-link hover:underline">Data Management List</Link> for routine CRUD workflows across stable records with simple filters. Choose <Link href="/templates/advanced-filterable-table" className="font-medium text-link hover:underline">Advanced Filterable Table</Link> when users need flexible query building, saved views, grouping, and column customization. Use Conversation Table when the records are active customer conversations and the queue itself drives assignment and service-level decisions.</p>
        <p className="leading-relaxed text-muted-foreground">The preview uses fictional customer records in a shared in-memory demo dataset. Row and bulk changes stay consistent for the current demo session; no live messaging channel or persistent backend is connected.</p>
      </section>

      <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
        <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Search, filter, sort, select across pages, change assignments and priorities, create a demo conversation, or open a read-only preview. Use the state selector to inspect loading, empty, no-result, and error states.</p></div>
        <ConversationTablePreview />
      </section>

      <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
        <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
        <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
      </section>

      <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
        <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
        <p className="leading-relaxed text-muted-foreground">Keep the conversation triage essentials in the default table. Add queue-specific fields only when they help agents choose a next action without opening a separate workspace.</p>
        <Card><CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>Available in this template preview</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Three distinct table patterns</CardTitle><CardDescription>Choose by the job of the list</CardDescription></CardHeader><CardContent className="grid gap-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-3"><div><p className="font-medium text-foreground">Data Management List</p><p>Routine create, edit, delete, and organize workflows for stable business records.</p></div><div><p className="font-medium text-foreground">Advanced Filterable Table</p><p>Flexible querying across complex datasets with saved views, groups, and customizable columns.</p></div><div><p className="font-medium text-foreground">Conversation Table</p><p>Operational queue management for active conversations, assignments, service priority, and SLA health.</p></div></CardContent></Card>
      </section>

      <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
        <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
        <p className="leading-relaxed text-muted-foreground">Choose a state in the live preview to demonstrate the corresponding table feedback. Selection and bulk success states are reached through normal table interactions.</p>
        <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
      </section>

      <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
        <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
        <p className="leading-relaxed text-muted-foreground">Optimize the queue for fast triage: put the customer and latest message first, keep service context scannable, and make changes reversible when possible.</p>
        <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card></div>
        <p className="text-sm leading-relaxed text-muted-foreground">The conversation preview is intentionally read-only. A full conversation workspace, composer, and live channel integrations are outside this template.</p>
      </section>

      <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
        <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
        <p className="leading-relaxed text-muted-foreground">The template composes Parry UI controls for search, filtering, selection, menus, confirmation, and conversation inspection. Its fictional dataset is kept separate from the interactive table.</p>
        <div className="flex flex-wrap gap-2">{componentLinks.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
        <Separator />
        <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
      </section>
    </article>
    <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
  </div>
}
