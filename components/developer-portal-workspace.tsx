"use client"

import { useState } from "react"
import Link from "next/link"
import { ActivityIcon, BoxesIcon, ChartNoAxesCombinedIcon, FileClockIcon, WebhookIcon } from "lucide-react"
import { AppSidebar, MobileNavigationDrawer, WorkspaceSwitcher, type NavigationGroupConfig } from "@/components/application-shell-navigation"
import { DeveloperPortalApps } from "@/components/developer-portal-apps"
import { DeveloperPortalLogs } from "@/components/developer-portal-logs"
import { DeveloperPortalOverview, DeveloperPortalUsage } from "@/components/developer-portal-analytics"
import { DeveloperPortalWebhooks } from "@/components/developer-portal-webhooks"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { initialDeveloperApps, initialRequestLogs, initialWebhooks, type DeveloperApp, type RequestLog, type WebhookEndpoint } from "@/lib/developer-portal-data"

const navigation: NavigationGroupConfig[] = [{
  label: "WORKSPACE",
  items: [
    { id: "overview", label: "Overview", icon: ActivityIcon },
    { id: "apps", label: "Apps", icon: BoxesIcon },
    { id: "webhooks", label: "Webhooks", icon: WebhookIcon },
    { id: "usage", label: "Usage", icon: ChartNoAxesCombinedIcon },
    { id: "logs", label: "Logs", icon: FileClockIcon },
  ],
}]

type PortalPage = "overview" | "apps" | "webhooks" | "usage" | "logs"

function WorkspaceFooter({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${compact ? "justify-center" : ""}`}>
      <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">IV</AvatarFallback></Avatar>
      {!compact ? <div className="flex min-w-0 flex-1 flex-col"><span className="truncate text-xs font-semibold">Ivosights</span><span className="truncate text-[11px] text-muted-foreground">Platform team</span></div> : null}
      {!compact ? <span className="size-2 shrink-0 rounded-full bg-success" title="Workspace active" /> : null}
    </div>
  )
}

export function DeveloperPortalWorkspace() {
  const [activePage, setActivePage] = useState<PortalPage>("overview")
  const [workspaceName, setWorkspaceName] = useState("IvosightsDev workspace")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [apps, setApps] = useState(initialDeveloperApps)
  const [webhooks, setWebhooks] = useState(initialWebhooks)
  const [logs, setLogs] = useState(initialRequestLogs)
  const [selectedApp, setSelectedApp] = useState<DeveloperApp | null>(null)
  const [createAppRequested, setCreateAppRequested] = useState(false)

  function navigate(pageId: string) {
    if (["overview", "apps", "webhooks", "usage", "logs"].includes(pageId)) setActivePage(pageId as PortalPage)
    setSelectedApp(null)
  }

  function openApp(app: DeveloperApp) {
    setSelectedApp(app)
    setActivePage("apps")
  }

  function requestCreateApp() {
    setSelectedApp(null)
    setActivePage("apps")
    setCreateAppRequested(true)
  }

  function saveApp(updated: DeveloperApp) {
    setApps((current) => current.some((app) => app.id === updated.id) ? current.map((app) => app.id === updated.id ? updated : app) : [updated, ...current])
    setSelectedApp((current) => current?.id === updated.id ? updated : current)
  }

  function deleteApp(target: DeveloperApp) {
    setApps((current) => current.filter((app) => app.id !== target.id))
    setWebhooks((current) => current.filter((webhook) => webhook.appId !== target.id))
  }

  function updateWebhook(updated: WebhookEndpoint) {
    setWebhooks((current) => current.some((webhook) => webhook.id === updated.id) ? current.map((webhook) => webhook.id === updated.id ? updated : webhook) : [updated, ...current])
  }

  function testWebhook(webhook: WebhookEndpoint, shouldFail: boolean) {
    const timestamp = new Date().toISOString()
    const requestId = `req_demo_${Math.random().toString(36).slice(2, 10)}`
    const status = shouldFail ? 503 : 200
    updateWebhook({
      ...webhook,
      lastDeliveryAt: timestamp,
      lastDeliveryStatus: shouldFail ? "Failed" : "Success",
      lastDeliveryError: shouldFail ? "Endpoint returned HTTP 503. Retry scheduled in 60 seconds." : undefined,
    })
    const simulatedLog: RequestLog = {
      id: requestId,
      timestamp,
      appId: webhook.appId,
      method: "POST",
      endpoint: "/webhooks/test",
      status,
      responseTimeMs: shouldFail ? 503 : 142,
      requestId,
      requestBody: { endpoint_id: webhook.id, event: webhook.events[0] ?? "test.ping", payload: "[DEMO EVENT]" },
      responseBody: shouldFail ? { error: "Service unavailable", retry_after_seconds: 60 } : { received: true, delivery_id: `del_${requestId}` },
    }
    setLogs((current) => [simulatedLog, ...current])
  }

  const desktopFooter = <WorkspaceFooter compact={sidebarCollapsed} />
  const mobileFooter = <WorkspaceFooter />
  const content = activePage === "overview" ? (
    <DeveloperPortalOverview apps={apps} onCreateApp={requestCreateApp} onOpenApp={openApp} onNavigate={navigate} />
  ) : activePage === "apps" ? (
    <DeveloperPortalApps
      apps={apps}
      webhooks={webhooks}
      selectedApp={selectedApp}
      onSelectedAppChange={setSelectedApp}
      onSave={saveApp}
      onDelete={deleteApp}
      createRequested={createAppRequested}
      onCreateRequestHandled={() => setCreateAppRequested(false)}
    />
  ) : activePage === "webhooks" ? (
    <DeveloperPortalWebhooks apps={apps} webhooks={webhooks} onUpdate={updateWebhook} onDelete={(webhook) => setWebhooks((current) => current.filter((item) => item.id !== webhook.id))} onTestDelivery={testWebhook} />
  ) : activePage === "usage" ? (
    <DeveloperPortalUsage apps={apps} />
  ) : (
    <DeveloperPortalLogs apps={apps} logs={logs} />
  )

  return (
    <section aria-label="Developer Portal Workspace preview" className="developer-portal-preview template-preview-container min-w-0 overflow-hidden rounded-xl border bg-background text-foreground shadow-sm">
      <div className="flex min-h-[44rem] items-stretch">
        <AppSidebar
          groups={navigation}
          activeItemId={activePage}
          onNavigate={navigate}
          workspaceName={workspaceName}
          onWorkspaceChange={setWorkspaceName}
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          showWorkspace={false}
          brandName="Developer Portal"
          footerContent={desktopFooter}
          className={`hidden min-h-[44rem] border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] @3xl:flex ${sidebarCollapsed ? "w-[4.5rem]" : "w-64"}`}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-3 py-2 backdrop-blur sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <MobileNavigationDrawer
                groups={navigation}
                activeItemId={activePage}
                onNavigate={navigate}
                workspaceName={workspaceName}
                onWorkspaceChange={setWorkspaceName}
                showWorkspace={false}
                brandName="Developer Portal"
                footerContent={mobileFooter}
                className="@3xl:hidden"
              />
              <div className="hidden min-w-44 @2xl:block"><WorkspaceSwitcher value={workspaceName} onValueChange={setWorkspaceName} options={["IvosightsDev workspace", "Ivosights Sandbox", "Ivosights Staging"]} /></div>
              <span className="truncate font-data text-sm font-semibold @2xl:hidden">{activePage === "overview" ? "Overview" : activePage === "apps" ? "Apps" : activePage === "webhooks" ? "Webhooks" : activePage === "usage" ? "Usage" : "Logs"}</span>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Badge variant="outline" className="hidden items-center gap-1.5 border-success/30 bg-success-soft text-success @2xl:inline-flex"><span aria-hidden="true" className="size-1.5 rounded-full bg-success" />API operational</Badge>
              <Button asChild variant="ghost" size="sm" className="hidden @2xl:inline-flex"><Link href="/docs">Documentation</Link></Button>
              <Button asChild variant="ghost" size="icon-sm" className="@2xl:hidden" aria-label="Open documentation"><Link href="/docs" aria-label="Open documentation"><span className="text-xs font-semibold">Docs</span></Link></Button>
            </div>
          </header>
          <main className="template-preview-container min-w-0 flex-1 px-3 py-5 @2xl:px-5 @2xl:py-6 @5xl:px-6">
            <div className="template-preview-container mx-auto w-full max-w-7xl">{content}</div>
          </main>
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground sm:px-5"><span>Demo workspace · local state only</span><span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-success" />All systems operational</span></footer>
    </section>
  )
}

export function DeveloperPortalWorkspaceThumbnail() {
  return (
    <div aria-hidden="true" className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      <div className="flex w-[24%] min-w-[5.5rem] flex-col bg-sidebar px-2.5 py-3 text-sidebar-foreground sm:w-[22%]">
        <div className="mb-3 flex items-center gap-2 border-b border-sidebar-border pb-3"><span className="grid size-5 shrink-0 place-items-center rounded bg-sidebar-primary text-sidebar-primary-foreground"><BoxesIcon className="size-3" /></span><span className="truncate text-[8px] font-semibold sm:text-[9px]">Developer Portal</span></div>
        <span className="mb-1 px-1 text-[6px] font-semibold tracking-widest text-muted-foreground sm:text-[7px]">WORKSPACE</span>
        {["Overview", "Apps", "Webhooks", "Usage", "Logs"].map((item, index) => <span key={item} className={`mb-1 flex items-center gap-1.5 rounded px-1.5 py-1.5 text-[7px] sm:text-[8px] ${index === 0 ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground"}`}><span className="size-1.5 rounded-full bg-current" />{item}</span>)}
        <div className="mt-auto flex items-center gap-1.5 border-t border-sidebar-border pt-2"><span className="grid size-5 place-items-center rounded-full bg-sidebar-accent text-[7px]">IV</span><span className="truncate text-[7px]">Ivosights</span></div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2 text-[7px] sm:text-[8px]"><span className="truncate font-medium">IvosightsDev workspace</span><span className="flex shrink-0 items-center gap-2 text-muted-foreground"><span>Docs</span><span className="size-3 rounded-full border" /></span></div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3 sm:gap-2.5">
          <div className="flex items-end justify-between gap-2"><div><span className="block text-[6px] font-semibold uppercase tracking-widest text-info sm:text-[7px]">Developer workspace</span><span className="mt-1 block text-[10px] font-semibold sm:text-xs">IvosightsDev workspace</span></div><span className="rounded bg-primary px-2 py-1 text-[6px] text-primary-foreground sm:text-[7px]">+ Create app</span></div>
          <div className="grid grid-cols-3 gap-1.5">{[["Requests · 30d", "442k"], ["Error rate", "1.64%"], ["Active apps", "3"]].map(([label, value]) => <div key={label} className="rounded border bg-card p-1.5 sm:p-2"><span className="block text-[6px] text-muted-foreground sm:text-[7px]">{label}</span><span className="mt-1 block font-mono text-[8px] font-semibold sm:text-[10px]">{value}</span></div>)}</div>
          <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-[1.4fr_1fr]">
            <div className="flex min-h-0 flex-col rounded border bg-card p-2"><span className="text-[7px] font-semibold sm:text-[8px]">API usage</span><div className="mt-auto flex h-16 items-end gap-1 border-b border-l px-1 sm:h-24">{[34, 48, 42, 68, 59, 77, 63, 88, 71, 92, 78, 96].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-chart-2/75" style={{ height: `${height}%` }} />)}</div><div className="mt-1 flex justify-between text-[5px] text-muted-foreground sm:text-[6px]"><span>Oct 1</span><span>Oct 29</span></div></div>
            <div className="flex min-h-0 flex-col rounded border bg-card p-2"><span className="text-[7px] font-semibold sm:text-[8px]">Applications</span>{[["sociomile-demo", "Prod"], ["IvoDevJNE", "Dev"], ["IvosightsDev", "Dev"]].map(([name, env]) => <div key={name} className="mt-2 flex items-center justify-between gap-1 border-b pb-1.5 last:border-0"><span className="truncate text-[6px] sm:text-[7px]">{name}</span><span className="shrink-0 rounded bg-info-soft px-1 py-0.5 text-[5px] text-info sm:text-[6px]">{env}</span></div>)}<div className="mt-auto flex items-center gap-1.5 border-t pt-1.5"><span className="shrink-0 text-[5px] font-medium text-muted-foreground sm:text-[6px]">Rate limits</span><span className="h-1 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full w-[38%] rounded-full bg-chart-2" /></span><span className="font-mono text-[5px] tabular-nums text-muted-foreground sm:text-[6px]">38%</span></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
