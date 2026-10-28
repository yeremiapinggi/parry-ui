"use client"

import { useState } from "react"
import { LayoutDashboardIcon } from "lucide-react"

import {
  AppSidebar,
  Breadcrumb,
  MobileNavigationDrawer,
  NavigationGroup,
  NavigationItem,
  TopNavbar,
  UserMenu,
  WorkspaceSwitcher,
  applicationShellNavigation,
  demoWorkspaces,
} from "@/components/application-shell-navigation"
import { Button } from "@/components/ui/button"

const sampleItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboardIcon,
    children: [
      { id: "summary", label: "Summary" },
      { id: "activity", label: "Activity" },
    ],
  },
]

export type NavigationExampleKind = "app-sidebar" | "top-navbar" | "navigation-item" | "navigation-group" | "breadcrumb" | "workspace-switcher" | "user-menu" | "mobile-navigation-drawer"

export function ApplicationShellComponentExample({ kind }: { kind: NavigationExampleKind }) {
  const [activeItemId, setActiveItemId] = useState("summary")
  const [workspace, setWorkspace] = useState<string>(demoWorkspaces[0])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [groupExpanded, setGroupExpanded] = useState(true)
  const [message, setMessage] = useState("Choose an item to update this example.")

  if (kind === "app-sidebar") {
    return (
      <div className="flex h-64 w-full max-w-72 overflow-hidden rounded-lg border text-left">
        <AppSidebar
          groups={applicationShellNavigation}
          activeItemId={activeItemId}
          onNavigate={setActiveItemId}
          workspaceName={workspace}
          onWorkspaceChange={setWorkspace}
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          className={sidebarCollapsed ? "w-20" : "w-full"}
        />
      </div>
    )
  }

  if (kind === "top-navbar") {
    return (
      <div className="w-full overflow-hidden rounded-lg border">
        <TopNavbar groups={applicationShellNavigation} activeItemId={activeItemId} onNavigate={setActiveItemId} workspaceName={workspace} onWorkspaceChange={setWorkspace} />
      </div>
    )
  }

  if (kind === "navigation-item") {
    return (
      <div className="flex w-full max-w-64 flex-col gap-2">
        <NavigationItem item={{ id: "summary", label: "Summary", icon: LayoutDashboardIcon }} active={activeItemId === "summary"} onNavigate={setActiveItemId} />
        <NavigationItem item={{ id: "activity", label: "Activity", icon: LayoutDashboardIcon }} active={activeItemId === "activity"} onNavigate={setActiveItemId} />
        <NavigationItem item={{ id: "disabled", label: "Disabled item", icon: LayoutDashboardIcon, disabled: true }} onNavigate={setActiveItemId} />
        <Button type="button" variant="outline" size="sm" onClick={() => setActiveItemId((current) => current === "summary" ? "activity" : "summary")}>Toggle active item</Button>
      </div>
    )
  }

  if (kind === "navigation-group") {
    return (
      <div className="w-full max-w-64 rounded-lg border p-3">
        <NavigationGroup label="PROJECT" items={sampleItems} activeItemId={activeItemId} onNavigate={setActiveItemId} expanded={groupExpanded} onExpandedChange={setGroupExpanded} />
      </div>
    )
  }

  if (kind === "breadcrumb") {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ id: "summary", label: "Workspace" }, { id: "activity", label: "Analytics" }, { label: "Activity" }]} onNavigate={(id) => setMessage(`Navigated to ${id}.`)} />
        <p role="status" className="text-xs text-muted-foreground">{message}</p>
      </div>
    )
  }

  if (kind === "workspace-switcher") {
    return (
      <div className="flex flex-col items-start gap-3">
        <WorkspaceSwitcher value={workspace} onValueChange={setWorkspace} />
        <p role="status" className="text-xs text-muted-foreground">Current workspace: {workspace}</p>
      </div>
    )
  }

  if (kind === "user-menu") {
    return <UserMenu onAction={(action) => setMessage(action === "profile" ? "Profile selected." : "Account settings selected.")} />
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <MobileNavigationDrawer
        groups={applicationShellNavigation}
        activeItemId={activeItemId}
        onNavigate={setActiveItemId}
        workspaceName={workspace}
        onWorkspaceChange={setWorkspace}
      />
      <p role="status" className="text-xs text-muted-foreground">{message === "Choose an item to update this example." ? `Active page: ${activeItemId}` : message}</p>
    </div>
  )
}
