import type { Metadata } from "next"
import Link from "next/link"

import { DocsToc } from "@/components/docs-nav"
import { SettingsDialogPreview } from "@/components/settings-dialog-preview"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Settings Dialog · Templates · Parry UI",
  description: "A contextual settings dialog for managing preferences without leaving the current page.",
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
  { title: "Workspace Context", text: "The overview remains visible behind the modal, including a concise summary of saved notification and display preferences." },
  { title: "Dialog Header", text: "A clear title, short explanation, and explicit close action orient users without taking them away from their current task." },
  { title: "Notification Settings", text: "Email delivery, frequency, and notification topics stay together. Turning delivery off disables dependent controls while preserving their selections." },
  { title: "Display Preferences", text: "Default view and compact mode provide a small, related set of contextual display controls." },
  { title: "Sticky Actions", text: "Cancel and Save Changes remain available beneath the scrollable form. Save is disabled until a valid change is made." },
  { title: "Discard Confirmation", text: "Unsaved edits are protected for Cancel, the header close action, Escape, and outside clicks. Confirmation replaces the form content instead of adding another modal layer." },
]

const interactionStates = [
  ["Closed", "The workspace overview and Manage Preferences action are visible. The dialog does not open automatically."],
  ["Open / Default", "The dialog opens with the latest saved demo values and moves keyboard focus to its heading."],
  ["Edited / Unsaved", "Changing a setting creates a draft and enables Save Changes."],
  ["Validation Error", "Saving with notifications enabled and no topics selected shows an inline field-level message and prevents saving."],
  ["Disabled Fields", "Turning off email notifications disables frequency and topic controls without clearing their draft values."],
  ["Saving / Success", "The save button communicates progress. On success, the dialog closes, the overview summary updates, and a toast confirms the change."],
  ["Discard Confirmation", "Cancel, Close, Escape, and outside click ask before discarding. Keep Editing returns to the draft; Discard Changes restores the saved values."],
]

const doGuidelines = [
  "Use a dialog for a short, focused set of preferences related to the current task.",
  "Keep the title, consequence, and primary save action clear and specific.",
  "Preserve dependent choices when temporarily disabling their parent setting.",
  "Protect unsaved work consistently across every dismissal method.",
  "Return focus to the trigger and update the page context after a successful save.",
]

const dontGuidelines = [
  "Do not put a long form or complex multi-section configuration in a dialog.",
  "Do not hide important context that users need while making a decision.",
  "Do not silently discard a draft on Escape, outside click, or Cancel.",
  "Do not nest a second confirmation modal inside the settings dialog.",
  "Do not describe local demo state as a server-side save.",
]

export default function SettingsDialogPage() {
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
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Settings Dialog</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A contextual settings dialog for managing preferences without leaving the current page. Use this pattern for a short, focused set of choices that should stay close to the workspace context.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Settings Dialog keeps a user on the current page while they edit notification and display preferences. The live preview starts on Workspace Overview; users open the dialog only when they choose Manage Preferences. Draft values are kept in React state, validated before saving, and reflected in the overview summary after success.
          </p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choosing a settings pattern</CardTitle>
              <CardDescription>Pick the surface that matches the scope and complexity of the configuration.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Settings Panels</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Complex configuration organized by section navigation, usually with independently saved panels.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Settings Form</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Single-page configuration where related values are reviewed and saved together with one action.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Settings Dialog</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">A short contextual configuration flow that opens over the current page and returns users to it after saving.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Open Manage Preferences to edit the demo. Turn off email to test disabled controls, remove all topics to see validation, and try each close path with unsaved edits.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <SettingsDialogPreview />
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
          <p className="leading-relaxed text-muted-foreground">The core pattern pairs a concise settings form with the page it affects. Keep the dialog focused, scroll its content independently when needed, and leave a clear Cancel and Save Changes action in the footer.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>Interaction patterns demonstrated in the live preview</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Controlled draft", "Field-level validation", "Disabled dependent controls", "Save progress", "Updated page summary", "Unsaved-change protection", "Focus restoration"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <p className="text-sm leading-relaxed text-muted-foreground">For a small number of fields, keep the dialog compact. If controls need more room, let the form region scroll while preserving the header and footer.</p>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
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
          <p className="leading-relaxed text-muted-foreground">A dialog is appropriate when the user can make a focused decision and return to the underlying task without losing context.</p>
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
          <Card>
            <CardHeader><CardTitle className="text-base">When a dialog is unsuitable</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-muted-foreground">Choose a dedicated settings page or Settings Panels for long forms, many unrelated fields, complex multi-section configuration, deep navigation, or workflows that need persistent context. Repeatedly scrolling a large dialog makes orientation and keyboard navigation harder.</p></CardContent>
          </Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The preview composes existing Parry UI primitives and keeps the settings form inside a single accessible dialog.</p>
          <div className="flex flex-wrap gap-2">
            {["badge", "button", "checkbox", "dialog", "label", "select", "separator", "switch"].map((name) => (
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
