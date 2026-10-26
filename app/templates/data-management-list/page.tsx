import type { Metadata } from "next"
import Link from "next/link"

import { DocsToc } from "@/components/docs-nav"
import { DataManagementListPreview } from "@/components/data-management-list-preview"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Data Management List · Templates · Parry UI",
  description: "An interactive, configurable data management list template for Parry UI.",
}

const toc = [
  { id: "overview", label: "Overview" },
  { id: "live-preview", label: "Live Preview" },
  { id: "anatomy", label: "Anatomy" },
  { id: "features-variants", label: "Features & Variants" },
  { id: "states", label: "States" },
  { id: "usage-guidelines", label: "Usage Guidelines" },
  { id: "components-used", label: "Components Used" },
]

const sectionHeading = "scroll-mt-24 font-heading text-2xl font-semibold tracking-tight"

const anatomy = [
  { title: "Page Header", text: "Names the collection, briefly describes its purpose, and anchors the primary Add Record action." },
  { title: "Toolbar", text: "Keeps keyword search and the most useful filters together immediately above the table. Advanced filters stay opt-in." },
  { title: "Data Table", text: "Uses stable column alignment, clear row spacing, readable secondary identity details, and explicit sortable headers." },
  { title: "Row Selection & Actions", text: "Selection is optional. Row-level actions stay in a compact menu, while bulk actions appear only when selection is present." },
  { title: "Pagination", text: "Keeps the visible range, total matching records, page size, and previous/next navigation together." },
  { title: "Feedback States", text: "Distinguishes an empty collection from a search with no matches and preserves the table geometry while loading." },
]

const doGuidelines = [
  "Keep search and the primary status filter together above the table.",
  "Show a sort direction only on the active column; make sortable headers keyboard operable.",
  "Reveal bulk actions only after at least one row is selected.",
  "Use a contextual empty state with a clear next step, and a different message for no matching results.",
  "On narrow screens, preserve column meaning and allow the table to scroll horizontally.",
]

const dontGuidelines = [
  "Do not scatter filters below the table or hide the primary search control.",
  "Do not show bulk actions when nothing is selected.",
  "Do not use color alone to communicate sort direction or status.",
  "Do not treat a filtered no-results state as if the collection has never had data.",
  "Do not squeeze every column until its labels and values become unreadable.",
]

export default function DataManagementListPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Tables &amp; Data Management</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Data Management List</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A practical, reusable foundation for managing records in enterprise SaaS products. Explore its structure here, then open the catalog preview to try optional features and states.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Use this template when people need to browse, find, compare, and maintain a structured collection such as users, customers, vendors, projects, or inventory. It keeps the data table as the main work surface and avoids dashboard metrics that do not support the task.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            The preview uses generic directory records and Parry&apos;s default semantic tokens. Its structure is intentionally product-neutral and can later accept the Cognivo, Sociomile, Ripple10, or Agentics theme and data configuration without separate template implementations.
          </p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Try searching, filtering, sorting, selecting rows, changing page size, and managing the demo records. The preview focuses on the table itself; optional template controls are available from the catalog preview.</p>
          </div>
          <DataManagementListPreview showControls={false} />
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
          <p className="leading-relaxed text-muted-foreground">The collection header, data table, row feedback, and clear primary action form the core. Search, filters, row selection, bulk actions, row menus, pagination, and advanced filters are optional and can be enabled independently.</p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Core structure</CardTitle>
              <CardDescription>Always present in the template</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Page title and description", "Add Record action", "Configurable table columns", "Loading and empty feedback"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optional functionality</CardTitle>
              <CardDescription>Choose optional features that fit the workflow</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Search", "Status filters", "Row selection", "Bulk actions", "Edit and delete menus", "Pagination", "Department filter"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>States</h2>
          <p className="leading-relaxed text-muted-foreground">Open the template preview from the catalog to switch between these states. Each condition updates the toolbar and table together.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Normal", "A populated directory with search, filtering, selection, and pagination available."],
              ["Few records", "A small collection that demonstrates a table with only a few records."],
              ["Empty", "A new collection with contextual copy and a direct Add Record action."],
              ["Loading", "Toolbar placeholders and skeleton rows preserve the table layout while data is loading."],
            ].map(([title, text]) => (
              <Card key={title} className="gap-2 py-4">
                <CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Keep high-frequency list actions close to the table and make every change of state understandable without relying on color alone.</p>
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
          <p className="text-sm leading-relaxed text-muted-foreground">For responsive behavior, keep the toolbar controls wrapping naturally and let the data region scroll horizontally before sacrificing column legibility.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI primitives; it does not introduce a new visual language or duplicate base components.</p>
          <div className="flex flex-wrap gap-2">
            {["button", "badge", "card", "checkbox", "dialog", "dropdown-menu", "input", "label", "select", "skeleton", "switch", "table"].map((name) => (
              <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>
            ))}
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block">
        <div className="sticky top-24">
          <DocsToc items={toc} />
        </div>
      </aside>
    </div>
  )
}
