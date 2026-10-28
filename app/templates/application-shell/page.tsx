import type { Metadata } from "next"
import Link from "next/link"

import { ApplicationShellDemo } from "@/components/application-shell-demo"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Application Shell · Templates · Parry UI",
  description: "A reusable application framework with sidebar, top navigation, and hybrid navigation layouts.",
}

const toc = [
  { id: "overview", label: "Overview" },
  { id: "live-preview", label: "Live Preview" },
  { id: "anatomy", label: "Anatomy" },
  { id: "layout-variants", label: "Layout Variants" },
  { id: "interaction-states", label: "Interaction States" },
  { id: "usage-guidelines", label: "Usage Guidelines" },
  { id: "components-used", label: "Components Used" },
]

const headingClass = "scroll-mt-24 font-heading text-2xl font-semibold tracking-tight"

const anatomy = [
  { title: "Shared navigation model", description: "A single typed navigation tree supplies route labels, icons, nested pages, active states, breadcrumbs, and all three layout variants." },
  { title: "Workspace and account chrome", description: "Workspace selection, notifications, and the user menu remain available in the application header without becoming part of page content." },
  { title: "Context-aware page frame", description: "The content area receives existing page templates as children. The shell owns navigation and framing, not the dashboard, table, or settings behavior." },
  { title: "Responsive navigation", description: "Desktop layouts use the selected navigation pattern, tablet widths can collapse the sidebar, and mobile uses an accessible navigation drawer." },
]

const variants = [
  { name: "Sidebar", description: "A full-height left rail combines workspace switching, grouped primary routes, nested pages, and an icon-only collapsed state. The content header carries breadcrumbs, notifications, and the user menu." },
  { name: "Top navigation", description: "A full-width header holds the product, workspace, primary routes, notifications, and account menu. Module menus expose nested destinations; the page content spans the available width below." },
  { name: "Hybrid", description: "Primary modules stay in the top bar while a contextual left rail changes to show the selected module’s sub-navigation. The contextual rail collapses independently from the top navigation." },
]

const interactionStates = [
  ["Default", "The active route is highlighted and its location is reflected in the breadcrumb."],
  ["Active / hover / focus", "Current links use the selected state; pointer hover and keyboard focus remain visible through the semantic component tokens and focus rings."],
  ["Disabled", "A navigation entry can be disabled in its configuration and remains visibly unavailable to pointer and keyboard users."],
  ["Expanded / collapsed", "Sidebar groups can expand or collapse. In icon-only mode, a module menu keeps its child routes available."],
  ["Workspace / account menus", "The workspace switcher updates the selected demo workspace. Notifications can be opened and marked read; profile actions lead to settings routes."],
  ["Mobile drawer", "The mobile menu opens a labelled dialog drawer and closes after a destination is chosen."],
]

const doGuidelines = [
  "Keep the shell configuration separate from page content and route implementation.",
  "Use consistent route IDs so active navigation, breadcrumbs, and page selection stay aligned.",
  "Group related destinations and keep nested navigation shallow enough to scan.",
  "Use the sidebar layout for broad, persistent navigation; use top navigation for a small number of primary modules; use hybrid navigation when modules have distinct sub-sections.",
  "Preserve page-level state by keeping the content slot stable while changing the shell layout.",
]

const avoidGuidelines = [
  "Do not place a second breadcrumb or application header inside a page when the shell already owns it.",
  "Do not add a shell-specific scroll container around pages that already manage their own interactions.",
  "Do not duplicate page templates to make them fit a navigation variant; render the same template component inside the content slot.",
  "Do not use color alone to indicate the selected or disabled navigation state.",
]

const navigationComponents = [
  ["app-sidebar", "App Sidebar", "Grouped side navigation with workspace branding, nested routes, and expanded or icon-only states."],
  ["top-navbar", "Top Navbar", "Horizontal primary navigation with workspace, nested module menus, notifications, and account controls."],
  ["navigation-item", "Navigation Item", "A reusable link control with configurable icon, active, disabled, and collapsed presentations."],
  ["navigation-group", "Navigation Group", "A labelled group that expands and collapses nested routes while tracking the active page."],
  ["breadcrumb", "Breadcrumb", "A compact route trail with optional navigation for ancestor locations."],
  ["workspace-switcher", "Workspace Switcher", "An accessible menu for changing the current application workspace."],
  ["user-menu", "User Menu", "An account menu for profile and settings destinations."],
  ["mobile-navigation-drawer", "Mobile Navigation Drawer", "A labelled modal drawer that exposes the same route configuration on small screens."],
]

export default function ApplicationShellPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Layouts</span></div>
          <Badge variant="secondary">Application template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Application Shell</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">A reusable application framework with sidebar, top navigation, and hybrid navigation layouts. Wrap existing Parry UI templates in a consistent product frame without duplicating their functionality.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={headingClass}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">Application Shell separates navigation and shared workspace controls from the page mounted in its content slot. A shared route tree drives primary navigation, nested pages, breadcrumbs, the selected module, and all responsive layouts. Switching the layout changes the frame while leaving the active route and mounted page content in place.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">One content slot, multiple layouts</CardTitle><CardDescription>Wrap Analytics Dashboard, Data Management List, or Settings Panels without rebuilding those templates.</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">{["Shared route config", "Nested navigation", "Responsive drawer", "Page-state preservation", "Light / dark themes"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent>
          </Card>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={headingClass}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Switch layouts, select modules and nested pages, collapse the sidebar, change workspace, and open the notification, profile, and mobile navigation menus.</p></div>
          <div className="rounded-lg border bg-background p-2 sm:p-4"><ApplicationShellDemo /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={headingClass}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((part) => <Card key={part.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{part.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{part.description}</p></CardContent></Card>)}</div>
        </section>

        <section id="layout-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="variants-heading">
          <h2 id="variants-heading" className={headingClass}>Layout Variants</h2>
          <div className="grid gap-3 md:grid-cols-3">{variants.map((variant) => <Card key={variant.name} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{variant.name}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{variant.description}</p></CardContent></Card>)}</div>
          <p className="leading-relaxed text-muted-foreground">The live preview uses the same navigation data in every layout. Sidebar groups remain available in collapsed mode, top-level modules expose dropdowns for nested routes, and the hybrid context rail follows the selected module.</p>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={headingClass}>Interaction States</h2>
          <div className="grid gap-3 sm:grid-cols-2">{interactionStates.map(([title, description]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={headingClass}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Use Application Shell as a reusable layout wrapper. Keep route IDs and page content in the application layer; pass navigation configuration and the selected route to the shell, then render the existing page template as its child.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Avoid</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{avoidGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Wrapping an existing template</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">Render the original template in the shell content slot rather than copying its markup. This keeps its filters, charts, forms, and page-level state owned by the template while the shell handles only navigation, workspace chrome, breadcrumbs, and responsive framing.</p></CardContent></Card>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={headingClass}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The reusable navigation building blocks are documented with interactive examples in the Navigation section of the component library.</p>
          <div className="grid gap-3 sm:grid-cols-2">{navigationComponents.map(([id, name, description]) => <Card key={id} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{name}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><Link href={`/components#${id}`} className="text-sm font-medium text-link hover:underline">View interactive example</Link></CardContent></Card>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
    </div>
  )
}
