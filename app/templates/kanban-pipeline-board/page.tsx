import type { Metadata } from "next"
import Link from "next/link"

import { KanbanPipelineBoard } from "@/components/kanban-pipeline-board"
import { TemplateDocumentationLayout } from "@/components/template-documentation-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Kanban / Pipeline Board · Templates · Parry UI",
  description: "A flexible drag-and-drop board for managing pipelines, tasks, and stage-based workflows.",
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
  ["Pipeline summary", "The page title and compact summary establish the workflow context, record count, and aggregate value without competing with the board."],
  ["Shared toolbar", "Search, owner, priority, sort, archive, and view controls operate on the same records in both Board and List views."],
  ["Stage columns", "Each horizontally scrollable column summarizes count and value, exposes stage actions, and provides a clear empty-column action."],
  ["Opportunity cards", "Cards prioritize name, company, deal value, owner, priority, and expected close date. Actions stay available through a keyboard-operable menu."],
  ["Record detail", "Selecting a card opens a side drawer with its status, stage, value, owner, expected close, notes, and edit or move controls."],
  ["Stage manager", "Add, rename, and reorder open stages. Empty stages can be removed; populated stages require reassignment before deletion."],
]

const states = [
  ["Default", "The fictional sales dataset populates six stages. Counts, stage values, open pipeline value, and won value are derived from the same records."],
  ["Dragging / Drop target", "Drag a card by its grip to another stage. The target column receives a visible highlight and the move updates status and totals immediately."],
  ["Keyboard move", "Open a card menu and use Move to stage, or change the Stage selector in List view or the detail drawer. Every move has a keyboard-accessible path."],
  ["Filtered / No results", "Search matches opportunity, company, and owner. Owner, priority, and sort remain active while switching between views; clear filters restores the full set."],
  ["Creating / Editing", "Required fields keep Save disabled until complete. Validation errors explain invalid values and dates; closing a changed form asks whether to discard edits."],
  ["Empty / Archived / Deleted", "Empty stages offer an Add card action. Archived records can be restored from the archive view; deletion is confirmed before removing the record."],
  ["Loading", "A short layout-preserving skeleton state illustrates how a connected data source can load without shifting the board layout."],
]

export default function KanbanPipelineBoardPage() {
  return (
    <TemplateDocumentationLayout items={toc}>
      
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Workflows</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Kanban / Pipeline Board</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A flexible drag-and-drop board for managing pipelines, tasks, and stage-based workflows.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">A reusable workflow board for moving records through customizable stages. The Sales Pipeline demo includes fictional opportunities and local state; board and list views share one dataset, so filters, edits, moves, and totals stay synchronized.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">One workflow model, multiple use cases</CardTitle><CardDescription>Keep the interaction model stable while configuring stages and card fields for the work at hand.</CardDescription></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Sales Pipeline</h3><p className="text-sm leading-relaxed text-muted-foreground">Use New Lead, Qualified, Proposal, Negotiation, Won, and Lost. Cards show company, deal value, owner, priority, and expected close date.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Task Board</h3><p className="text-sm leading-relaxed text-muted-foreground">Configure stages such as Backlog, Ready, In progress, Review, and Done. Replace deal fields with due date, assignee, estimate, or project.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Ticket Workflow</h3><p className="text-sm leading-relaxed text-muted-foreground">Use New, Triaged, In progress, Waiting, Resolved, and Closed. Surface requester, severity, SLA, and last-updated fields on each card.</p></div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Try moving a card, changing views, filtering the shared dataset, editing an opportunity, and managing stages. All changes stay in local preview state.</p></div>
          <div className="min-w-0 overflow-hidden rounded-lg border bg-background p-3 sm:p-5"><KanbanPipelineBoard /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomy.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}
          </div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">The reusable board accepts a stage list and record fields, while preserving core stage semantics for terminal Won and Lost outcomes. Update the record type and card summary to adapt it to task tracking, support queues, reviews, or fulfillment.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>All actions use the local demo dataset and update shared metrics immediately.</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">{["Drag and drop", "Keyboard stage moves", "Search and filters", "Sort by date, value, name, or priority", "Board / List views", "Create and edit", "Duplicate and archive", "Delete confirmation", "Stage management", "Record detail drawer", "Loading and empty states"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Use stages that describe a meaningful state change and make the next action clear.</li><li>Keep card content scannable; reserve the detail drawer for secondary context and notes.</li><li>Show counts and totals that use the same visible records and clearly state what is included.</li><li>Provide a keyboard path for every drag action and a visible drop target.</li><li>Retain terminal outcomes and define how status changes when records move backward.</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Do not encode workflow status using color alone; keep stage names and status labels visible.</li><li>Do not let search or filters diverge between Board and List views.</li><li>Do not delete a populated stage without a deliberate reassignment target.</li><li>Do not overload cards with every record field or decorative status badges.</li><li>Do not count archived records in active pipeline totals.</li></ul></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Responsive behavior</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Keep the toolbar flexible and stack its filters on narrow screens. Board columns use a fixed compact width inside their own horizontal scroll region; the page itself stays within the viewport. Switch to List view for dense record scanning on smaller screens.</p></CardContent></Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The board composes Parry UI controls with a local workflow model and @dnd-kit for pointer and keyboard sensor support.</p>
          <div className="flex flex-wrap gap-2">{["avatar", "badge", "button", "card", "dialog", "dropdown-menu", "field", "input", "select", "sheet", "table", "toggle-group"].map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
    </TemplateDocumentationLayout>
  )
}
