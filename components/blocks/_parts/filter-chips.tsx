"use client"

import { useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Pill } from "@/components/ui/pill"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type FilterChip = { id: string; label: string; value: string }

// Notion-style filter row: each active filter is a removable Pill; "Add filter" brings removed ones back.
export function FilterChips({ filters }: { filters: FilterChip[] }) {
  const [activeIds, setActiveIds] = useState(() => filters.map((f) => f.id))
  const [open, setOpen] = useState(false)
  const active = filters.filter((f) => activeIds.includes(f.id))
  const available = filters.filter((f) => !activeIds.includes(f.id))

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-1.5">
      {active.map((f) => (
        <li key={f.id}>
          <Pill className="h-6 gap-1 pr-0.5">
            <span className="text-muted-foreground">{f.label}:</span>
            {f.value}
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-5 rounded-full"
              aria-label={`Remove ${f.label} filter`}
              onClick={() => setActiveIds((ids) => ids.filter((id) => id !== f.id))}
            >
              <XIcon />
            </Button>
          </Pill>
        </li>
      ))}
      <li>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="xs" className="h-6 rounded-full text-muted-foreground">
              <PlusIcon />
              Add filter
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-0">
            <Command>
              <CommandInput placeholder="Filter by…" />
              <CommandList>
                <CommandEmpty>All filters are applied.</CommandEmpty>
                {available.length > 0 && (
                  <CommandGroup>
                    {available.map((f) => (
                      <CommandItem
                        key={f.id}
                        value={f.label}
                        onSelect={() => {
                          setActiveIds((ids) => [...ids, f.id])
                          setOpen(false)
                        }}
                      >
                        {f.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </li>
    </ul>
  )
}
