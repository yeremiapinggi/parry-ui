import type { Metadata } from "next"
import Link from "next/link"

import { DeveloperPortalWorkspace } from "@/components/developer-portal-workspace"
import { TemplateDocumentationLayout } from "@/components/template-documentation-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Developer Portal Workspace · Templates · Parry UI",
  description: "An Ivosights developer portal workspace for API applications, endpoint traffic, webhooks, and daily rate limits.",
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
  { title: "Application shell", text: "A light, developer-focused workspace for IvosightsDev with Overview, Apps, Webhooks, Usage, and Logs. Workspace selection, documentation, collapse behavior, the mobile navigation drawer, and account identity are part of the shared shell." },
  { title: "Overview and usage", text: "The overview pairs 30-day request, error-rate, and active-app metrics with an API usage trend, application summary, and a route-level request table for Sociomile, Ripple10, Cognivo, and Agentics." },
  { title: "Daily rate limits", text: "Each app shows today’s request count against its environment quota: 50,000 requests per day for production and 10,000 for development, with a progress meter and remaining capacity." },
  { title: "App directory and details", text: "Applications can be searched, filtered by environment, created, edited, opened in a detail drawer, or deleted with confirmation. Client IDs, masked demo secrets, redirect URIs, and app-linked webhook configuration are grouped in the details view." },
  { title: "Webhook and request inspection", text: "Webhook records show an owning application, event subscriptions, enabled state, and last delivery result. Logs support search, app/status/date filtering, sorting, pagination, and a detail drawer with redacted request metadata." },
]

const features = [
  "IvosightsDev developer workspace",
  "Collapsible desktop sidebar and mobile drawer",
  "Requests, error rate, and active-app KPIs",
  "7 / 30 / 90-day usage ranges",
  "Sociomile, Ripple10, Cognivo, and Agentics routes",
  "Endpoint requests, errors, methods, and share table",
  "Environment-aware daily request quotas",
  "Application search and environment filters",
  "Create / edit / delete applications",
  "Masked demo credentials with copy and rotation",
  "Webhook subscriptions and test outcomes",
  "Searchable, sortable, paginated request logs",
  "Request detail drawer with redacted JSON",
  "Consistent light-theme workspace preview",
]

const states = [
  ["Default Overview", "The IvosightsDev workspace opens with three sample apps, product endpoint activity, current-versus-previous request trends, and daily quota meters."],
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
    <TemplateDocumentationLayout items={toc}>
      
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Integrations</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Developer Portal Workspace</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">An Ivosights developer portal for managing API applications, monitoring product endpoints, and keeping daily request usage within quota.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={headingClass}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">The IvosightsDev workspace brings product API operations into one compact interface. Its sociomile-demo, IvoDevJNE, and IvosightsDev applications use simulated traffic for Sociomile tickets, Ripple10 mentions, Cognivo insights, and Agentics runs. Preview data stays in local component state and does not connect to live services.</p>
          <Card><CardHeader><CardTitle className="text-base">A product-aware developer workspace</CardTitle><CardDescription>Explore endpoint health, app environments, webhook activity, and daily request quotas without real credentials or backend services.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["Overview", "Apps", "Webhooks", "Usage", "Logs", "Endpoint analytics", "Daily rate limits", "Demo credentials"].map((label) => <Badge key={label} variant="secondary">{label}</Badge>)}</CardContent></Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={headingClass}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Navigate between sections, create apps, manage webhook settings, filter usage, review endpoint traffic, and compare daily quota. All controls operate on simulated local state.</p></div>
          <div className="rounded-lg border bg-background p-2 sm:p-4"><DeveloperPortalWorkspace /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={headingClass}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={headingClass}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">The sample uses Ivosights product routes and environment-aware app quotas. Endpoint names, webhook events, and demo data can be adapted to each API’s published contract.</p>
          <Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle><CardDescription>Every listed interaction remains local to the preview session.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
          <div className="grid gap-3 md:grid-cols-3">{[
            { title: "Sociomile", text: "Track ticket queues and app environments alongside request volume. Keep OAuth clients and production credentials scoped to the owning workspace." },
            { title: "Ripple10 + Cognivo", text: "Review mention collection and insight-generation endpoints with response errors and request share visible at a glance." },
            { title: "Agentics", text: "Monitor run submissions against development or production quotas, then trace individual request IDs in the log explorer." },
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
    </TemplateDocumentationLayout>
  )
}
