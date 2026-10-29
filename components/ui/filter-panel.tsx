"use client"

import * as React from "react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type FilterPanelSection = {
  id: string
  title: string
  options: { value: string; label: string; count?: number }[]
}

// Faceted checkbox filters grouped in sections; `value` maps section id → checked option values.
function FilterPanel({
  sections,
  value,
  onValueChange,
  className,
}: {
  sections: FilterPanelSection[]
  value: Record<string, string[]>
  onValueChange: (value: Record<string, string[]>) => void
  className?: string
}) {
  const id = React.useId()
  const active = Object.values(value).reduce((n, v) => n + v.length, 0)
  const toggle = (section: string, option: string, checked: boolean) => {
    const current = value[section] ?? []
    onValueChange({ ...value, [section]: checked ? [...current, option] : current.filter((v) => v !== option) })
  }

  return (
    <aside data-slot="filter-panel" aria-label="Filters" className={cn("flex w-full flex-col gap-4 text-sm", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Filters{active > 0 && <span className="text-muted-foreground"> · {active}</span>}</span>
        <Button variant="ghost" size="xs" disabled={active === 0} onClick={() => onValueChange({})}>
          Clear all
        </Button>
      </div>
      {sections.map((section) => (
        <fieldset key={section.id} className="flex flex-col gap-2 border-t pt-3">
          <legend className="float-left mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{section.title}</legend>
          {section.options.map((option) => {
            const optionId = `${id}-${section.id}-${option.value}`
            return (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={optionId}
                  checked={value[section.id]?.includes(option.value) ?? false}
                  onCheckedChange={(checked) => toggle(section.id, option.value, checked === true)}
                />
                <Label htmlFor={optionId} className="flex-1 font-normal">{option.label}</Label>
                {option.count !== undefined && <span className="text-xs text-muted-foreground tabular-nums">{option.count}</span>}
              </div>
            )
          })}
        </fieldset>
      ))}
    </aside>
  )
}

export { FilterPanel, type FilterPanelSection }
