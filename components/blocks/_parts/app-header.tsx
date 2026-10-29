"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AtSignIcon,
  BellIcon,
  BookOpenIcon,
  CircleHelpIcon,
  HashIcon,
  HeadsetIcon,
  KeyRoundIcon,
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

import { notifications } from "@/components/blocks/_data/notifications"
import { currentAgent } from "@/components/blocks/_data/team"
import { AgentStatus } from "@/components/blocks/_parts/agent-status"
import { applyBlockTheme, blockThemes, isBlockTheme, type BlockThemeId } from "@/components/blocks/_parts/block-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Logo } from "@/components/ui/logo"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export type AppSection = "ticket" | "dashboard" | "report" | "setting"

const nav: { id: AppSection; label: string; href: string }[] = [
  { id: "ticket", label: "Ticket", href: "/blocks/ticket-inbox-01" },
  { id: "dashboard", label: "Dashboard", href: "/blocks/dashboard-01" },
  { id: "report", label: "Report", href: "/blocks/report-01" },
  { id: "setting", label: "Setting", href: "/blocks/settings-01" },
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

export function AppHeader({ active }: { active: AppSection }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [scope, setScope] = useState("Content")
  const [theme, setTheme] = useState<BlockThemeId>("classic")
  const unread = notifications.filter((n) => n.unread).length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !isTyping(e.target)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-3 text-card-foreground md:gap-4 md:px-4">
      <Logo
        href="/blocks"
        className="shrink-0 text-base"
        mark={
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground [&_svg]:size-4!">
            <MessagesSquareIcon />
          </span>
        }
        name={<span className="hidden sm:inline">Sociomile</span>}
        aria-label="Sociomile home"
      />

      <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
        {nav.map((item) => (
          <Button key={item.id} asChild size="sm" variant={item.id === active ? "secondary" : "ghost"}>
            <Link href={item.href} aria-current={item.id === active ? "page" : undefined}>
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
            <MenuIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {nav.map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link href={item.href} aria-current={item.id === active ? "page" : undefined}>
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex min-w-0 flex-1 justify-center">
        <Button
          variant="outline"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          aria-keyshortcuts="/"
          className="w-full max-w-md justify-start text-muted-foreground max-sm:size-8 max-sm:w-8 max-sm:justify-center"
        >
          <SearchIcon />
          <span className="flex-1 truncate text-left max-sm:hidden">Search tickets, customers, agents…</span>
          <Kbd className="max-sm:hidden">/</Kbd>
        </Button>
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

      <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
        <AgentStatus />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
              <BellIcon />
              {unread > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[0.625rem] tabular-nums">{unread}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <PopoverHeader className="border-b px-4 py-3">
              <PopoverTitle>Notifications</PopoverTitle>
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
            <Button variant="ghost" size="icon" aria-label="Help">
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
            <Button variant="ghost" size="icon" className="rounded-full" aria-label={`Account menu for ${currentAgent.name}`}>
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{currentAgent.initials}</AvatarFallback>
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
  )
}
