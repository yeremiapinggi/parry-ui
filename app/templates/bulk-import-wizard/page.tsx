import type { Metadata } from "next"
import Link from "next/link"

import { BulkImportWizard } from "@/components/bulk-import-wizard"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Bulk Import Wizard · Templates · Parry UI",
  description: "A guided local-demo workflow for uploading, mapping, validating, and reviewing bulk record imports.",
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
  ["Upload area", "Accepts CSV and XLSX files, checks size and file contents locally, and reports file details with recovery actions."],
  ["Shared progress stepper", "Shows current and completed stages, and lets users return to earlier completed work without losing the file or mappings."],
  ["Column mapper", "Suggests contact-field matches, requires Full Name and Email, prevents mapping a source column more than once, and previews sample values."],
  ["Validation review", "Summarizes valid, invalid, and duplicate rows; filters the row list; and explains issues using source row and field references."],
  ["Sticky action footer", "Keeps progress and navigation available while file details, mapping controls, and result tables scroll."],
  ["Local results", "Simulates import outcomes and provides a result table, imported-record view, and downloadable CSV reports without contacting a backend."],
]

const states = [
  ["Initial / No File", "Explains accepted formats and size limits, with file browsing, drag-and-drop, and sample-data recovery."],
  ["Parsing / Unsupported / Too Large", "Shows parsing progress or actionable format and size feedback; the invalid file can be replaced or removed."],
  ["Empty File", "Reports that no usable header and data rows were found and offers another upload or the sample dataset."],
  ["Mapping Incomplete", "Highlights required fields and keeps Continue disabled until Full Name and Email are mapped to distinct columns."],
  ["Validation Errors", "Identifies missing names, missing or invalid email addresses, unsupported statuses, and the affected source row."],
  ["Duplicate Records", "Detects repeated email addresses and lets users skip duplicates or treat them as local updates."],
  ["Ready to Import", "Shows consistent row counts and asks for explicit confirmation before invalid rows are excluded."],
  ["Importing", "Displays local progress with a clear demo-only explanation; no upload or database request is made."],
  ["Completed / Partial / Failed", "Summarizes imported, updated, skipped, and failed outcomes, then exposes reports and a new-import recovery path."],
]

const doGuidelines = [
  "Use bulk import for moving many structured records, not for a small one-off form submission.",
  "Show example values beside each mapping and explain which fields are required before validation.",
  "Keep row-level error messages connected to source row numbers and field names, and offer a downloadable report.",
  "Make duplicate handling explicit, and state whether a production system would skip, merge, or update a matching record.",
  "For production imports, validate again on the server and report the authoritative outcome from the import service.",
]

const dontGuidelines = [
  "Do not suggest that local demo results have changed real application data.",
  "Do not silently discard invalid rows or conceal how duplicates are handled.",
  "Do not rely on column order alone when mapping records; use names, previews, and editable choices.",
  "Do not parse unbounded files in the browser or treat client-side validation as a security boundary.",
]

export default function BulkImportWizardPage() {
  return (
    <main className="w-full bg-card text-card-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
        <article className="flex min-w-0 flex-col gap-12 py-10">
          <header className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Forms</span></div>
            <Badge variant="secondary">Page template</Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Bulk Import Wizard</h1>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A guided workflow for importing bulk records with column mapping, validation, and import results. This interactive preview parses files locally and simulates outcomes without changing real application data.</p>
          </header>

          <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
            <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
            <p className="leading-relaxed text-muted-foreground">The four stages are Upload File, Column Mapping, Validate &amp; Review, and Import Results. The preview uses generic Contact records with required Full Name and Email fields, optional Phone and Company fields, and predefined Status values. CSV and XLSX files are parsed in the browser; duplicate detection uses email addresses in the uploaded file.</p>
            <p className="leading-relaxed text-muted-foreground">This is a local demo. It does not send file contents to a server or create, update, or delete real records. Invalid rows are excluded only after an explicit warning; downloadable reports are generated in the browser.</p>
            <Card>
              <CardHeader><CardTitle className="text-base">Choose the right form pattern</CardTitle><CardDescription>Import workflows have different needs from guided forms and record editing.</CardDescription></CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-3">
                <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Bulk Import Wizard</h3><p className="text-sm leading-relaxed text-muted-foreground">Best for many records from a file. It includes parsing, field mapping, row-level validation, duplicate policy, and an import report.</p></div>
                <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Multi-Step Form Wizard</h3><p className="text-sm leading-relaxed text-muted-foreground">Best for a single configuration or record that has dependent stages, conditional fields, or a required checkpoint. It guides one user through decisions rather than processing rows.</p></div>
                <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Create / Edit Form</h3><p className="text-sm leading-relaxed text-muted-foreground">Best for creating or updating one structured record at a time when the fields fit naturally on one page and can be validated together.</p></div>
              </CardContent>
            </Card>
          </section>

          <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
            <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Load the sample dataset to explore suggested mappings, validation filters, duplicate policies, the explicit invalid-row confirmation, simulated outcomes, and CSV downloads. You can also upload a CSV or XLSX file from your device.</p></div>
            <div className="rounded-lg border bg-card p-3 sm:p-6"><BulkImportWizard /></div>
          </section>

          <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
            <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
            <div className="grid gap-3 sm:grid-cols-2">{anatomy.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
          </section>

          <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
            <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
            <p className="leading-relaxed text-muted-foreground">The wizard accepts a validation config for the record label, required fields, email and status validators, allowed statuses, and duplicate key (using the included Full Name, Email, Phone, Company, and Status fields). Reuse the shared Contact field set for Customers or Leads by adjusting those rules; extend the field schema and result columns when adapting it to a different record shape. Keep file parsing and server-side validation aligned with the production import contract.</p>
            <Card><CardHeader><CardTitle className="text-base">Included workflow</CardTitle><CardDescription>File intake through local result reporting</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["CSV and XLSX parsing", "Sample contact dataset", "Suggested column mapping", "Required fields", "Duplicate policies", "Row-level filters", "Import progress", "CSV reports", "Discard confirmation"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Contact validation</CardTitle><CardDescription>Demo rules that can be replaced for a different record type</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Configurable required fields", "Optional email format rule", "Configurable allowed statuses", "Configurable duplicate key", "Optional phone and company fields"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}</CardContent></Card>
          </section>

          <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
            <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
            <p className="leading-relaxed text-muted-foreground">Every stage provides a recovery path. Data and mappings stay in component state while navigating backward and forward in the preview.</p>
            <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
          </section>

          <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
            <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
            <p className="leading-relaxed text-muted-foreground">Bulk imports have a higher impact than single-record forms. Make data handling, validation, duplicate behavior, and partial outcomes clear before users commit an import.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
            </div>
          </section>

          <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
            <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
            <p className="leading-relaxed text-muted-foreground">The template composes shared Parry UI buttons, badges, alerts, dialogs, file controls, selects, tables, checkboxes, filters, and the reusable wizard stepper.</p>
            <div className="flex flex-wrap gap-2">{["alert", "alert-dialog", "badge", "button", "checkbox", "label", "select", "table", "toggle-group", "wizard-stepper"].map((name) => <Link key={name} href={name === "wizard-stepper" ? "/templates/multi-step-form-wizard#anatomy" : `/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
            <Separator />
            <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
          </section>
        </article>
        <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
      </div>
    </main>
  )
}
