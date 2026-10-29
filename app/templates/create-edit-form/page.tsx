import type { Metadata } from "next"
import Link from "next/link"

import { CreateEditForm } from "@/components/create-edit-form"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Create / Edit Form · Templates · Parry UI",
  description: "A reusable form for creating and editing structured business records.",
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
  { title: "Context Header", text: "Names the current task, explains its purpose, exposes a create/edit mode switcher, and shows a visible unsaved indicator." },
  { title: "Basic Information", text: "Collects a required name and unique email, optional validated phone and description, plus record-type-specific fields." },
  { title: "Assignment & Relationship", text: "Uses searchable company and owner pickers alongside status and priority controls." },
  { title: "Additional Information", text: "Groups source, preferred contact method, tags, and an optional follow-up date." },
  { title: "Sticky Action Footer", text: "Keeps Cancel, Reset Changes, and the mode-specific primary action available while the form scrolls." },
  { title: "Inline Feedback", text: "Shows field errors, local save progress, successful save feedback, and a focused discard confirmation." },
]

const states = [
  ["Create · Default", "Starts with a blank contact, sensible select defaults, and no saved backend data."],
  ["Edit · Prefilled", "Choose a fictional existing record or one created during this preview session."],
  ["Dirty / Unsaved", "Changing a value marks the form as unsaved and enables Reset Changes and Cancel."],
  ["Validation Error", "Submission checks required name and email, email format and uniqueness, and phone format when provided; focus moves to the first invalid field."],
  ["Conditional Fields", "Customer records reveal Customer Segment. Prospect records reveal Lead Source Details."],
  ["Saving / Save Success", "A short local saving state resolves into a toast and updated in-memory record; no API is called."],
  ["Duplicate Record Error", "Email addresses are checked against the local demo record list, excluding the record currently being edited."],
  ["Discard Confirmation", "Cancel, mode changes, record changes, and in-app links ask before dropping unsaved values."],
]

const doGuidelines = [
  "Use this pattern when a user creates or edits one structured entity at a time.",
  "Group related fields and keep labels, helper text, and errors close to their controls.",
  "Validate email uniqueness against the appropriate record scope and exclude the current entity during edits.",
  "Make conditional fields predictable and explain why they appear.",
  "Keep the primary action visible and label it for the current mode.",
]

const dontGuidelines = [
  "Do not present local preview state as a real backend save.",
  "Do not silently reset values when switching modes, records, or leaving the form.",
  "Do not use a Create / Edit Form for application-wide preferences; use a Settings Form instead.",
  "Do not turn a long sequential workflow into one crowded record form; use a Multi-Step Wizard instead.",
  "Do not rely on color alone for validation or unsaved-state communication.",
]

export default function CreateEditFormPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Forms &amp; Settings</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Create / Edit Form</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A reusable form for creating and editing structured business records. Use one focused workspace to capture contact details, assignment, relationship, and follow-up information.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Create / Edit Form treats a business entity as one atomic record. Create mode starts a new draft; Edit mode loads a selected record and compares every field to its saved baseline. This preview uses deterministic fictional data stored only in React state.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Choose the right form pattern</CardTitle><CardDescription>Use the workflow, not the visual style, to choose between these templates.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Create / Edit Form</h3><p className="text-sm leading-relaxed text-muted-foreground">Creates or updates one business entity with record-level validation, conditional fields, and a saved baseline.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Settings Form</h3><p className="text-sm leading-relaxed text-muted-foreground">Changes application or workspace configuration and preferences, rather than creating a business record.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Multi-Step Wizard</h3><p className="text-sm leading-relaxed text-muted-foreground">Guides a long, sequential process where each step depends on information collected earlier.</p></div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Switch modes, select a demo record, change the record type, search company or owner options, and submit to explore validation and local save states.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6"><CreateEditForm /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}
          </div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">The template supports create and edit modes with the same grouped field structure. The primary action and baseline change with the current mode; conditional fields follow Record Type.</p>
          <Card><CardHeader><CardTitle className="text-base">Record form patterns</CardTitle><CardDescription>Compose only the fields relevant to the entity and workflow.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Required identity fields", "Searchable relationships", "Conditional customer / prospect fields", "Tags and contact preference", "Sticky action footer"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Validation and draft safety</CardTitle><CardDescription>Feedback stays tied to the values and current record.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Required name and email", "Email format and duplicate check", "Optional phone format", "First-error focus", "Dirty-state confirmation", "Session-local demo records"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}</CardContent></Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">The preview exposes the record lifecycle from a blank draft or selected saved record through validation, local saving, success, and explicit discard.</p>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Treat the form as a single record transaction: edits remain a draft until the user saves, while switching context requires a deliberate choice about those edits.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">Use a two-column grid only for short related fields on wide screens; keep textareas full width and collapse to one column on mobile. Keep Cancel, Reset Changes, and the primary action together in the sticky footer.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The form composes existing Parry UI controls for fields, grouped choices, searchable relationship pickers, confirmation, and feedback.</p>
          <div className="flex flex-wrap gap-2">{["badge", "button", "checkbox", "dialog", "input", "label", "popover", "radio-group", "select", "separator", "textarea", "toggle-group"].map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
