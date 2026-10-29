"use client"

import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// One source for the bulk bar and the row kebab menu.
export const ticketActions = [
  { label: "Assign", items: ["Assign to me", "Assign to agent", "Release"] },
  { label: "Status", items: ["Pending", "Close"] },
  { label: "Sentiment", items: ["Positive", "Neutral", "Negative"] },
  { label: "More", items: ["Spam", "Other", "Blacklist", "Bookmark", "Reply WABA", "Download Excel"] },
]

export function TicketActionMenuItems() {
  return ticketActions.map((group, i) => (
    <DropdownMenuGroup key={group.label}>
      {i > 0 && <DropdownMenuSeparator />}
      <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
      {group.items.map((item) => (
        <DropdownMenuItem key={item} variant={item === "Blacklist" ? "destructive" : "default"}>
          {item}
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  ))
}

export function BulkActions() {
  return ticketActions.map((group) => (
    <DropdownMenu key={group.label}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="xs">
          {group.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {group.items.map((item) => (
          <DropdownMenuItem key={item} variant={item === "Blacklist" ? "destructive" : "default"}>
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ))
}
