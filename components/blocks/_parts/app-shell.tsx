"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AtSignIcon,
  BellIcon,
  BookOpenIcon,
  ChartColumnIcon,
  CircleHelpIcon,
  HashIcon,
  HeadsetIcon,
  InboxIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MessagesSquareIcon,
  PaletteIcon,
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
import { AgentStatus } from "@/components/blocks/_parts/agent-status"
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

export type AppSection = "ticket" | "dashboard" | "report" | "setting"

const nav: { id: AppSection; label: string; href: string; icon: LucideIcon }[] = [
  { id: "ticket", label: "Ticket", href: "/blocks/ticket-inbox-01", icon: InboxIcon },
  { id: "dashboard", label: "Dashboard", href: "/blocks/dashboard-01", icon: LayoutDashboardIcon },
  { id: "report", label: "Report", href: "/blocks/report-01", icon: ChartColumnIcon },
  { id: "setting", label: "Setting", href: "/blocks/settings-01", icon: SettingsIcon },
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

/**
 * App shell shared by every block: a top navbar (brand, nav, search, agent status, notifications, help, theme,
 * profile) and a page title area with actions above the content. `hideHeader` keeps the title for screen readers only,
 * for pages whose content carries its own toolbar.
 */
export function AppShell({
  active,
  title,
  description,
  actions,
  hideHeader,
  children,
}: {
  active: AppSection
  title: string
  description?: string
  actions?: React.ReactNode
  hideHeader?: boolean
  children: React.ReactNode
}) {
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

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card px-3 text-card-foreground md:gap-4 md:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <MenuIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {nav.map((item) => (
              <DropdownMenuItem key={item.id} asChild>
                <Link href={item.href} aria-current={item.id === active ? "page" : undefined}>
                  <item.icon />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/blocks" className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <MessagesSquareIcon className="size-5" />
          </span>
          <span className="flex flex-col max-sm:sr-only">
            <span className="font-heading text-base leading-tight font-semibold">Sociomile</span>
            <span className="text-xs text-muted-foreground">Omnichannel Inbox</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Button
              key={item.id}
              asChild
              variant="ghost"
              className={cn(
                "relative h-9 gap-2 px-3 font-normal text-muted-foreground hover:text-foreground",
                // Active tab: primary underline on the navbar's bottom edge.
                item.id === active &&
                  "font-medium text-foreground after:absolute after:inset-x-3 after:-bottom-3.5 after:h-0.5 after:rounded-full after:bg-primary"
              )}
            >
              <Link href={item.href} aria-current={item.id === active ? "page" : undefined}>
                <item.icon />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 justify-end xl:justify-center">
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            aria-keyshortcuts="/ Control+K Meta+K"
            className="h-9 w-full max-w-sm justify-start gap-2 text-muted-foreground max-md:size-9 max-md:justify-center max-md:px-0"
          >
            <SearchIcon />
            <span className="flex-1 truncate text-left font-normal max-md:hidden">Search tickets, customers, agents…</span>
            <Kbd className="max-md:hidden">/</Kbd>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
          <AgentStatus value={presence} onChange={setPresence} className="mr-1 max-sm:hidden" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
                <BellIcon />
                {unread > 0 && <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />}
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
                    <Button variant="ghost" className="h-auto w-full items-start justify-start gap-3 px-3 py-2 text-left font-normal whitespace-normal">
                      {n.kind === "assignment" ? <UserPlusIcon className="mt-0.5 text-info" /> : <ShieldAlertIcon className="mt-0.5 text-destructive" />}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Help & docs">
                <CircleHelpIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <HeadsetIcon />
                Contact Us
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookOpenIcon />
                Manual Book
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 rounded-full"
                aria-label={`Account menu for ${currentAgent.name}, ${presenceMeta[presence].label}`}
              >
                <Avatar>
                  <AvatarFallback>{currentAgent.initials}</AvatarFallback>
                  <AvatarBadge className={presenceMeta[presence].dot} />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-foreground">{currentAgent.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{currentAgent.email}</span>
              </DropdownMenuLabel>
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
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 md:px-6">
        {/* On phones the status pill does not fit the navbar, so it leads the page instead. */}
        <div className="sm:hidden">
          <AgentStatus value={presence} onChange={setPresence} className="mt-4" />
        </div>
        {hideHeader ? (
          <h1 className="sr-only">{title}</h1>
        ) : (
          <>
            <header className="flex flex-wrap items-start justify-between gap-4 pt-6 pb-5">
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </header>
            <Separator className="mb-5" />
          </>
        )}
        <div className={cn(hideHeader && "pt-5")}>{children}</div>
      </main>

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
