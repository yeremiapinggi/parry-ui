"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon, Columns3Icon, Layers3Icon, PinIcon, Rows3Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  defaultConfiguration,
  tableColumns,
  type ColumnKey,
  type GroupByKey,
  type StickyColumnCount,
  type TableDensity,
  type ViewConfiguration,
} from "@/lib/advanced-filterable-table-data"

const sections = [
  { id: "columns", label: "Columns", icon: Columns3Icon },
  { id: "density", label: "Density", icon: Rows3Icon },
  { id: "sticky", label: "Sticky columns", icon: PinIcon },
  { id: "grouping", label: "Grouping", icon: Layers3Icon },
] as const

type Section = (typeof sections)[number]["id"]

const densityOptions: { value: TableDensity; label: string; description: string }[] = [
  { value: "compact", label: "Compact", description: "More records in less space" },
  { value: "default", label: "Default", description: "Balanced row spacing" },
  { value: "comfortable", label: "Comfortable", description: "More room to scan" },
]

const groupingOptions: { value: GroupByKey | "none"; label: string }[] = [
  { value: "none", label: "None" },
  { value: "owner", label: "Owner" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "channel", label: "Channel" },
]

function ColumnOptions({ configuration, onChange, onReset }: {
  configuration: ViewConfiguration
  onChange: (patch: Partial<ViewConfiguration>) => void
  onReset: () => void
}) {
  function toggleColumn(key: ColumnKey, checked: boolean | "indeterminate") {
    if (tableColumns.find(({ key: columnKey }) => columnKey === key)?.required) return
    const nextVisible = new Set(configuration.visibleColumns)
    if (checked) nextVisible.add(key)
    else nextVisible.delete(key)
    onChange({ visibleColumns: configuration.columnOrder.filter((column) => nextVisible.has(column)) })
  }

  function moveColumn(key: ColumnKey, direction: -1 | 1) {
    const index = configuration.columnOrder.indexOf(key)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= configuration.columnOrder.length) return
    const nextOrder = [...configuration.columnOrder]
    ;[nextOrder[index], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[index]]
    onChange({ columnOrder: nextOrder })
  }

  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">Columns</h3>
        <p className="text-xs text-muted-foreground">Choose fields and set their order.</p>
      </div>
      <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={onReset}>Reset</Button>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto p-2">
      {configuration.columnOrder.map((key, index) => {
        const column = tableColumns.find(({ key: columnKey }) => columnKey === key)
        if (!column) return null
        const checked = column.required || configuration.visibleColumns.includes(key)
        return <div key={key} className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
          <Checkbox aria-label={`Show ${column.label} column`} checked={checked} disabled={column.required} onCheckedChange={(value) => toggleColumn(key, value)} />
          <span className="min-w-0 flex-1 truncate text-sm">{column.label}</span>
          {column.required && <span className="text-xs text-muted-foreground">Required</span>}
          <div className="flex shrink-0 items-center">
            <Button type="button" variant="ghost" size="icon-xs" className="size-7" aria-label={`Move ${column.label} earlier`} disabled={index === 0} onClick={() => moveColumn(key, -1)}><ChevronUpIcon /></Button>
            <Button type="button" variant="ghost" size="icon-xs" className="size-7" aria-label={`Move ${column.label} later`} disabled={index === configuration.columnOrder.length - 1} onClick={() => moveColumn(key, 1)}><ChevronDownIcon /></Button>
          </div>
        </div>
      })}
    </div>
  </div>
}

export function AdvancedTableViewOptions({ configuration, onChange }: {
  configuration: ViewConfiguration
  onChange: (patch: Partial<ViewConfiguration>) => void
}) {
  const [section, setSection] = useState<Section>("columns")

  function resetColumns() {
    onChange({
      visibleColumns: [...defaultConfiguration.visibleColumns],
      columnOrder: [...defaultConfiguration.columnOrder],
    })
  }

  return <Popover>
    <PopoverTrigger asChild>
      <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5">
        <Columns3Icon data-icon="inline-start" />View options<ChevronDownIcon data-icon="inline-end" />
      </Button>
    </PopoverTrigger>
    <PopoverContent data-parry-theme side="bottom" align="end" collisionPadding={12} className="w-[min(46rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] max-h-[var(--radix-popover-content-available-height)] overflow-hidden p-0">
      <div className="flex max-h-[min(34rem,var(--radix-popover-content-available-height))] min-h-0 flex-col">
        <header className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">View options</h2>
          <p className="text-xs text-muted-foreground">Adjust the table layout and organization.</p>
        </header>
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav aria-label="View option sections" role="tablist" className="grid shrink-0 grid-cols-2 gap-1 border-b p-2 sm:flex sm:w-44 sm:grid-cols-1 sm:flex-col sm:border-b-0 sm:border-r">
            {sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" id={`table-options-tab-${id}`} aria-selected={section === id} aria-controls="table-options-panel" onClick={() => setSection(id)} className={`flex min-h-9 shrink-0 items-center gap-2 rounded-md px-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:w-full ${section === id ? "bg-info-soft text-info" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Icon aria-hidden="true" className="size-4 shrink-0" />{label}
            </button>)}
          </nav>
          <div id="table-options-panel" role="tabpanel" aria-labelledby={`table-options-tab-${section}`} className="flex min-h-0 min-w-0 flex-1 flex-col">
            {section === "columns" && <ColumnOptions configuration={configuration} onChange={onChange} onReset={resetColumns} />}
            {section === "density" && <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <div><h3 className="text-sm font-semibold">Row density</h3><p className="text-xs text-muted-foreground">Changes apply immediately to the table.</p></div>
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">Table density</legend>
                {densityOptions.map(({ value, label, description }) => <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${configuration.density === value ? "border-info/50 bg-info-soft/50" : "hover:bg-muted/60"}`}>
                  <input type="radio" name="table-density" value={value} checked={configuration.density === value} onChange={() => onChange({ density: value })} className="mt-0.5 accent-primary" />
                  <span className="flex min-w-0 flex-col gap-0.5"><span className="text-sm font-medium">{label}</span><span className="text-xs text-muted-foreground">{description}</span></span>
                </label>)}
              </fieldset>
            </div>}
            {section === "sticky" && <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
              <div><h3 className="text-sm font-semibold">Sticky columns</h3><p className="text-xs text-muted-foreground">Keep key fields visible while scrolling horizontally.</p></div>
              <label className="flex flex-col gap-1.5 text-sm font-medium">First columns
                <Select value={String(configuration.stickyFirst)} onValueChange={(value) => onChange({ stickyFirst: Number(value) as StickyColumnCount })}>
                  <SelectTrigger aria-label="Sticky first columns"><SelectValue /></SelectTrigger>
                  <SelectContent data-parry-theme><SelectGroup><SelectItem value="0">None</SelectItem><SelectItem value="1">First column</SelectItem><SelectItem value="2">First two columns</SelectItem></SelectGroup></SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">Last columns
                <Select value={String(configuration.stickyLast)} onValueChange={(value) => onChange({ stickyLast: Number(value) as StickyColumnCount })}>
                  <SelectTrigger aria-label="Sticky last columns"><SelectValue /></SelectTrigger>
                  <SelectContent data-parry-theme><SelectGroup><SelectItem value="0">None</SelectItem><SelectItem value="1">Last column</SelectItem><SelectItem value="2">Last two columns</SelectItem></SelectGroup></SelectContent>
                </Select>
              </label>
              {configuration.visibleColumns.length <= 2 && <p className="text-xs leading-relaxed text-muted-foreground">Sticky counts adjust automatically when only a few columns are visible.</p>}
            </div>}
            {section === "grouping" && <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <div><h3 className="text-sm font-semibold">Group records</h3><p className="text-xs text-muted-foreground">Group the filtered results and expand or collapse each section.</p></div>
              <label className="flex flex-col gap-1.5 text-sm font-medium">Group by
                <Select value={configuration.groupBy} onValueChange={(value) => onChange({ groupBy: value as GroupByKey | "none" })}>
                <SelectTrigger aria-label="Group records by" className="w-full justify-start"><Layers3Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /><SelectValue className="min-w-0 flex-1 text-left" /></SelectTrigger>
                <SelectContent data-parry-theme position="popper" align="start" className="w-[var(--radix-select-trigger-width)]"><SelectGroup>{groupingOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </label>
              <p className="text-xs leading-relaxed text-muted-foreground">Group counts reflect all matching records, not only the current page.</p>
            </div>}
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
}
