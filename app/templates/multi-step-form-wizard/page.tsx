import type { Metadata } from "next"
import Link from "next/link"

import { DocsToc } from "@/components/docs-nav"
import { MultiStepFormWizard } from "@/components/multi-step-form-wizard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Multi-Step Form Wizard · Templates · Parry UI",
  description: "A guided multi-step form for complex configurations with validation, progress tracking, and browser-local demo drafts.",
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
  { title: "Wizard Header", text: "Sets the integration-creation context and explains that this is a local demo." },
  { title: "Progress Stepper", text: "Shows completed, active, and upcoming steps. Only the current step and previously completed steps can be opened." },
  { title: "Step Content", text: "Groups only the fields relevant to the current stage, with concise guidance and inline validation." },
  { title: "Conditional Credentials", text: "Authentication choice reveals the API key or OAuth fields; secrets stay masked in the form and review." },
  { title: "Sticky Action Bar", text: "Keeps Back, Save Draft, and Continue or Create Integration available while the content scrolls." },
  { title: "Review and Completion", text: "Summarizes entered values with Edit actions, then reports local demo completion without claiming a real integration was created." },
]

const interactionStates = [
  ["Initial / Empty", "Starts at Basic Information with an empty required integration name and no saved draft."],
  ["In Progress", "Changing values marks the draft unsaved and preserves entries when moving between steps."],
  ["Validation Error", "Continue identifies missing or invalid values, displays inline feedback, and focuses the first invalid field."],
  ["Step Completed", "Validated steps receive a completion mark and remain available from the stepper."],
  ["Testing Connection", "The test button displays a pending state while the demo evaluates the URL locally."],
  ["Test Success / Failure", "A successful local test unlocks Review. A demo-only checkbox lets you preview a failure and retry."],
  ["Draft Saved / Restored", "Save Draft stores the wizard position and entered demo values in browser storage; reopening restores them."],
  ["Unsaved Changes", "Closing the gallery preview asks whether to keep editing or discard changes; the browser also warns before leaving."],
  ["Review", "Read-only details include masked credentials and Edit actions that return to the relevant step."],
  ["Submission Success", "The wizard confirms local demo completion, clears the saved draft, and states that no real integration was created."],
]

const doGuidelines = [
  "Use a wizard when a configuration has distinct stages, dependencies, or a validation gate such as a connection test.",
  "Keep each step focused and explain why its fields are needed before asking users to continue.",
  "Allow users to revisit completed steps, but prevent skipping ahead past required validation.",
  "Make draft persistence and the handling of sensitive values clear before users enter credentials.",
  "Offer a final review when users need to verify multiple configuration choices together.",
]

const dontGuidelines = [
  "Do not split a short, independent form into steps just to make it look guided.",
  "Do not silently discard edits when closing a wizard or navigating away.",
  "Do not mark a connection as verified when the test only runs local demo validation.",
  "Do not expose API keys or client secrets in review summaries or success messages.",
  "Do not let users bypass required validation or a required successful test.",
]

export default function MultiStepFormWizardPage() {
  return (
    <main className="w-full bg-card text-card-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Forms</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Multi-Step Form Wizard</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A guided multi-step form for completing complex configurations with validation and progress tracking. Use the live preview to step through a complete integration setup, save a browser-local demo draft, and review the result before completion.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            The wizard divides integration setup into Basic Information, Configuration, Test Connection, and Review &amp; Confirm. Each step validates its own required inputs, completed steps remain editable, and later stages stay locked until their prerequisites are met.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            This preview is a client-side demonstration. Drafts, including masked credential values, are stored in this browser only; the connection test sends no request, and the final action does not create a real integration.
          </p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wizard vs. Create / Edit Form</CardTitle>
              <CardDescription>Choose the pattern based on the work users need to complete.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Use a wizard</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">When setup has meaningful stages, conditional fields, step-specific validation, or a required checkpoint. Step navigation keeps progress visible, while draft handling protects longer tasks.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Use Create / Edit Form</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">When users can understand and complete the fields together on one page, and a single validation and save action is easier than step-by-step progression.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Try required-field validation, conditional credentials, the simulated test outcomes, step navigation, review, draft save and restore, and reset confirmation. Use demo values only.</p>
          </div>
          <div className="rounded-lg border bg-card p-3 sm:p-6">
            <MultiStepFormWizard />
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
          <p className="leading-relaxed text-muted-foreground">Keep the guided sequence, per-step validation, and persistent action bar as the core. Add stages only when they represent real decisions or dependencies, and keep the review and draft behaviors aligned with the product’s persistence model.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Core structure</CardTitle><CardDescription>Recommended for longer, dependent configuration flows</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Four ordered steps", "Conditional credential fields", "Per-step validation", "Review before completion", "Sticky actions"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Interaction patterns</CardTitle><CardDescription>Use where the workflow needs them</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Completed-step navigation", "Masked secrets", "Demo test outcomes", "Browser-local draft", "Unsaved-change confirmation", "Reset confirmation"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">The preview supports the complete lifecycle from an empty form through validation, draft recovery, testing, review, and local demo completion.</p>
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
          <p className="leading-relaxed text-muted-foreground">A wizard should reduce cognitive load, not add ceremony. Use progress, validation, and draft handling to make long tasks easier to understand and recover.</p>
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
          <p className="text-sm leading-relaxed text-muted-foreground">For production workflows, persist drafts securely on the server and avoid browser storage for credentials. On small screens, keep the stepper readable and let the sticky action bar wrap into a compact vertical layout.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The wizard composes Parry UI form controls, dialog primitives, badges, and buttons, with local state for step progression and demo persistence.</p>
          <div className="flex flex-wrap gap-2">
            {["badge", "button", "checkbox", "dialog", "input", "label", "select", "textarea"].map((name) => (
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
    </main>
  )
}
