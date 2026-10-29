import type { Metadata } from "next"
import Link from "next/link"

import { TemplateDocumentationLayout } from "@/components/template-documentation-layout"
import { SettingsPanelsPreview } from "@/components/settings-panels-preview"
import { settingsPanelSections } from "@/lib/settings-panels-config"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Settings Panels · Templates · Parry UI",
  description: "A reusable, interactive workspace settings template for enterprise SaaS applications.",
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
  { title: "Page Header", text: "Identifies the workspace settings area and explains its purpose. An unsaved indicator appears when the active section has draft changes." },
  { title: "Section Navigation", text: "Groups configuration into General, Notifications, Preferences, and Security. Desktop uses a vertical navigation list; smaller screens use an accessible select." },
  { title: "Content Panel", text: "Displays one section at a time, with a concise section title and contextual description." },
  { title: "Form Controls", text: "Composes labeled inputs, textareas, selects, switches, radio groups, and checkboxes from the existing Parry UI primitives." },
  { title: "Save / Cancel Actions", text: "Saves or restores the active section only. Reset to Defaults updates the draft and can be reviewed before saving." },
  { title: "Feedback and Confirmation", text: "Inline validation, save feedback, unsaved-change prompts, and a destructive-action confirmation keep demo interactions explicit." },
]

const doGuidelines = [
  "Group related settings into sections with clear, concise descriptions.",
  "Save one section at a time and make it clear which values are still drafts.",
  "Keep labels visible and pair controls with helper text when the setting needs context.",
  "Validate required values inline and preserve the user's current section when validation fails.",
  "Use a separate confirmation for destructive or sensitive actions.",
]

const dontGuidelines = [
  "Do not mix unrelated settings into one long form.",
  "Do not silently discard edits when someone changes sections or presses Cancel.",
  "Do not rely on color alone for validation, saved state, or destructive warnings.",
  "Do not put essential form controls behind hover-only interactions.",
  "Do not present the demo actions as changes to a real workspace.",
]

const coreFeatures = [
  "Page header and section navigation",
  "Section-based configuration fields",
  "Save and cancel per section",
  "Required field validation",
  "Unsaved changes confirmation",
]

const optionalFeatures = [
  "Section descriptions",
  "Reset to Defaults",
  "Danger Zone action",
  "Sensitive action confirmation",
  "Save success feedback",
]

const interactionStates = [
  ["Default", "Each section opens with the last saved demo values."],
  ["Edited / Unsaved", "Editing a control shows an unsaved indicator and enables Save Changes and Cancel Changes."],
  ["Validation Error", "Clearing Workspace Name and saving displays a field-level message and prevents the save."],
  ["Saving", "Save Changes briefly enters a disabled Saving state before committing the active section locally."],
  ["Saved Successfully", "A success toast confirms the section was saved in this browser preview."],
  ["Disabled", "Workspace ID is read-only to demonstrate a disabled form control."],
  ["Destructive Confirmation", "The Security section opens a confirmation before its demo-only destructive action."],
]

export default function SettingsPanelsPage() {
  return (
    <TemplateDocumentationLayout items={toc}>
      
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Forms &amp; Settings</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Settings Panels</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A section-based settings workspace for managing complex application configurations. Explore the interactive preview, then adapt its sections and fields to your product.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Use Settings Panels when people need to configure multiple related areas without navigating away from one workspace. The template separates General, Notifications, Preferences, and Security while keeping the active section focused and scannable.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Its configuration is product-neutral: section definitions, field definitions, demo values, and validation are separated from the responsive layout. All preview actions use local React state only and do not change real product settings.
          </p>
          <div className="flex flex-wrap gap-2" aria-label="Included sections">
            {settingsPanelSections.map((section) => <Badge key={section.id} variant="outline">{section.title}</Badge>)}
          </div>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Edit settings, switch sections, reset defaults, and try the confirmation and validation states. Changes remain local to this preview.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <SettingsPanelsPreview />
          </div>
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
          <p className="leading-relaxed text-muted-foreground">Start with the page header, section navigation, settings content, and save/cancel behavior. Configure the section and field definitions to match a workflow, then add the optional confirmation and reset patterns as needed.</p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Core structure</CardTitle>
              <CardDescription>Recommended in every settings workspace</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {coreFeatures.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optional functionality</CardTitle>
              <CardDescription>Use when it supports the product workflow</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {optionalFeatures.map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">Each state is available through the interactive preview. Save and discard behavior is scoped to the active section.</p>
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
          <p className="leading-relaxed text-muted-foreground">Make each section easy to understand, keep changes reversible until saved, and announce validation and save feedback clearly.</p>
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
          <p className="text-sm leading-relaxed text-muted-foreground">On smaller screens, replace the vertical section navigation with a labeled select. Keep actions reachable after the fields and avoid horizontal scrolling for the form itself.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI primitives and one standard shadcn radio-group primitive; it does not introduce a separate visual language.</p>
          <div className="flex flex-wrap gap-2">
            {["badge", "button", "checkbox", "dialog", "input", "label", "radio-group", "select", "separator", "switch", "textarea"].map((name) => (
              <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>
            ))}
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
    </TemplateDocumentationLayout>
  )
}
