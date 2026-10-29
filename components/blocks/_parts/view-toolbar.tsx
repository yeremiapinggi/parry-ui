"use client"

import { useState } from "react"
import { ArrowUpDownIcon, ChevronDownIcon, ListFilterIcon, PlusIcon, SearchIcon, Trash2Icon, XIcon, type LucideIcon } from "lucide-react"

import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
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
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type FilterField = { id: string; label: string; icon: LucideIcon; options: string[] }
export type ActiveFilter = { id: string; value: string }
export type SortOption = { id: string; label: string }

// Icon button that turns primary while its feature is in use (a filter set, a non-default sort, a query).
const toolClass = (on: boolean) => cn("text-muted-foreground", on && "text-primary hover:text-primary")

function Tool({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function FieldPicker({
  fields,
  onPick,
  tooltip,
  children,
}: {
  fields: FilterField[]
  onPick: (id: string) => void
  tooltip?: string
  children: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const trigger = <PopoverTrigger asChild>{children}</PopoverTrigger>
  return (
    <Popover open={open} onOpenChange={setOpen}>
      {tooltip ? <Tool label={tooltip}>{trigger}</Tool> : trigger}
      <PopoverContent align="end" className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Filter by…" />
          <CommandList>
            <CommandEmpty>All filters are in use.</CommandEmpty>
            {fields.length > 0 && (
              <CommandGroup>
                {fields.map((f) => (
                  <CommandItem
                    key={f.id}
                    value={f.label}
                    onSelect={() => {
                      setOpen(false)
                      onPick(f.id)
                    }}
                  >
                    <f.icon />
                    {f.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Notion-style view toolbar: `leading` (e.g. a row count) on the left, Filter / Sort / Search icon tools and
 * `trailing` on the right. Once a filter exists, a second row lists it as an editable chip.
 */
export function ViewToolbar({
  leading,
  trailing,
  fields,
  filters,
  onFiltersChange,
  sortOptions,
  sort,
  onSortChange,
  query,
  onQueryChange,
  searchPlaceholder = "Search…",
}: {
  leading: React.ReactNode
  trailing?: React.ReactNode
  fields: FilterField[]
  filters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  sortOptions: SortOption[]
  sort: string
  onSortChange: (id: string) => void
  query: string
  onQueryChange: (q: string) => void
  searchPlaceholder?: string
}) {
  const [searching, setSearching] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const unused = fields.filter((f) => !filters.some((a) => a.id === f.id))
  const field = (id: string) => fields.find((f) => f.id === id)!

  // A new filter starts on its first option and opens straight away so its value can be picked.
  const add = (id: string) => {
    onFiltersChange([...filters, { id, value: field(id).options[0] }])
    setEditing(id)
  }
  const setValue = (id: string, value: string) => onFiltersChange(filters.map((f) => (f.id === id ? { ...f, value } : f)))
  const remove = (id: string) => onFiltersChange(filters.filter((f) => f.id !== id))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-1">{leading}</div>
        <div role="toolbar" aria-label="View options" className="flex items-center gap-0.5">
          <FieldPicker fields={unused} onPick={add} tooltip="Filter">
            <Button variant="ghost" size="icon-sm" aria-label="Filter" className={toolClass(filters.length > 0)}>
              <ListFilterIcon />
            </Button>
          </FieldPicker>

          <DropdownMenu>
            <Tool label="Sort">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Sort" className={toolClass(sort !== sortOptions[0].id)}>
                  <ArrowUpDownIcon />
                </Button>
              </DropdownMenuTrigger>
            </Tool>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sort} onValueChange={onSortChange}>
                {sortOptions.map((o) => (
                  <DropdownMenuRadioItem key={o.id} value={o.id}>
                    {o.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {searching || query ? (
            <InputGroup className="h-8 w-48 sm:w-60">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onBlur={() => !query && setSearching(false)}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") return
                  onQueryChange("")
                  setSearching(false)
                }}
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => onQueryChange("")}>
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          ) : (
            <Tool label="Search">
              <Button variant="ghost" size="icon-sm" aria-label="Search" className={toolClass(false)} onClick={() => setSearching(true)}>
                <SearchIcon />
              </Button>
            </Tool>
          )}

          {trailing}
        </div>
      </div>

      {filters.length > 0 && (
        <ul aria-label="Active filters" className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => {
            const { label, icon: Icon, options } = field(f.id)
            return (
              <li key={f.id}>
                <DropdownMenu open={editing === f.id} onOpenChange={(open) => setEditing(open ? f.id : null)}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="xs" className="h-7 rounded-full border-primary/40 bg-primary/5 px-2.5 text-primary hover:bg-primary/10 hover:text-primary">
                      <Icon />
                      <span className="font-normal">{label}:</span>
                      <span className="font-medium">{f.value}</span>
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuLabel>{label}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={f.value} onValueChange={(v) => setValue(f.id, v)}>
                      {options.map((o) => (
                        <DropdownMenuRadioItem key={o} value={o}>
                          {o}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => remove(f.id)}>
                      <Trash2Icon />
                      Remove filter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )
          })}
          {unused.length > 0 && (
            <li>
              <FieldPicker fields={unused} onPick={add}>
                <Button variant="ghost" size="xs" className="h-7 rounded-full text-muted-foreground">
                  <PlusIcon />
                  Add filter
                </Button>
              </FieldPicker>
            </li>
          )}
          <li>
            <Button variant="ghost" size="xs" className="h-7 text-muted-foreground" onClick={() => onFiltersChange([])}>
              Reset
            </Button>
          </li>
        </ul>
      )}
    </div>
  )
}
