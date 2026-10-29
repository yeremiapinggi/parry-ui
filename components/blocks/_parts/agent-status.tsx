"use client"

import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { currentAgent, type Presence } from "@/components/blocks/_data/team"
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

export function AgentStatus() {
  const [presence, setPresence] = useState<Presence>(currentAgent.presence)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Agent status: ${presenceMeta[presence].label}`}>
          <PresenceDot presence={presence} />
          <span className="hidden lg:inline">{presenceMeta[presence].label}</span>
          <ChevronDownIcon className="hidden lg:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Agent status</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={presence} onValueChange={(v) => setPresence(v as Presence)}>
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
