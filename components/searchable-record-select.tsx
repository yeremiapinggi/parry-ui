"use client"

import { useId, useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { SelectOption } from "@/lib/create-edit-form-config"

export function SearchableRecordSelect({
  id,
  label,
  value,
  options,
  placeholder,
  disabled,
  onValueChange,
}: {
  id: string
  label: string
  value: string
  options: SelectOption[]
  placeholder: string
  disabled?: boolean
  onValueChange: (value: string) => void
}) {
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  )

  return (
    <Popover open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setQuery("") }}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          role="combobox"
          variant="outline"
          aria-label={label}
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={selectedOption ? "truncate text-foreground" : "truncate text-muted-foreground"}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronsUpDownIcon aria-hidden="true" className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent data-parry-theme align="start" className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-2">
        <div className="relative">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
            aria-label={`Search ${label.toLowerCase()}`}
            className="pl-8"
          />
        </div>
        <div id={listboxId} role="listbox" aria-label={label} className="flex max-h-48 flex-col overflow-y-auto">
          {filteredOptions.length ? filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => { onValueChange(option.value); setOpen(false) }}
              className="flex min-h-9 items-center justify-between gap-3 rounded-md px-2.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />}
            </button>
          )) : <p role="status" className="px-2.5 py-3 text-sm text-muted-foreground">No matching options.</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function RecordTagsSelect({
  id,
  values,
  options,
  disabled,
  onValuesChange,
}: {
  id: string
  values: string[]
  options: SelectOption[]
  disabled?: boolean
  onValuesChange: (values: string[]) => void
}) {
  const listboxId = useId()
  const selectedOptions = options.filter((option) => values.includes(option.value))

  function toggleValue(value: string, checked: boolean) {
    onValuesChange(checked ? [...values, value] : values.filter((item) => item !== value))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-label="Tags"
          aria-haspopup="listbox"
          aria-controls={listboxId}
          disabled={disabled}
          className="h-auto min-h-8 w-full justify-between gap-2 py-1.5 font-normal"
        >
          <span className="flex min-w-0 flex-wrap items-center gap-1">
            {selectedOptions.length ? selectedOptions.map((option) => <Badge key={option.value} variant="secondary" className="font-normal">{option.label}</Badge>) : <span className="text-muted-foreground">Select tags</span>}
          </span>
          <ChevronsUpDownIcon aria-hidden="true" className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent data-parry-theme align="start" className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-3">
        <p className="text-xs font-medium text-muted-foreground">Select one or more tags</p>
        <div id={listboxId} role="group" aria-label="Available tags" className="flex flex-col gap-2">
          {options.map((option) => {
            const optionId = `${listboxId}-${option.value}`
            return (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox id={optionId} checked={values.includes(option.value)} disabled={disabled} onCheckedChange={(checked) => toggleValue(option.value, checked === true)} />
                <label htmlFor={optionId} className="cursor-pointer text-sm">{option.label}</label>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
