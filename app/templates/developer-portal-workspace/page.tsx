import type { Metadata } from "next"
import Link from "next/link"

import { DeveloperPortalWorkspace } from "@/components/developer-portal-workspace"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Developer Portal Workspace · Templates · Parry UI",
  description: "A developer workspace for managing API applications, credentials, webhooks, usage, and request logs.",
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
  { title: "Application shell", text: "A branded sidebar hosts Overview, Apps, Webhooks, Usage, and Logs. Workspace selection, documentation, theme switching, collapse behavior, the mobile navigation drawer, and account identity are part of the shared shell." },
  { title: "Overview and usage", text: "A deterministic request dataset drives period totals, error rates, current-versus-previous trend lines, application and endpoint breakdowns, and HTTP status distribution. Date and app filters are applied before every usage calculation." },
  { title: "App directory and details", text: "Applications can be searched, filtered by environment, created, edited, opened in a detail drawer, or deleted with confirmation. Client IDs, masked demo secrets, redirect URIs, and app-linked webhook configuration are grouped in the details view." },
  { title: "Webhook management", text: "Endpoint records contain an owning application, destination URL, subscribed events, enabled state, and last delivery result. Success and failure test actions update endpoint status and add a simulated request log." },
  { title: "Request inspection", text: "Logs support search, app/status/date filtering, sortable columns, pagination, and a request detail drawer. Authorization and sensitive sample values are redacted in readable JSON metadata." },
]

const features = [
  "Responsive developer-tool shell",
  "Collapsible desktop sidebar and mobile drawer",
  "Overview KPIs with period comparison",
  "7 / 30 / 90-day usage ranges",
  "Application search and environment filters",
  "Create / edit / delete applications",
  "Masked demo credentials with copy and rotation",
  "Webhook subscriptions and test outcomes",
  "Application, endpoint, and status breakdowns",
  "Searchable, sortable, paginated request logs",
  "Request detail drawer with redacted JSON",
  "Light / dark theme control",
]

const states = [
  ["Default Overview", "The workspace opens with three fictional applications, API activity, and current-versus-previous period comparison."],
  ["Application Created / Empty List", "Create a demo app and it appears in the directory and overview. Deleting all apps presents an explicit empty state with a create action."],
  ["Credentials Hidden / Revealed", "The client secret is masked by default. Reveal, copy, and regenerate require deliberate actions; regeneration has a confirmation step."],
  ["Webhook Active / Disabled", "The endpoint switch changes enabled state. Success and failure simulations update the delivery status and show response details."],
  ["Usage Filtered", "Date range and application filters recalculate metrics, trend points, app and endpoint rankings, and status distribution from the same dataset."],
  ["Log Detail / No Results", "Open a request by selecting its ID. Search and filters can produce a no-results state with a clear-filters action."],
  ["Loading / Error", "Refresh briefly shows loading skeletons. The log actions menu can display a retryable simulated API error without losing filters."],
]

const components = ["application-shell", "avatar", "badge", "button", "card", "chart", "checkbox", "dialog", "dropdown-menu", "input", "label", "select", "sheet", "skeleton", "switch", "table", "textarea"]

export default function DeveloperPortalWorkspacePage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Developer Tools</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Developer Portal Workspace</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A developer workspace for managing API applications, credentials, webhooks, usage, and request logs.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={headingClass}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Developer Portal Workspace brings common API platform operations into one compact interface. Its fictional application, usage, webhook, and log data are coordinated in local component state for safe interaction in the preview. It does not connect to an API provider, persist credentials, or send webhook requests.</p>
          <Card><CardHeader><CardTitle className="text-base">A shared demo workspace</CardTitle><CardDescription>Explore the complete navigation flow without real credentials or backend services.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Overview", "Apps", "Webhooks", "Usage", "Logs", "Local-only state", "Demo credentials"].map((label) => <Badge key={label} variant="secondary">{label}</Badge>)}</CardContent></Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={headingClass}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Navigate between sections, create apps, manage webhook settings, filter usage, and open request details. All controls operate on simulated local state.</p></div>
          <div className="rounded-lg border bg-background p-2 sm:p-4"><DeveloperPortalWorkspace /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={headingClass}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={headingClass}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">The sample is configured for a fictional API platform. Adapt the labels, event catalog, credential shape, and status metrics to match an identity service, payment API, data platform, or internal developer portal.</p>
          <Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>Every listed interaction remains local to the preview session.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
          <div className="grid gap-3 md:grid-cols-3">{[
            { title: "Identity platform", text: "Replace application fields with OAuth client types, allowed grants, scopes, and redirect URI validation. Keep test credentials clearly separated from production secrets." },
            { title: "Payments API", text: "Swap event names and endpoint breakdowns for payment, customer, and invoice resources. Use webhook delivery attempts and request IDs that match the payment platform’s conventions." },
            { title: "Internal API catalog", text: "Use app ownership, environment, and endpoint metadata to support service teams. Add ownership and access policies before connecting real services." },
          ].map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={headingClass}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={headingClass}>Usage Guidelines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Configuration guidance</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Replace the fictional app list with data from your platform’s application registry.</li><li>Define environment values, callback URL rules, event names, status families, and retention windows to match the API contract.</li><li>Keep credential issuance and secret rotation on trusted server endpoints; show secrets only when the platform’s security model permits.</li><li>Apply authorization checks to every app, webhook, and log query before connecting a real backend.</li><li>Redact tokens, personal data, and sensitive payload fields before writing request metadata to logs.</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Demo boundaries</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Sample credentials use a visibly fictional demo prefix and are never accepted by an external API.</li><li>Create, edit, and delete operations update only React state and reset when the preview is closed.</li><li>Webhook tests simulate HTTP outcomes; they do not contact the displayed URL.</li><li>Usage metrics are deterministic demo aggregates and should not be treated as operational reporting.</li><li>Add persistence, server-side input validation, and appropriate access control before production use.</li></ul></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Responsive and accessible review</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">The sidebar collapses on desktop and becomes a modal drawer on mobile. Data tables remain horizontally scrollable, filters retain labels, actions expose accessible names, dialogs and drawers manage focus, and status is communicated through text as well as semantic color.</p></CardContent></Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={headingClass}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The workspace reuses Application Shell navigation primitives and Parry UI semantic tokens with shadcn components for data tables, filters, charts, confirmations, and detail drawers.</p>
          <div className="flex flex-wrap gap-2">{components.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
