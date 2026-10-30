"use client"

import * as React from "react"

import { cn } from "cn"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// Free-text input that suggests matches while typing; unlike Combobox, any value is allowed.
function Autocomplete({
  value,
  onValueChange,
  suggestions,
  placeholder,
  emptyText,
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  onValueChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  // Omit to hide the list when nothing matches.
  emptyText?: string
  className?: string
  "aria-label"?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Command
      data-slot="autocomplete"
      className={cn("relative h-auto overflow-visible bg-transparent p-0", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false)
      }}
    >
      <CommandInput
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onValueChange={(next) => {
          onValueChange(next)
          setOpen(next.length > 0)
        }}
        onFocus={() => setOpen(value.length > 0)}
        onBlur={() => setOpen(false)}
      />
      <CommandList
        hidden={!open}
        className={cn("absolute inset-x-0 top-full z-50 mt-1 rounded-lg border bg-popover p-1 shadow-md", !emptyText && "[&:not(:has([cmdk-item]))]:hidden")}
      >
        {emptyText && <CommandEmpty>{emptyText}</CommandEmpty>}
        {suggestions.map((suggestion) => (
          <CommandItem
            key={suggestion}
            value={suggestion}
            // Keep focus in the input so the blur handler doesn't close the list before selection.
            onMouseDown={(e) => e.preventDefault()}
            onSelect={() => {
              onValueChange(suggestion)
              setOpen(false)
            }}
          >
            {suggestion}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export { Autocomplete }
