import type { Metadata } from "next"
import Link from "next/link"

import { DeveloperPortal } from "@/components/developer-portal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DocsToc } from "@/components/docs-nav"

export const metadata: Metadata = {
  title: "Developer Portal · Templates · Parry UI",
  description: "A developer console for apps, OAuth and API key access, scopes, webhooks, usage analytics, and logs.",
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
  ["Shell", "A dark sidebar groups Overview, Access (Apps), Realtime (Webhooks), and Monitoring (Usage, Logs). Below the lg breakpoint a section selector in the top bar replaces it."],
  ["Overview", "30-day requests, error rate, and app count, a usage chart, and an app list that opens each app's detail."],
  ["Apps", "A table of apps with environment, auth method, and scopes. The detail view has Overview, Authentication, and Scopes tabs."],
  ["Authentication", "OAuth apps show the client ID, a masked secret with Rotate, grant types, and redirect URIs. API key apps list keys with their own scopes, expiry, and Revoke."],
  ["Scopes", "A product × access matrix for Cognivo, Sociomile, Ripple10, and Agentics. Write includes read, and keys can never exceed their app."],
  ["Webhooks", "Endpoints per app with event subscriptions limited to the app's scopes, a signing secret, pause/resume, and a delivery log with test sends."],
  ["Usage", "Range, app, and product filters drive stat cards, a requests chart, a per-endpoint breakdown, and daily rate-limit meters."],
  ["Logs", "Searchable, filterable, paginated request log with a detail dialog showing masked headers and sample bodies, plus a live tail toggle."],
]

const states = [
  ["Validation", "App, key, redirect URI, and webhook forms show inline errors linked with aria-describedby and focus the first invalid field."],
  ["One-time secrets", "New client secrets, API keys, and signing secrets appear once with Copy. Afterward only the last four characters are shown."],
  ["Scope narrowing", "Unchecking an app scope warns how many active keys lose access, then trims those keys on save."],
  ["Disabled scopes", "In the key dialog, scopes the app lacks are disabled with a tooltip explaining why."],
  ["Revoked key", "Stays listed as Revoked for audit, with no further actions."],
  ["Paused endpoint", "Shows Paused in the list, and the test send is disabled with a reason."],
  ["Failed delivery", "An endpoint URL containing \"fail\" returns a simulated 500, shown as \"500 Failed\" rather than color alone."],
  ["Empty states", "No apps, no endpoints, a usage filter with no traffic, and a log search with no results each explain what to do next."],
  ["Live tail", "Adds a simulated request every 2.5 seconds while on. It stops when toggled off or when you leave the section."],
  ["Unsaved changes", "Open forms with edits mark the gallery preview dirty, so closing the preview asks before discarding."],
]

const components = ["alert", "badge", "button", "card", "chart", "checkbox", "dialog", "dropdown-menu", "input", "label", "radio-group", "select", "switch", "table", "tabs", "textarea", "toggle-group", "tooltip", "toast"]

export default function DeveloperPortalPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Integration</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-data text-4xl font-bold tracking-tight text-balance">Developer Portal</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A developer console for apps, OAuth and API key access, scopes, webhooks, usage analytics, and logs.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={headingClass}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Developer Portal is the self-service surface where developers build on Ivosights products. They create apps, choose OAuth 2.0 or API keys, limit each app to scopes on Cognivo, Sociomile, Ripple10, and Agentics, subscribe webhooks to real-time events, and monitor usage and request logs. All data is fictional and lives in React state. Nothing in the preview sends a request.</p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={headingClass}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Create an app, add a key or redirect URI, subscribe a webhook, then check Usage and Logs. Try a webhook URL containing &quot;fail&quot; to see a failed delivery.</p></div>
          <DeveloperPortal />
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={headingClass}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomy.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}
          </div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={headingClass}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">Each app picks one authentication variant. OAuth 2.0 suits user-authorized access and server-to-server tokens. API keys suit server jobs that need several credentials with different scopes. Webhook events, usage, and logs all follow the same app scopes, so the numbers and options stay consistent across sections.</p>
          <Card><CardHeader><CardTitle className="text-base">Included behavior</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{["Create, edit, delete apps", "OAuth or API key per app", "Scope matrix per app and key", "Key scopes ⊆ app scopes", "Reveal-once secrets", "Secret rotation", "Redirect URI validation", "Key expiry and revoke", "Webhook events by scope", "Test deliveries", "Pause and resume", "Usage filters", "Endpoint breakdown", "Rate-limit meters", "Log search and filters", "Request detail", "Live tail"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={headingClass}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={headingClass}>Usage Guidelines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Show secrets once, then only a masked suffix.</li><li>Confirm rotate, revoke, and delete, and say what stops working.</li><li>Derive stats, charts, and tables from the same data so the numbers agree.</li><li>Limit key scopes and webhook events to what the app is allowed.</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Do not log or display full Authorization headers.</li><li>Do not accept non-https webhook endpoints or redirect URIs outside localhost.</li><li>Do not rely on color alone for status. Include the code or label.</li><li>Do not imply the preview contacts a real API. Every action here is simulated.</li></ul></CardContent></Card>
          </div>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={headingClass}>Components Used</h2>
          <div className="flex flex-wrap gap-2">{components.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-sm text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Compare <Link href="/templates/integration-connection" className="font-medium text-link hover:underline">Integration Connection</Link> for outbound service connections. Browse all <Link href="/templates" className="font-medium text-link hover:underline">templates</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
