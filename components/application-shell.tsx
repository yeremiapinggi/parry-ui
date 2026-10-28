"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

import {
  AppSidebar,
  Breadcrumb,
  MobileNavigationDrawer,
  NotificationsMenu,
  TopNavbar,
  UserMenu,
  applicationShellNavigation,
  findNavigationPath,
  type NavigationGroupConfig,
} from "@/components/application-shell-navigation"

export type ApplicationShellLayout = "sidebar" | "top" | "hybrid"

export function ApplicationShell({
  variant,
  activeItemId,
  onNavigate,
  children,
  groups = applicationShellNavigation,
  className,
}: {
  variant: ApplicationShellLayout
  activeItemId: string
  onNavigate: (id: string) => void
  children: ReactNode
  groups?: NavigationGroupConfig[]
  className?: string
}) {
  const [workspaceName, setWorkspaceName] = useState("Northstar Operations")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const breadcrumbItems = findNavigationPath(activeItemId, groups).map((item) => ({ id: item.id, label: item.label }))
  const activeRoot = groups.flatMap((group) => group.items).find((item) => item.id === activeItemId || item.children?.some((child) => child.id === activeItemId))
  const sidebarGroups = variant === "hybrid" && activeRoot
    ? [{ label: activeRoot.label, items: [activeRoot] }]
    : groups
  const isSidebar = variant === "sidebar"
  const hasSidebar = variant === "sidebar" || variant === "hybrid"

  return (
    <section data-layout={variant} aria-label={`${variant} application shell`} className={cn("min-w-0 overflow-hidden rounded-xl border bg-background text-foreground", className)}>
      <div className={variant === "sidebar" ? "hidden" : "block"}>
        <TopNavbar
          groups={groups}
          activeItemId={activeItemId}
          onNavigate={onNavigate}
          workspaceName={workspaceName}
          onWorkspaceChange={setWorkspaceName}
        />
      </div>

      <div className="flex min-w-0 items-stretch">
        <AppSidebar
          groups={sidebarGroups}
          activeItemId={activeItemId}
          onNavigate={onNavigate}
          workspaceName={workspaceName}
          onWorkspaceChange={setWorkspaceName}
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          showWorkspace={isSidebar}
          contextual={variant === "hybrid"}
          expandedItems={expandedGroups}
          onItemExpandedChange={(id, expanded) => setExpandedGroups((current) => ({ ...current, [id]: expanded }))}
          className={cn(
            "min-h-[36rem] border-r",
            hasSidebar ? "hidden md:flex" : "hidden",
            sidebarCollapsed ? "w-20" : isSidebar ? "w-64" : "w-60",
          )}
        />

        <div className="min-w-0 flex-1">
          <header className="flex min-h-14 items-center justify-between gap-3 border-b px-3 py-2 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              {isSidebar ? (
                <MobileNavigationDrawer
                  groups={groups}
                  activeItemId={activeItemId}
                  onNavigate={onNavigate}
                  workspaceName={workspaceName}
                  onWorkspaceChange={setWorkspaceName}
                  className="md:hidden"
                />
              ) : null}
              <Breadcrumb items={breadcrumbItems} onNavigate={onNavigate} />
            </div>
            {isSidebar ? (
              <div className="flex shrink-0 items-center gap-1">
                <NotificationsMenu />
                <UserMenu onNavigate={onNavigate} />
              </div>
            ) : null}
          </header>
          <main className="min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
            {children}
          </main>
        </div>
      </div>
    </section>
  )
}
