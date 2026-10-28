"use client"

import { useState } from "react"
import {
  ActivityIcon,
  BellIcon,
  BlocksIcon,
  ChartNoAxesCombinedIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  Settings2Icon,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type ShellNavigationItem = {
  id: string
  label: string
  icon?: LucideIcon
  disabled?: boolean
  children?: ShellNavigationItem[]
}

export type NavigationGroupConfig = {
  label: string
  items: ShellNavigationItem[]
}

export const applicationShellNavigation: NavigationGroupConfig[] = [
  {
    label: "WORKSPACE",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboardIcon,
        children: [
          { id: "dashboard-overview", label: "Overview" },
          { id: "dashboard-activity", label: "Activity" },
        ],
      },
      {
        id: "data-management",
        label: "Data Management",
        icon: DatabaseIcon,
        children: [
          { id: "data-records", label: "Records" },
          { id: "data-imports", label: "Imports" },
        ],
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: ChartNoAxesCombinedIcon,
        children: [
          { id: "analytics-trends", label: "Trends" },
          { id: "analytics-segments", label: "Segments" },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings2Icon,
        children: [
          { id: "settings-preferences", label: "Preferences" },
          { id: "settings-team", label: "Team" },
        ],
      },
    ],
  },
]

export const demoWorkspaces = [
  "Northstar Operations",
  "Meridian Support",
  "Atlas Commerce",
] as const

export function findNavigationPath(id: string, groups: NavigationGroupConfig[]) {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.id === id) return [item]
      const child = item.children?.find((entry) => entry.id === id)
      if (child) return [item, child]
    }
  }
  return []
}

function containsActiveItem(item: ShellNavigationItem, activeItemId: string) {
  return item.id === activeItemId || item.children?.some((child) => child.id === activeItemId) === true
}

export function NavigationItem({
  item,
  active = false,
  collapsed = false,
  onNavigate,
  className,
}: {
  item: ShellNavigationItem
  active?: boolean
  collapsed?: boolean
  onNavigate?: (id: string) => void
  className?: string
}) {
  const Icon = item.icon

  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size={collapsed ? "icon" : "sm"}
      disabled={item.disabled}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      onClick={() => onNavigate?.(item.id)}
      className={cn(
        "w-full justify-start gap-2.5 font-data",
        collapsed && "justify-center px-0",
        className,
      )}
    >
      {Icon ? <Icon data-icon="inline-start" /> : collapsed ? <span aria-hidden="true" className="font-data text-xs font-semibold">{item.label.slice(0, 1)}</span> : null}
      {!collapsed ? <span className="min-w-0 truncate">{item.label}</span> : null}
    </Button>
  )
}

export function NavigationGroup({
  label,
  items,
  activeItemId,
  onNavigate,
  collapsed = false,
  expanded: controlledExpanded,
  expandedItems,
  defaultExpanded = true,
  onExpandedChange,
  onItemExpandedChange,
}: {
  label?: string
  items: ShellNavigationItem[]
  activeItemId: string
  onNavigate: (id: string) => void
  collapsed?: boolean
  expanded?: boolean
  expandedItems?: Record<string, boolean>
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onItemExpandedChange?: (id: string, expanded: boolean) => void
}) {
  const [localExpanded] = useState(defaultExpanded)
  const [localExpandedItems, setLocalExpandedItems] = useState<Record<string, boolean>>({})
  const isExpanded = (id: string) => expandedItems?.[id] ?? controlledExpanded ?? localExpandedItems[id] ?? localExpanded
  const setExpanded = (id: string, next: boolean) => {
    setLocalExpandedItems((current) => ({ ...current, [id]: next }))
    onItemExpandedChange?.(id, next)
    onExpandedChange?.(next)
  }

  return (
    <section className="flex flex-col gap-1" aria-label={label}>
      {label && !collapsed ? <p className="px-3 pb-1 pt-3 font-data text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</p> : null}
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = containsActiveItem(item, activeItemId)
          const itemExpanded = isExpanded(item.id)
          if (collapsed) {
            return (
              <DropdownMenu key={item.id}>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant={isActive ? "secondary" : "ghost"} size="icon" aria-label={item.label} title={item.label}>
                    {item.icon ? <item.icon /> : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="min-w-48">
                  <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem disabled={item.disabled} onSelect={() => onNavigate(item.id)}>
                      {item.label} overview
                    </DropdownMenuItem>
                    {item.children?.map((child) => (
                      <DropdownMenuItem key={child.id} disabled={child.disabled} onSelect={() => onNavigate(child.id)}>
                        {child.label}
                        {child.id === activeItemId ? <CheckIcon className="ml-auto" /> : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          return (
            <div key={item.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <NavigationItem item={item} active={item.id === activeItemId} onNavigate={onNavigate} className="min-w-0 flex-1" />
                {item.children?.length ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${itemExpanded ? "Collapse" : "Expand"} ${item.label} navigation`}
                    aria-expanded={itemExpanded}
                    onClick={() => setExpanded(item.id, !itemExpanded)}
                    className={cn("shrink-0 text-muted-foreground", isActive && "text-foreground")}
                  >
                    <ChevronDownIcon className={cn("transition-transform", !itemExpanded && "-rotate-90")} />
                  </Button>
                ) : null}
              </div>
              {item.children?.length && itemExpanded ? (
                <div role="group" aria-label={`${item.label} pages`} className="ml-4 flex flex-col gap-1 border-l pl-2">
                  {item.children.map((child) => (
                    <NavigationItem
                      key={child.id}
                      item={child}
                      active={child.id === activeItemId}
                      onNavigate={onNavigate}
                      className="text-muted-foreground"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function Breadcrumb({
  items,
  onNavigate,
  className,
}: {
  items: { id?: string; label: string }[]
  onNavigate?: (id: string) => void
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 font-data text-xs text-muted-foreground">
        <li className="shrink-0"><span className="font-medium text-foreground">Northstar</span></li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            <ChevronRightIcon aria-hidden="true" className="size-3 shrink-0" />
            {item.id && onNavigate && index < items.length - 1 ? (
              <button type="button" onClick={() => onNavigate(item.id!)} className="truncate rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                {item.label}
              </button>
            ) : (
              <span aria-current={index === items.length - 1 ? "page" : undefined} className={cn("truncate", index === items.length - 1 && "font-medium text-foreground")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function WorkspaceSwitcher({
  value,
  onValueChange,
  options = [...demoWorkspaces],
  compact = false,
}: {
  value: string
  onValueChange: (value: string) => void
  options?: string[]
  compact?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size={compact ? "icon" : "sm"} aria-label="Switch workspace" className={cn("min-w-0 justify-between gap-2 font-data", compact && "w-10 justify-center px-0")}>
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><BlocksIcon className="size-3.5" /></span>
          {!compact ? <><span className="min-w-0 flex-1 truncate text-left">{value}</span><ChevronDownIcon data-icon="inline-end" /></> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem key={option} onSelect={() => onValueChange(option)}>
              {option}
              {option === value ? <CheckIcon className="ml-auto" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserMenu({
  onNavigate,
  onAction,
}: {
  onNavigate?: (id: string) => void
  onAction?: (action: "profile" | "settings") => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open user menu" className="rounded-full">
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">AP</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-medium text-foreground">Alya Pratama</span>
          <span className="block text-xs text-muted-foreground">alya@northstar.co</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={!onNavigate && !onAction} onSelect={() => { onNavigate?.("settings-team"); onAction?.("profile") }}>Profile</DropdownMenuItem>
          <DropdownMenuItem disabled={!onNavigate && !onAction} onSelect={() => { onNavigate?.("settings-preferences"); onAction?.("settings") }}>Account settings</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MobileNavigationDrawer({
  groups,
  activeItemId,
  onNavigate,
  workspaceName,
  onWorkspaceChange,
  showWorkspace = true,
  className,
}: {
  groups: NavigationGroupConfig[]
  activeItemId: string
  onNavigate: (id: string) => void
  workspaceName: string
  onWorkspaceChange: (value: string) => void
  showWorkspace?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open mobile navigation" className={className}>
          <MenuIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="inset-y-0 left-0 top-0 flex h-dvh w-[min(20rem,calc(100vw-2.5rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-r p-0 sm:max-w-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Application navigation</DialogTitle>
          <DialogDescription>Choose a section in the Northstar application.</DialogDescription>
        </DialogHeader>
        <AppSidebar
          groups={groups}
          activeItemId={activeItemId}
          onNavigate={(id) => { onNavigate(id); setOpen(false) }}
          workspaceName={workspaceName}
          onWorkspaceChange={onWorkspaceChange}
          showWorkspace={showWorkspace}
          onCollapseChange={() => undefined}
          collapsible={false}
          className="min-h-full w-full border-r-0"
        />
      </DialogContent>
    </Dialog>
  )
}

export function AppSidebar({
  groups,
  activeItemId,
  onNavigate,
  workspaceName,
  onWorkspaceChange,
  collapsed = false,
  onCollapseChange,
  showWorkspace = true,
  contextual = false,
  collapsible = true,
  expandedItems,
  onItemExpandedChange,
  className,
}: {
  groups: NavigationGroupConfig[]
  activeItemId: string
  onNavigate: (id: string) => void
  workspaceName: string
  onWorkspaceChange: (value: string) => void
  collapsed?: boolean
  onCollapseChange: (collapsed: boolean) => void
  showWorkspace?: boolean
  contextual?: boolean
  collapsible?: boolean
  expandedItems?: Record<string, boolean>
  onItemExpandedChange?: (id: string, expanded: boolean) => void
  className?: string
}) {
  const selectedRoot = groups.flatMap((group) => group.items).find((item) => containsActiveItem(item, activeItemId))

  return (
    <aside aria-label={contextual ? "Contextual navigation" : "Application sidebar"} className={cn("flex shrink-0 flex-col bg-card text-card-foreground", className)}>
      <div className={cn("flex min-h-16 items-center gap-2 border-b px-3 py-3", collapsed && "flex-col justify-center px-2")}>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">{contextual && selectedRoot?.icon ? <selectedRoot.icon className="size-5" /> : <BlocksIcon className="size-5" />}</span>
        {!collapsed ? <div className="flex min-w-0 flex-1 flex-col"><span className="truncate font-data text-sm font-semibold">{contextual ? selectedRoot?.label : "Northstar"}</span><span className="truncate text-xs text-muted-foreground">{contextual ? "Module navigation" : "Workspace"}</span></div> : null}
        {collapsible ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={() => onCollapseChange(!collapsed)} className={cn("shrink-0", collapsed && "mt-1")}>
            {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
        ) : null}
      </div>

      {showWorkspace ? <div className={cn("border-b p-3", collapsed && "flex justify-center p-2")}><WorkspaceSwitcher value={workspaceName} onValueChange={onWorkspaceChange} compact={collapsed} /></div> : null}

      <div className={cn("flex flex-1 flex-col gap-3 p-3", collapsed && "items-center px-2")}>
        {contextual && selectedRoot ? (
          <>
            {!collapsed ? <div className="flex items-center gap-2 border-b pb-3 font-data text-sm font-semibold">{selectedRoot.icon ? <selectedRoot.icon className="size-4 text-muted-foreground" /> : null}<span className="truncate">{selectedRoot.label}</span></div> : null}
            <div role="group" aria-label={`${selectedRoot.label} pages`} className="flex flex-col gap-1">
              {(selectedRoot.children ?? [selectedRoot]).map((item) => (
                <NavigationItem key={item.id} item={item} active={item.id === activeItemId} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </div>
          </>
        ) : (
          groups.map((group) => (
            <NavigationGroup key={group.label} label={group.label} items={group.items} activeItemId={activeItemId} onNavigate={onNavigate} collapsed={collapsed} expandedItems={expandedItems} onItemExpandedChange={onItemExpandedChange} />
          ))
        )}
      </div>
    </aside>
  )
}

export function TopNavbar({
  groups,
  activeItemId,
  onNavigate,
  workspaceName,
  onWorkspaceChange,
}: {
  groups: NavigationGroupConfig[]
  activeItemId: string
  onNavigate: (id: string) => void
  workspaceName: string
  onWorkspaceChange: (value: string) => void
}) {
  const items = groups.flatMap((group) => group.items)

  return (
    <header className="flex min-h-16 flex-wrap items-center gap-3 border-b bg-background px-3 py-2 sm:px-5">
      <MobileNavigationDrawer
        groups={groups}
        activeItemId={activeItemId}
        onNavigate={onNavigate}
        workspaceName={workspaceName}
        onWorkspaceChange={onWorkspaceChange}
        className="md:hidden"
      />
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true"><BlocksIcon className="size-4" /></span>
        <span className="hidden truncate font-data text-sm font-semibold sm:inline">Northstar</span>
      </div>
      <div className="hidden min-w-52 max-w-64 flex-1 sm:block"><WorkspaceSwitcher value={workspaceName} onValueChange={onWorkspaceChange} /></div>
      <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex md:overflow-visible">
        {items.map((item) => (
          <div key={item.id} className="flex shrink-0 items-center gap-0.5">
            <NavigationItem item={item} active={containsActiveItem(item, activeItemId)} onNavigate={onNavigate} />
            {item.children?.length ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Open ${item.label} pages`}><ChevronDownIcon /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  <DropdownMenuItem onSelect={() => onNavigate(item.id)}>{item.label} overview</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.id} disabled={child.disabled} onSelect={() => onNavigate(child.id)}>
                        {child.label}
                        {child.id === activeItemId ? <CheckIcon className="ml-auto" /> : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ))}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <NotificationsMenu />
        <UserMenu onNavigate={onNavigate} />
      </div>
    </header>
  )
}

export function NotificationsMenu() {
  const [unread, setUnread] = useState(2)
  const notices = [
    { id: "refresh", title: "Workspace sync complete", detail: "All sources were updated 12 minutes ago." },
    { id: "invite", title: "New team invitation", detail: "Maya Chen invited you to a project." },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={`Open notifications${unread ? `, ${unread} unread` : ""}`} className="relative">
          <BellIcon />
          {unread > 0 ? <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" /> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>Notifications</span><span className="text-xs font-normal text-muted-foreground">{unread} unread</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notices.map((notice) => (
          <DropdownMenuItem key={notice.id} onSelect={() => setUnread((current) => Math.max(0, current - 1))} className="items-start py-2.5">
            <ActivityIcon className="mt-0.5 text-muted-foreground" />
            <span className="flex min-w-0 flex-col gap-0.5"><span className="font-medium">{notice.title}</span><span className="whitespace-normal text-xs leading-relaxed text-muted-foreground">{notice.detail}</span></span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
