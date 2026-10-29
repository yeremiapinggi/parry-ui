import type { Metadata } from "next"
import Link from "next/link"

import { TabbedDetailWorkspacePreview } from "@/components/tabbed-detail-workspace-preview"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TemplateDocumentationLayout } from "@/components/template-documentation-layout"

export const metadata: Metadata = {
  title: "Tabbed Detail Workspace · Templates · Parry UI",
  description: "A reusable multi-tab workspace for managing record details, configuration, activity, and access permissions.",
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

const headingClass = "scroll-mt-24 font-heading text-2xl font-semibold tracking-tight"

const anatomy = [
  ["Workspace header", "Breadcrumbs, identity, description, status, and record actions keep context visible across every tab."],
  ["Overview", "A concise summary surfaces ownership, visibility, key settings, related workspaces, and quick links to deeper sections."],
  ["Configuration", "Grouped fields and toggles edit workspace settings with validation and an explicit save-or-cancel flow."],
  ["Activity", "A chronological record of workspace, configuration, and access changes can be filtered by event type."],
  ["Access & permissions", "Members, role descriptions, invitations, and removal controls make access changes legible and immediate."],
]

const states = [
  ["Default / Active", "A fictional workspace starts in the overview with active status and seeded details."],
  ["Archived", "The preview selector loads an archived workspace; restore returns it to Active and adds an activity entry."],
  ["View / Edit", "Edit Details opens a controlled form. Saving updates the same workspace shared by the overview, list, and activity history."],
  ["Unsaved changes", "Leaving a dirty Configuration tab or closing the gallery preview asks before discarding edits."],
  ["Validation error", "An invalid workspace code or retention period is announced inline and blocks a save until corrected."],
  ["Loading / Not found", "The preview selector exposes accessible loading skeletons and a not-found recovery action."],
  ["Empty activity", "An empty timeline explains when events will appear; filtered timelines can be reset to all activity."],
  ["Permission updated", "Role changes apply immediately, update the access list, and create an activity event."],
  ["Deleted", "Deletion requires confirmation, removes the record from the demo list, and provides a restore-samples empty state."],
]

const components = ["avatar", "badge", "button", "dialog", "dropdown-menu", "input", "label", "select", "separator", "switch", "tabs", "textarea", "toast"]

export default function TabbedDetailWorkspaceTemplate() {
  return (
    <TemplateDocumentationLayout items={toc}>
      
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Layouts &amp; Details</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Tabbed Detail Workspace</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A multi-tab workspace for viewing and managing complex record information, configurations, and related activities.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={headingClass}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Tabbed Detail Workspace gives one complex record a consistent home while separating overview, configuration, activity, and access into focused work areas. The deterministic fictional data lives in local React state; no backend or external service is connected.</p>
          <div className="grid gap-3 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">Record Detail Page</CardTitle><CardDescription>Simple, single-page record details.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Use for one entity whose identity, metadata, relationships, and recent activity fit naturally in one view.</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Tabbed Detail Workspace</CardTitle><CardDescription>Multiple functional sections for one record.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Use when the record has distinct, substantial areas such as configuration, permissions, and long-running activity.</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Settings Panels</CardTitle><CardDescription>Workspace-level configuration management.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Use for product or account preferences that are not owned by one specific business record.</p></CardContent></Card>
          </div>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={headingClass}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Edit the workspace, switch tabs, change permissions, and inspect the supported edge states.</p></div>
          <div className="rounded-xl border bg-background p-3 sm:p-5"><TabbedDetailWorkspacePreview /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading"><h2 id="anatomy-heading" className={headingClass}>Anatomy</h2><div className="grid gap-3 sm:grid-cols-2">{anatomy.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div></section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading"><h2 id="features-heading" className={headingClass}>Features &amp; Variants</h2><p className="leading-relaxed text-muted-foreground">The page keeps the record header stable while its main panel changes. Edits and actions share record state, and meaningful changes add entries to the activity timeline.</p><Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>All content is fictional and persisted in component state only.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Persistent header", "Four navigable tabs", "Edit details", "Configuration validation", "Unsaved-change confirmation", "Activity filters", "Add and remove access", "Immediate role updates", "Duplicate / archive / restore", "Confirmed deletion", "Related workspace navigation", "Loading and empty states"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card></section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading"><h2 id="states-heading" className={headingClass}>Interaction States</h2><div className="grid gap-3 sm:grid-cols-2">{states.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div></section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading"><h2 id="guidelines-heading" className={headingClass}>Usage Guidelines</h2><div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Use tabs for genuinely distinct, repeatable work areas on the same record.</li><li>Keep identity, status, and record-level actions stable above the tab content.</li><li>Show clear validation and confirm before discarding edited configuration.</li><li>Describe what each permission role can do, not only its name.</li></ul></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Do not split a short record summary into tabs without enough content to justify them.</li><li>Do not use this pattern as a replacement for a collection table or workspace-wide settings page.</li><li>Do not rely on status color alone or imply that local preview edits are persisted remotely.</li><li>Do not bury destructive actions or remove access without clear confirmation.</li></ul></CardContent></Card></div><Card><CardHeader><CardTitle className="text-base">Responsive behavior</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Tabs remain in a four-column row on small screens with shorter visible labels; the full names remain accessible. Metadata and access rows reflow into compact stacked layouts without horizontal scrolling.</p></CardContent></Card></section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading"><h2 id="components-heading" className={headingClass}>Components Used</h2><p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI primitives and local demo data; no dependency or persistence service is required.</p><div className="flex flex-wrap gap-2">{components.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-sm text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div><Separator /><p className="text-sm text-muted-foreground">Compare the <Link href="/templates/record-detail-page" className="font-medium text-link hover:underline">Record Detail Page</Link> for simpler records or <Link href="/templates/settings-panels" className="font-medium text-link hover:underline">Settings Panels</Link> for workspace-level preferences. Browse all <Link href="/templates" className="font-medium text-link hover:underline">templates</Link>.</p></section>
    </TemplateDocumentationLayout>
  )
}
