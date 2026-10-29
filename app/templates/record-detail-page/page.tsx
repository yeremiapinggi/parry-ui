import type { Metadata } from "next"
import Link from "next/link"

import { RecordDetailPagePreview } from "@/components/record-detail-page-preview"
import { TemplateDocumentationLayout } from "@/components/template-documentation-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Record Detail Page · Templates · Parry UI",
  description: "A structured detail page for viewing record information, related data, activity history, and contextual actions.",
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
  { title: "Context Header", text: "Breadcrumbs return to the demo contact directory. The page title, status, previous/next controls, primary edit action, and record menu stay visible without competing with the record itself." },
  { title: "Record Overview", text: "An avatar fallback, contact identity, record-type and status badges, and compact key metadata establish who the record represents and how it is managed." },
  { title: "Contact Information", text: "Email, phone, contact preference, and identity details are arranged in a responsive grid with direct mail and phone links." },
  { title: "Additional Details", text: "Source, segment, follow-up date, description, and tags remain secondary to the core identity fields." },
  { title: "Related Records", text: "Company and opportunity links open focused detail dialogs, keeping navigation contextual without introducing unrelated tabs or workflows." },
  { title: "Recent Activity", text: "Creation, edits, duplication, and archive/restore actions are reflected in a compact chronological activity list." },
]

const states = [
  ["Default / Active", "A deterministic fictional contact record shows identity, status, key metadata, related company/opportunity records, and recent activity."],
  ["Edit Mode", "Edit Record opens a controlled form built from the existing input, select, label, textarea, and dialog primitives. Saving updates the contact in local component state."],
  ["Unsaved Changes", "The save action enables only when valid fields have changed. Cancel or closing the editor prompts before discarding an unsaved draft."],
  ["Archived", "Archive changes the status badge and adds an activity item. The menu then offers Restore, which returns the contact to its saved status."],
  ["Deleted / Empty", "Delete requires confirmation and returns to the contact directory. Deleting the final record shows a working empty state with an option to restore sample data."],
  ["Loading", "Record navigation briefly displays skeleton content. The live preview also exposes a stable loading state through its demo-state selector."],
  ["Error / Record Not Found", "The preview can show a not-found state with an action back to the default demo. The component also handles a stale selected record in its own state."],
]

const doGuidelines = [
  "Use this pattern when a person needs to understand or manage one record as the primary unit of work.",
  "Keep identity and high-value metadata above secondary attributes, relationships, and history.",
  "Make related records open a useful, accessible detail view and preserve context when the user returns.",
  "Ask for confirmation before discarding a changed form or performing a destructive delete.",
  "Keep the read view compact; make the edit form a separate, focused interaction.",
]

const dontGuidelines = [
  "Do not use a detail page as the main way to scan, compare, or bulk-manage many records; use a table for that job.",
  "Do not add tabs when the record only has a few short sections; avoid hiding core details behind navigation.",
  "Do not imply that preview-only edits or activity are saved to a connected service.",
  "Do not rely on status color alone; keep a readable status label beside every badge.",
  "Do not turn every field or related item into a nested card; use clear headings, spacing, and dividers instead.",
]

const componentNames = ["avatar", "badge", "button", "dialog", "dropdown-menu", "input", "label", "select", "separator", "skeleton", "textarea", "toast"]

export default function RecordDetailPageTemplate() {
  return (
    <TemplateDocumentationLayout items={toc}>
      
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Layouts &amp; Details</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Record Detail Page</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A structured detail page for viewing record information, related data, activity history, and contextual actions.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Record Detail Page gives one business record a clear home: identity and status first, followed by contact information, secondary attributes, relationships, and a short activity history. The preview uses fictional data and keeps changes in React state only.</p>
          <Card><CardHeader><CardTitle className="text-base">Choose the right detail pattern</CardTitle><CardDescription>Match the surface to whether people are browsing a collection, inspecting one item, or moving between several record domains.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><div className="flex flex-col gap-2"><Badge variant="secondary" className="w-fit">Record Detail Page</Badge><h3 className="text-sm font-semibold">One record is the focus</h3><p className="text-sm leading-relaxed text-muted-foreground">Use when the user needs a readable summary, record-level actions, related data, and a recent timeline.</p></div><div className="flex flex-col gap-2"><Badge variant="secondary" className="w-fit">Table Inspector</Badge><h3 className="text-sm font-semibold">Stay inside a record list</h3><p className="text-sm leading-relaxed text-muted-foreground">Use a compact side panel when users inspect rows and need to return to the same filtered table without leaving it.</p></div><div className="flex flex-col gap-2"><Badge variant="secondary" className="w-fit">Tabbed Detail Workspace</Badge><h3 className="text-sm font-semibold">Multiple deep work areas</h3><p className="text-sm leading-relaxed text-muted-foreground">Use when one entity has substantial, distinct domains such as permissions, billing, configuration, or long-form history that deserve persistent navigation.</p></div></CardContent></Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Edit and save a contact, inspect related company and opportunity records, duplicate or archive it, and open the contact directory from the breadcrumb. The state selector exposes loading, empty, and not-found examples.</p></div>
          <div className="rounded-lg border bg-background p-3 sm:p-5"><RecordDetailPagePreview /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading"><h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2><div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div></section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading"><h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2><p className="leading-relaxed text-muted-foreground">The template keeps its read view stable while record actions open focused dialogs. Related records use a small, reusable detail surface; the directory and adjacent-record controls provide lightweight navigation for the demo.</p><Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>All actions update local preview state only; there is no backend connection.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Breadcrumb to record list", "Previous / next navigation", "Record status badges", "Edit and save", "Unsaved-change confirmation", "Duplicate record", "Archive / restore", "Confirmed deletion", "Clickable related records", "Action history", "Loading / empty / not-found states", "Responsive metadata grid"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card></section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading"><h2 id="states-heading" className={sectionHeading}>Interaction States</h2><div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div></section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading"><h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2><p className="leading-relaxed text-muted-foreground">Use this page when users need an enduring destination for one entity, not merely a quick peek from a collection. Keep high-signal attributes visible and let secondary navigation earn its place through real depth.</p><div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card></div><Card><CardHeader><CardTitle className="text-base">Responsive behavior</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Metadata and information sections collapse to a single column on narrow screens. Actions wrap into a second row when needed; related-record labels and activity descriptions remain readable without horizontal scrolling.</p></CardContent></Card></section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading"><h2 id="components-heading" className={sectionHeading}>Components Used</h2><p className="leading-relaxed text-muted-foreground">The page composes existing Parry UI controls and the shared fictional contact dataset. No new dependencies or persistence layer are required for the local template preview.</p><div className="flex flex-wrap gap-2">{componentNames.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div><Separator /><p className="text-sm text-muted-foreground">Compare the <Link href="/templates/advanced-filterable-table" className="font-medium text-link hover:underline">table inspector</Link>, explore the <Link href="/templates/create-edit-form" className="font-medium text-link hover:underline">Create / Edit Form</Link>, or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p></section>
    </TemplateDocumentationLayout>
  )
}
