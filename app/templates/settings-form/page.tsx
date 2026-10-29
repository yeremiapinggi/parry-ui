import type { Metadata } from "next"
import Link from "next/link"

import { DocsToc } from "@/components/docs-nav"
import { SettingsFormPreview } from "@/components/settings-form-preview"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Settings Form · Templates · Parry UI",
  description: "A single-page settings form for managing preferences and configuration.",
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
  { title: "Page Header", text: "Names the settings page and shows an unsaved indicator only while the current values differ from the saved baseline." },
  { title: "Workspace Information", text: "Collects a required workspace name, optional description, default language, and timezone." },
  { title: "Notifications", text: "Groups email delivery, frequency, and alert preferences. Dependent controls are disabled while email notifications are off, and their selections are preserved." },
  { title: "Preferences", text: "Controls the initial workspace view, display density, and automatic refresh behavior." },
  { title: "Form-wide Actions", text: "One Save Changes action validates and saves every section together; Cancel restores the most recently saved values after confirmation." },
  { title: "Feedback and Confirmation", text: "Field-level errors, a local saving state, success feedback, and discard prompts keep the form state clear." },
]

const interactionStates = [
  ["Default", "The form loads fictional demo values and the save action remains disabled until a setting changes."],
  ["Edited / Unsaved", "Changing any field shows an Unsaved Changes indicator and enables Save Changes and Cancel."],
  ["Validation Error", "Saving a blank or whitespace-only workspace name focuses the field and shows an inline required error."],
  ["Disabled Fields", "Turning off email notifications disables frequency and alert preferences without clearing their values."],
  ["Saving", "The action buttons are disabled while the local demo values are written to browser storage."],
  ["Save Success", "A toast confirms the settings were saved in this browser preview; no external service is contacted."],
  ["Discard Confirmation", "Cancel and app-controlled navigation ask before restoring the latest saved values or leaving the form."],
]

const doGuidelines = [
  "Use a single page when settings are related and can be reviewed together.",
  "Group fields by purpose and provide concise descriptions where context helps.",
  "Validate the entire form before saving and keep errors next to their field.",
  "Preserve dependent values when a parent preference is temporarily disabled.",
  "Make it clear whether changes are local, saved, or still drafts.",
]

const dontGuidelines = [
  "Do not mix section-level saves into a form intended to save atomically.",
  "Do not silently discard edits when Cancel or controlled navigation is used.",
  "Do not clear dependent preferences when notifications are switched off.",
  "Do not present local demo persistence as a real backend save.",
  "Do not rely on color alone to communicate an error or unsaved state.",
]

export default function SettingsFormPage() {
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
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Settings Form</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A single-page settings form for managing preferences and configuration. Use the live preview to edit workspace details, notification choices, and display preferences together.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Settings Form presents related configuration in one vertically scrolling page with a single Save Changes action for the entire form. The demo uses realistic fictional workspace values and keeps its persistence local to this browser.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Choose this template when users benefit from reviewing and saving related preferences together. If settings require separate ownership or independent save behavior, use dedicated settings panels instead.
          </p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings Form vs. Settings Panels</CardTitle>
              <CardDescription>Choose a pattern based on how configuration is organized and saved.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Settings Form</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">A single vertically scrolling form with one Save Changes action for the entire page.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Settings Panels</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Multiple configuration sections with dedicated section navigation and save-per-section behavior.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Edit fields, test conditional notification controls, clear the required workspace name to see validation, and try Save or Cancel. All changes stay in this browser preview.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <SettingsFormPreview />
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
          <p className="leading-relaxed text-muted-foreground">Keep the page header, grouped settings, form-wide validation, and one save/cancel action as the core. Add or remove fields to suit a product while retaining predictable draft and saved states.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Core structure</CardTitle><CardDescription>Recommended for every single-page settings form</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Workspace information", "Notifications", "Preferences", "Form-wide validation", "Save and cancel together"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Interaction patterns</CardTitle><CardDescription>Use only when they match the setting behavior</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Conditional dependent fields", "Browser-local demo persistence", "Unsaved-change confirmation", "Field-level errors", "Save success feedback"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">The preview exposes the complete lifecycle from the saved baseline through editing, validation, saving, and discard confirmation.</p>
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
          <p className="leading-relaxed text-muted-foreground">Keep related settings together, make draft state visible, and explain what happens when a change is saved or discarded.</p>
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
          <p className="text-sm leading-relaxed text-muted-foreground">On narrow screens, keep the form in one column, let field controls use the available width, and keep Save and Cancel after the final settings group.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI form controls and feedback primitives without introducing another visual language.</p>
          <div className="flex flex-wrap gap-2">
            {["badge", "button", "checkbox", "dialog", "input", "label", "radio-group", "select", "separator", "switch", "textarea"].map((name) => (
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
