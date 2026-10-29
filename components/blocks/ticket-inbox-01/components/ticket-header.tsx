"use client"

import {
  BanIcon,
  BookmarkIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  CopyIcon,
  EllipsisIcon,
  FileSpreadsheetIcon,
  GitMergeIcon,
  Maximize2Icon,
  Minimize2Icon,
  PanelRightIcon,
  RotateCcwIcon,
  UserRoundXIcon,
  XIcon,
} from "lucide-react"

import { cn } from "cn"

import { team } from "@/components/blocks/_data/team"
import type { Sentiment, Ticket, TicketStatus } from "@/components/blocks/_data/tickets"
import { sentimentMeta, shortcuts, statusMeta } from "@/components/blocks/ticket-inbox-01/components/ticket-meta"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

function Hint({ label, keys, children }: { label: string; keys?: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {label}
        {keys && <Kbd>{keys}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

export function TicketHeader({
  ticket: t,
  status,
  onStatusChange,
  assignee,
  onAssign,
  assignOpen,
  onAssignOpenChange,
  sentiment,
  onSentimentChange,
  bookmarked,
  onBookmarkedChange,
  expanded,
  onToggleExpanded,
  onOpenDetails,
}: {
  ticket: Ticket
  status: TicketStatus
  onStatusChange: (s: TicketStatus) => void
  assignee: string | null
  onAssign: (agent: string | null) => void
  assignOpen: boolean
  onAssignOpenChange: (open: boolean) => void
  sentiment: Sentiment
  onSentimentChange: (s: Sentiment) => void
  bookmarked: boolean
  onBookmarkedChange: (b: boolean) => void
  expanded: boolean
  onToggleExpanded: () => void
  onOpenDetails: () => void
}) {
  const closed = status === "closed"

  return (
    <header className="border-b bg-card px-4 py-2.5 text-card-foreground md:px-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <DialogTitle className="font-heading text-lg font-semibold">
          Ticket <span className="font-mono">#{t.id}</span>
        </DialogTitle>

        <DropdownMenu>
          <Hint label="Change status">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" aria-label={`Status: ${statusMeta[status].label}`}>
                <span aria-hidden="true" className={cn("size-2 rounded-full", statusMeta[status].dot)} />
                {statusMeta[status].label}
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
          </Hint>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={status} onValueChange={(v) => onStatusChange(v as TicketStatus)}>
              {(Object.keys(statusMeta) as TicketStatus[]).map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  <span aria-hidden="true" className={cn("size-2 rounded-full", statusMeta[s].dot)} />
                  {statusMeta[s].label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu open={assignOpen} onOpenChange={onAssignOpenChange}>
            <Hint label="Reassign" keys={shortcuts.assign}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 pl-1" aria-label={assignee ? `Assignee: ${assignee}, reassign` : "Unassigned, assign"}>
                  <Avatar size="sm">
                    <AvatarFallback>{assignee ? initialsOf(assignee) : "?"}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate max-sm:hidden">{assignee ?? "Unassigned"}</span>
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
            </Hint>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Assign to agent</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={assignee ?? ""} onValueChange={(v) => onAssign(v)}>
                {team.map((a) => (
                  <DropdownMenuRadioItem key={a.id} value={a.name} disabled={a.presence === "offline"}>
                    {a.name}
                    {a.presence === "offline" && <span className="ml-auto text-xs text-muted-foreground">Offline</span>}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!assignee} onSelect={() => onAssign(null)}>
                <UserRoundXIcon />
                Release assignment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Hint label={closed ? "Reopen ticket" : "Close ticket"} keys={shortcuts.closeReopen}>
            <Button size="sm" variant={closed ? "default" : "outline"} onClick={() => onStatusChange(closed ? "open" : "closed")}>
              {closed ? <RotateCcwIcon /> : <CircleCheckIcon />}
              {closed ? "Reopen" : "Close ticket"}
            </Button>
          </Hint>

          <DropdownMenu>
            <Hint label="More actions">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                  <EllipsisIcon />
                </Button>
              </DropdownMenuTrigger>
            </Hint>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sentiment</DropdownMenuLabel>
                {(Object.keys(sentimentMeta) as Sentiment[]).map((s) => {
                  const M = sentimentMeta[s]
                  return (
                    <DropdownMenuItem key={s} disabled={s === sentiment} onSelect={() => onSentimentChange(s)}>
                      <M.icon className={M.tone} />
                      Set {M.label}
                      {s === sentiment && <DropdownMenuShortcut>Current</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Flags</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={bookmarked} onCheckedChange={(v) => onBookmarkedChange(v === true)}>
                  <BookmarkIcon />
                  Bookmark
                </DropdownMenuCheckboxItem>
                <DropdownMenuItem variant="destructive">
                  <BanIcon />
                  Blacklist customer
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Contact</DropdownMenuLabel>
                <DropdownMenuItem>
                  <GitMergeIcon />
                  Search &amp; Merge contact
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Export</DropdownMenuLabel>
                <DropdownMenuItem>
                  <FileSpreadsheetIcon />
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyIcon />
                  Copy ticket link
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Hint label="Ticket details">
            <Button variant="ghost" size="icon-sm" className="xl:hidden" aria-label="Show ticket details" onClick={onOpenDetails}>
              <PanelRightIcon />
            </Button>
          </Hint>
          <Hint label={expanded ? "Exit full screen" : "Full screen"}>
            <Button variant="ghost" size="icon-sm" className="max-md:hidden" aria-label={expanded ? "Exit full screen" : "Full screen"} onClick={onToggleExpanded}>
              {expanded ? <Minimize2Icon /> : <Maximize2Icon />}
            </Button>
          </Hint>
          <Hint label="Close" keys="Esc">
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close ticket window">
                <XIcon />
              </Button>
            </DialogClose>
          </Hint>
        </div>
      </div>

    </header>
  )
}
