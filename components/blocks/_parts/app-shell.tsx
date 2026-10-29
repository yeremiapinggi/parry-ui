"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import {
  AtSignIcon,
  BellIcon,
  BookOpenIcon,
  ChartColumnIcon,
  ChevronsUpDownIcon,
  CircleHelpIcon,
  HashIcon,
  HeadsetIcon,
  InboxIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  LogOutIcon,
  MessagesSquareIcon,
  PaletteIcon,
  PanelLeftIcon,
  PhoneIcon,
  SearchIcon,
  SettingsIcon,
  ShieldAlertIcon,
  StickyNoteIcon,
  TagIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "cn"

import { notifications } from "@/components/blocks/_data/notifications"
import { currentAgent, type Presence } from "@/components/blocks/_data/team"
import { AgentStatus, AgentStatusItems } from "@/components/blocks/_parts/agent-status"
import { applyBlockTheme, blockThemes, isBlockTheme, type BlockThemeId } from "@/components/blocks/_parts/block-themes"
import { presenceMeta } from "@/components/blocks/_parts/presence-dot"
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type AppSection = "ticket" | "dashboard" | "report" | "setting"

const workspaceNav: {
  id: AppSection
  label: string
  href: string
  icon: LucideIcon
}[] = [
  {
    id: "ticket",
    label: "Ticket",
    href: "/blocks/ticket-inbox-01",
    icon: InboxIcon,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/blocks/dashboard-01",
    icon: LayoutDashboardIcon,
  },
  {
    id: "report",
    label: "Report",
    href: "/blocks/report-01",
    icon: ChartColumnIcon,
  },
]

const searchScopes: { label: string; icon: LucideIcon }[] = [
  { label: "Content", icon: MessagesSquareIcon },
  { label: "No. Ticket", icon: HashIcon },
  { label: "No. Handphone", icon: PhoneIcon },
  { label: "User", icon: UserIcon },
  { label: "Agent", icon: HeadsetIcon },
  { label: "Account", icon: AtSignIcon },
  { label: "Note", icon: StickyNoteIcon },
  { label: "Tag", icon: TagIcon },
  { label: "Group Agent", icon: UsersIcon },
]

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))

// Item styling shared by sidebar links and buttons; the active one gets a primary bar on its right edge.
const navItem =
  "relative h-9 w-full justify-start gap-2.5 px-2.5 font-normal text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring @max-[10rem]:justify-center [&_svg]:size-4"
const navActive =
  "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-xs after:absolute after:inset-y-2 after:right-1.5 after:w-0.5 after:rounded-full after:bg-sidebar-primary @max-[10rem]:after:hidden"

/**
 * Floating-sidebar app shell shared by every block: brand, search, workspace nav and profile on the left;
 * collapse toggle, agent status, notifications, help and theme on top; page title above the content.
 */
export function AppShell({
  active,
  title,
  description,
  actions,
  children,
}: {
  active: AppSection
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scope, setScope] = useState("Content")
  const [presence, setPresence] = useState<Presence>(currentAgent.presence)
  const [theme, setTheme] = useState<BlockThemeId>("classic")
  const unread = notifications.filter((n) => n.unread).length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !isTyping(e.target)
      const cmdK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)
      if (slash || cmdK) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const sidebar = (isCollapsed: boolean) => (
    <SidebarContent
      active={active}
      collapsed={isCollapsed}
      presence={presence}
      onPresenceChange={setPresence}
      onSearch={() => {
        setMobileNavOpen(false)
        setSearchOpen(true)
      }}
    />
  )

  return (
    <div className="flex h-dvh gap-3 bg-background text-foreground md:p-3">
      <aside
        aria-label="Sociomile"
        data-collapsed={collapsed}
        className="@container hidden w-64 shrink-0 flex-col rounded-2xl border border-sidebar-border bg-linear-to-b from-sidebar to-sidebar-accent/50 text-sidebar-foreground shadow-sm transition-[width] duration-200 data-[collapsed=true]:w-16 md:flex"
      >
        {sidebar(collapsed)}
      </aside>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="@container w-72 gap-0 border-sidebar-border bg-linear-to-b from-sidebar to-sidebar-accent/50 p-0 text-sidebar-foreground"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {sidebar(false)}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 px-3 md:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="max-md:hidden"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            <PanelLeftIcon />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
            <PanelLeftIcon />
          </Button>
          <AgentStatus value={presence} onChange={setPresence} />

          <div className="ml-auto flex items-center gap-0.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
                  <BellIcon />
                  {unread > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background"
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <PopoverHeader className="flex-row items-center justify-between border-b px-4 py-3">
                  <PopoverTitle>Notifications</PopoverTitle>
                  <Badge variant="secondary" className="tabular-nums">
                    {unread} new
                  </Badge>
                </PopoverHeader>
                <ul className="flex flex-col p-1">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <Button
                        variant="ghost"
                        className="h-auto w-full items-start justify-start gap-3 px-3 py-2 text-left font-normal whitespace-normal"
                      >
                        {n.kind === "assignment" ? (
                          <UserPlusIcon className="mt-0.5 text-info" />
                        ) : (
                          <ShieldAlertIcon className="mt-0.5 text-destructive" />
                        )}
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-sm">{n.title}</span>
                          <span className="text-xs text-muted-foreground">
                            Ticket <span className="font-mono">#{n.ticket}</span> · {n.time}
                          </span>
                        </span>
                        {n.unread && <span className="mt-1.5 size-2 rounded-full bg-primary" aria-label="Unread" />}
                      </Button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>

            <DropdownMenu
              onOpenChange={(open) => {
                const current = document.documentElement.dataset.theme
                if (open && isBlockTheme(current)) setTheme(current)
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Theme">
                  <PaletteIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(v) => {
                    if (!isBlockTheme(v)) return
                    setTheme(v)
                    applyBlockTheme(v)
                  }}
                >
                  {blockThemes.map((t) => (
                    <DropdownMenuRadioItem key={t.id} value={t.id}>
                      {t.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 md:px-6">
          <header className="flex flex-wrap items-start justify-between gap-4 pt-2 pb-5">
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </header>
          <Separator className="mb-5" />
          {children}
        </main>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search" description="Search tickets by scope">
        {/* the DS CommandDialog renders children bare, so the cmdk root goes here */}
        <Command>
          <CommandInput placeholder={`Search by ${scope}…`} />
          <CommandList>
            <CommandEmpty>No scope found.</CommandEmpty>
            <CommandGroup heading="Search by">
              {searchScopes.map(({ label, icon: Icon }) => (
                <CommandItem key={label} value={label} onSelect={() => setScope(label)} data-checked={scope === label}>
                  <Icon />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}

function SidebarContent({
  active,
  collapsed,
  presence,
  onPresenceChange,
  onSearch,
}: {
  active: AppSection
  collapsed: boolean
  presence: Presence
  onPresenceChange: (p: Presence) => void
  onSearch: () => void
}) {
  // Labels hide by container width (@max-[10rem]), so the same markup serves the full and collapsed sidebar.
  const tip = (label: string, node: React.ReactElement) =>
    collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    ) : (
      node
    )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-3">
      <Link
        href="/blocks"
        className="flex items-center gap-2.5 rounded-lg px-1 py-1 outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 @max-[10rem]:justify-center"
      >
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"
        >
          <MessagesSquareIcon className="size-5" />
        </span>
        <span className="flex min-w-0 flex-col @max-[10rem]:sr-only">
          <span className="font-heading text-base leading-tight font-semibold">Sociomile</span>
          <span className="truncate text-xs">Omnichannel Inbox</span>
        </span>
      </Link>

      {tip(
        "Search",
        <Button
          variant="outline"
          onClick={onSearch}
          aria-label="Search"
          aria-keyshortcuts="/ Control+K Meta+K"
          className="h-9 w-full justify-start gap-2 border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground @max-[10rem]:justify-center @max-[10rem]:px-0"
        >
          <SearchIcon />
          <span className="flex-1 text-left font-normal @max-[10rem]:sr-only">Search…</span>
          <Kbd className="@max-[10rem]:hidden">/</Kbd>
        </Button>
      )}

      <nav aria-label="Workspace" className="flex flex-col gap-1">
        <h2 className="px-2.5 pb-1 text-xs font-semibold tracking-wide uppercase @max-[10rem]:sr-only">Workspace</h2>
        {workspaceNav.map((item) => (
          <Fragment key={item.id}>
            {tip(
              item.label,
              <Button asChild variant="ghost" className={cn(navItem, item.id === active && navActive)}>
                <Link href={item.href} aria-current={item.id === active ? "page" : undefined}>
                  <item.icon />
                  <span className="@max-[10rem]:sr-only">{item.label}</span>
                </Link>
              </Button>
            )}
          </Fragment>
        ))}
      </nav>

      <nav aria-label="General" className="mt-auto flex flex-col gap-1">
        <h2 className="px-2.5 pb-1 text-xs font-semibold tracking-wide uppercase @max-[10rem]:sr-only">General</h2>
        {tip(
          "Setting",
          <Button asChild variant="ghost" className={cn(navItem, active === "setting" && navActive)}>
            <Link href="/blocks/settings-01" aria-current={active === "setting" ? "page" : undefined}>
              <SettingsIcon />
              <span className="@max-[10rem]:sr-only">Setting</span>
            </Link>
          </Button>
        )}
        <DropdownMenu>
          {tip(
            "Help & docs",
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={navItem}>
                <LifeBuoyIcon />
                <span className="@max-[10rem]:sr-only">Help &amp; docs</span>
              </Button>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent side="right" align="end">
            <DropdownMenuItem>
              <HeadsetIcon />
              Contact Us
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookOpenIcon />
              Manual Book
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CircleHelpIcon />
              Keyboard shortcuts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-2.5 px-1.5 py-1.5 text-left font-normal text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground @max-[10rem]:justify-center"
            aria-label={`Account menu for ${currentAgent.name}, ${presenceMeta[presence].label}`}
          >
            <Avatar>
              <AvatarFallback>{currentAgent.initials}</AvatarFallback>
              <AvatarBadge className={presenceMeta[presence].dot} />
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col @max-[10rem]:sr-only">
              <span className="truncate text-sm font-medium">{currentAgent.name}</span>
              <span className="truncate text-xs">{currentAgent.email}</span>
            </span>
            <ChevronsUpDownIcon className="@max-[10rem]:hidden" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          <DropdownMenuLabel>Agent status</DropdownMenuLabel>
          <AgentStatusItems value={presence} onChange={onPresenceChange} />
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/blocks/settings-01">
              <SettingsIcon />
              Setting
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <KeyRoundIcon />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LogOutIcon />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
