import type { Metadata } from "next"
import Link from "next/link"

import { IntegrationConnectionPreview } from "@/components/integration-connection"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DocsToc } from "@/components/docs-nav"

export const metadata: Metadata = {
  title: "Integration Connection · Templates · Parry UI",
  description: "Configure, test, and manage external service connections and authentication.",
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

const headingClass = "scroll-mt-24 font-data text-2xl font-semibold tracking-tight"

const anatomy = [
  ["Page header", "Names the connection workspace, describes its purpose, and gives a prominent Add Connection action."],
  ["Search and status filters", "Find a connection by name or narrow the list to All, Connected, Disconnected, or Error."],
  ["Connection record", "Combines endpoint identity, type, authentication method, current status, and last-tested time."],
  ["Contextual actions", "Edit, test, reconnect, disconnect, and delete actions stay attached to the connection they affect."],
  ["Configuration dialog", "Collects endpoint settings and reveals only the credential fields needed by the selected authentication method."],
  ["Test feedback", "Shows loading, simulated success, or actionable simulated failure while preserving the configuration draft."],
]

const states = [
  ["Connected", "Seeded demo connections show a successful status and a last-tested label."],
  ["Disconnected", "An untested saved configuration starts disconnected; disconnecting keeps its configuration available."],
  ["Connection error", "The fictional offline endpoint starts in Error. Reconnect reruns the deterministic local simulation."],
  ["Empty list", "Delete all demo records to see the first-connection empty state and its restore-samples action."],
  ["No search results", "Search for an unmatched name or combine a search with a status filter, then clear both."],
  ["Adding and editing", "The same dialog creates or updates a record, with authentication fields changing dynamically."],
  ["Validation error", "Test an incomplete draft to reveal field-level guidance. Duplicate names and invalid URLs are rejected."],
  ["Testing, success, and failed", "A brief loading state ends with an explicit local-only result. Editing any field clears the result."],
  ["Unsaved changes", "Cancel or close a changed form to choose whether to keep editing or discard the draft."],
  ["Delete confirmation", "Delete and disconnect actions require a clear confirmation before changing the shared demo dataset."],
]

const components = ["alert", "badge", "button", "card", "dialog", "dropdown-menu", "input", "label", "select", "separator", "textarea", "toggle-group", "toast"]

export default function IntegrationConnectionTemplate() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Integration</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-data text-4xl font-bold tracking-tight text-balance">Integration Connection</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">Configure, test, and manage external service connections and authentication.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={headingClass}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Integration Connection is a reusable management surface for service endpoints and their authentication configuration. It includes a searchable connection list, lifecycle actions, dynamic credential fields, local validation, and simulated test feedback. Demo data and credentials live only in React state; testing never sends a request or claims a real connection.</p>
          <div className="grid gap-3 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">Integration Connection</CardTitle><CardDescription>Connection records with testable lifecycle states.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Use when each configured service needs its own endpoint, authentication method, connection status, and test or reconnect actions.</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Multi-Step Form Wizard</CardTitle><CardDescription>A guided sequence for one configuration task.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Use for onboarding or setup that benefits from ordered steps, progress, and a final review. It does not manage a collection of reusable connections or their later lifecycle.</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Settings Form</CardTitle><CardDescription>One page of stable workspace preferences.</CardDescription></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Use for settings owned by an account or workspace. It is not designed for multiple endpoint records, dynamic authentication credentials, or simulated connection testing.</p></CardContent></Card>
          </div>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={headingClass}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Create or edit a connection, switch authentication methods, run a simulated test, and try the lifecycle actions.</p></div>
          <div className="rounded-xl border bg-background p-3 sm:p-5"><IntegrationConnectionPreview /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={headingClass}>
            Anatomy
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomy.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}
          </div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={headingClass}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">Connection type and authentication method are independent choices. The credential area adapts to None, API Key, Basic Auth, or OAuth 2.0; saved secrets remain masked while editing, and an empty secret input preserves its existing value when the method has not changed.</p>
          <Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>All records and test outcomes are fictional and session-local.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Search by name", "Four status filters", "Create and edit", "Duplicate-name prevention", "Dynamic auth fields", "Masked saved secrets", "Required field validation", "Simulated test loading", "Success and actionable failure", "Result invalidation on edits", "Disconnected untested save", "Reconnect and disconnect", "Confirmed delete", "Unsaved-change warning", "Empty and no-results states"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={headingClass}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={headingClass}>Usage Guidelines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>State clearly whether a test is simulated or contacts a real service.</li><li>Keep endpoint, authentication method, status, and last-tested time visible together.</li><li>Mask credentials and explain how saved values behave during edits.</li><li>Confirm destructive actions and provide recovery guidance for failed tests.</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Do not imply a connection exists before a real server-side check succeeds.</li><li>Do not log, expose, or transmit secrets from client-side form state.</li><li>Do not show credential fields unrelated to the selected authentication method.</li><li>Do not use status color alone; include a readable status label.</li></ul></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Responsive behavior</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">The connection cards and their metadata stack on narrow screens. The configuration dialog fills the available mobile viewport, keeps its heading and action footer visible, and scrolls the form body independently.</p></CardContent></Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={headingClass}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI primitives and fictional local data. No persistence service, OAuth flow, or external API is configured.</p>
          <div className="flex flex-wrap gap-2">{components.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-sm text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Compare the <Link href="/templates/multi-step-form-wizard" className="font-medium text-link hover:underline">Multi-Step Form Wizard</Link> for sequenced setup or <Link href="/templates/settings-form" className="font-medium text-link hover:underline">Settings Form</Link> for workspace preferences. Browse all <Link href="/templates" className="font-medium text-link hover:underline">templates</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
