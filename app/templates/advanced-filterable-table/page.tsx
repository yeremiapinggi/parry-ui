import type { Metadata } from "next"
import Link from "next/link"

import { AdvancedFilterableTablePreview } from "@/components/advanced-filterable-table-preview"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Advanced Filterable Table · Templates · Parry UI",
  description: "Explore complex datasets with advanced filtering, saved views, column customization, grouping, and record inspection.",
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
  { title: "Explorer Header", text: "Names the dataset and keeps the current matching-record total visible as the query changes." },
  { title: "Query Toolbar", text: "Combines keyword search, advanced filtering, saved views, columns, grouping, and sort controls without adding nested toolbars." },
  { title: "Filter Summary", text: "Shows applied conditions as editable, removable chips and offers one clear-all action." },
  { title: "Grouped Table", text: "Displays the current filtered and sorted records, supports expandable groups, sortable headers, horizontal scrolling, and page navigation." },
  { title: "Record Inspector", text: "Opens from a row selection, can be resized on wider screens, and becomes a labeled drawer on narrow screens." },
  { title: "Saved Views", text: "Captures search, advanced conditions, sort, column visibility, grouping, and page size in named browser-persisted configurations." },
]

const interactionStates = [
  ["Default", "All Records opens with the complete fictional dataset and the default visible columns."],
  ["Filtered", "Search and valid advanced conditions combine; the count, grouping, and pagination reflect the matching set."],
  ["No results", "A contextual empty state offers a direct action to clear search and filters."],
  ["Loading", "A short skeleton state appears while the preview restores local saved-view preferences."],
  ["Invalid filter", "Incomplete values, invalid dates, and reversed date ranges show validation feedback and cannot be applied."],
  ["Unsaved view", "Changing a view configuration displays an Unsaved changes indicator until it is saved or another view is selected."],
  ["Selected record", "The selected row is highlighted and its details stay synchronized with the active query."],
]

const doGuidelines = [
  "Keep frequent search and filter actions visible; place advanced conditions and column options behind explicit controls.",
  "Use AND/OR labels in every group and show editable filter values in the summary.",
  "Reset pagination after any search, filter, sort, grouping, or page-size change.",
  "Keep a stable identifying column visible and use horizontal scrolling instead of compressing values.",
  "Persist named views as user preferences, and make built-in views read-only.",
]

const dontGuidelines = [
  "Do not expose every filter field as a permanent toolbar control.",
  "Do not rely on color alone for status, priority, sort direction, or validation feedback.",
  "Do not silently keep a selected record open when it no longer matches the query.",
  "Do not use the advanced explorer for routine create/edit/delete workflows that fit a standard management list.",
  "Do not present fictional preview data as production or customer records.",
]

const featureBadges = [
  "AND / OR filters", "One-level nested groups", "Saved view presets", "Column visibility", "Expandable groups",
  "Three-state header sorting", "Search with filters", "Responsive record inspector", "Resizable details divider",
]

export default function AdvancedFilterableTablePage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Tables &amp; Data Exploration</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Advanced Filterable Table</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Explore complex datasets with advanced filtering, saved views, column customization, grouping, and record inspection.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Advanced Filterable Table is a data-exploration surface for users who need to build repeatable queries across large, structured collections. Search works alongside typed text, enum, and date conditions; groups combine conditions with AND or OR logic, with one nested level for more expressive queries.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Use it when saved views, flexible columns, grouping, and fast record inspection are central to the workflow. Use <Link href="/templates/data-management-list" className="font-medium text-link hover:underline">Data Management List</Link> instead when the primary job is routine CRUD and record maintenance, with stable columns and simpler filters.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            The preview uses 36 fictional enterprise records. It is product-neutral and does not represent Ivosights customer data. Saved views are demo preferences stored in this browser only.
          </p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Try searching, opening the filter builder, saving views, changing columns, grouping, sorting, paging, and inspecting records. Changes are local to this preview.</p>
          </div>
          <AdvancedFilterableTablePreview />
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
          <p className="leading-relaxed text-muted-foreground">Keep the explorer header and query surface focused, and enable only the column, grouping, and detail-inspection options that fit the dataset.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>Available in this template preview</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">{featureBadges.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Filter operators</CardTitle><CardDescription>Controls adapt to the selected field type</CardDescription></CardHeader>
            <CardContent className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-3">
              <div><p className="font-medium text-foreground">Text</p><p>Contains, does not contain, equals, and does not equal.</p></div>
              <div><p className="font-medium text-foreground">Enum</p><p>Is, is not, and is any of with multiple selected values.</p></div>
              <div><p className="font-medium text-foreground">Date</p><p>Before, after, and inclusive between ranges with validation.</p></div>
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">States come from the live controls rather than a static mode switch. Filter validation blocks incomplete queries; saved-view changes remain clearly marked until the configuration is saved.</p>
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
          <p className="leading-relaxed text-muted-foreground">Progressively reveal advanced query controls while keeping applied conditions and their effects easy to inspect.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">On narrow screens, keep the table horizontally scrollable and present record details in an accessible drawer rather than squeezing the inspection panel beside the rows.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI primitives and keeps the demo dataset, filter engine, saved-view state, table, and record inspector in separate modules.</p>
          <div className="flex flex-wrap gap-2">
            {["badge", "button", "dialog", "dropdown-menu", "input", "label", "select", "separator", "skeleton", "table"].map((name) => (
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
