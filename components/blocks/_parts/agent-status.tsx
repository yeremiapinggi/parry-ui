"use client"

import { ChevronDownIcon } from "lucide-react"

import { cn } from "cn"

import type { Presence } from "@/components/blocks/_data/team"
import { PresenceDot, presenceMeta } from "@/components/blocks/_parts/presence-dot"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Top-bar pill: the agent's availability for new tickets.
export function AgentStatus({ value, onChange, className }: { value: Presence; onChange: (p: Presence) => void; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("h-9 rounded-full px-3", className)} aria-label={`Agent status: ${presenceMeta[value].label}`}>
          <PresenceDot presence={value} />
          {presenceMeta[value].label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>Agent status</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as Presence)}>
          {(Object.keys(presenceMeta) as Presence[]).map((p) => (
            <DropdownMenuRadioItem key={p} value={p}>
              <PresenceDot presence={p} />
              {presenceMeta[p].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
