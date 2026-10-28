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
  { id: "interaction-states", label: "Interaction States" },
  { id: "usage-guidelines", label: "Usage Guidelines" },
  { id: "components-used", label: "Components Used" },
]

const headingClass = "scroll-mt-24 font-data text-2xl font-semibold tracking-tight"

const anatomy = [
  ["Sidebar navigation", "Groups the portal into Overview, Access (Apps), Realtime (Webhooks), and Monitoring (Usage, Logs). The active item is marked with aria-current."],
  ["Top bar", "Shows the workspace, a Documentation link, and the theme toggle. Below the lg breakpoint it also holds a section selector that replaces the sidebar."],
  ["Overview stats", "Requests, error rate, and active apps for the last 30 days, read from the same usage data as the chart."],
  ["Usage chart", "A stacked area chart of successful and failed requests per day, with an accessible text summary of the totals."],
  ["Apps list", "Every app with its ID and environment. Selecting an app or Manage apps opens the Apps section."],
]

const states = [
  ["Overview", "The default section, with seeded fictional apps and 30 days of generated usage."],
  ["Section switching", "Sidebar items and the mobile selector switch sections in place without changing the route."],
  ["Narrow viewport", "The sidebar hides and the section selector appears in the top bar. Stats and cards stack."],
]

const components = ["badge", "button", "card", "chart", "select"]

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
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={headingClass}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Switch sections from the sidebar, or from the selector on a narrow screen.</p></div>
          <DeveloperPortal />
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={headingClass}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomy.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}
          </div>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={headingClass}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, description]) => <Card key={title}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={headingClass}>Usage Guidelines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Keep every app reachable within one click of the Overview.</li><li>Derive stats and charts from the same data so the numbers agree.</li><li>Give charts a text summary for screen readers.</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Do not show secrets or full API keys on the Overview.</li><li>Do not rely on chart color alone to tell success from errors.</li><li>Do not hide sections on mobile. Move them into the selector instead.</li></ul></CardContent></Card>
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
