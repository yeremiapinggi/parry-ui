"use client"

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  FilterIcon,
  GripVerticalIcon,
  Layers3Icon,
} from "lucide-react"
import { toast } from "sonner"

import { AdvancedFilterBuilder } from "@/components/advanced-filter-builder"
import { AdvancedTableViewOptions } from "@/components/advanced-table-view-options"
import { RecordDetailPanel } from "@/components/record-detail-panel"
import {
  defaultConfiguration,
  demoRecords,
  demoSavedViews,
  recordPriorities,
  recordStatuses,
  tableColumns,
  type ColumnKey,
  type EnterpriseRecord,
  type FilterGroup,
  type GroupByKey,
  type RecordPriority,
  type RecordStatus,
  type SavedView,
  type ViewConfiguration,
} from "@/lib/advanced-filterable-table-data"
import { cloneFilterGroup, flattenConditions, recordMatchesGroup, sortRecords } from "@/lib/advanced-filter-engine"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const STORAGE_KEY = "parry-ui-advanced-filterable-table-views-v1"
const pageSizeOptions = [10, 20, 50]
const groupOptions: { value: GroupByKey | "none"; label: string }[] = [
  { value: "none", label: "None" },
  { value: "owner", label: "Owner" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "channel", label: "Channel" },
]
const selectionColumnWidth = 40
const columnWidths: Record<ColumnKey, number> = {
  id: 132,
  name: 184,
  company: 190,
  channel: 118,
  status: 128,
  priority: 112,
  owner: 158,
  createdAt: 146,
  updatedAt: 146,
}

function isColumnKey(value: unknown): value is ColumnKey {
  return typeof value === "string" && tableColumns.some(({ key }) => key === value)
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00.000Z`))
}

function statusTone(status: EnterpriseRecord["status"]) {
  if (status === "Resolved") return "border-success/30 bg-success-soft text-success"
  if (status === "In review") return "border-info/30 bg-info-soft text-info"
  if (status === "On hold") return "border-warning/30 bg-warning-soft text-warning"
  return "border-border bg-secondary text-secondary-foreground"
}

function priorityTone(priority: EnterpriseRecord["priority"]) {
  if (priority === "Urgent") return "border-destructive/30 bg-destructive-soft text-destructive"
  if (priority === "High") return "border-warning/30 bg-warning-soft text-warning"
  if (priority === "Low") return "border-border bg-secondary text-secondary-foreground"
  return "border-info/30 bg-info-soft text-info"
}

function StatusQuickFilter({ selectedStatuses, onChange }: {
  selectedStatuses: RecordStatus[]
  onChange: (statuses: RecordStatus[]) => void
}) {
  function toggleStatus(status: RecordStatus, checked: boolean | "indeterminate") {
    const nextStatuses = new Set(selectedStatuses)
    if (checked) nextStatuses.add(status)
    else nextStatuses.delete(status)
    onChange(recordStatuses.filter((option) => nextStatuses.has(option)))
  }

  return <Popover>
    <PopoverTrigger asChild>
      <Button type="button" variant={selectedStatuses.length ? "secondary" : "outline"} size="sm" className="h-8 gap-1.5 px-2.5" aria-label={selectedStatuses.length ? `Filter by status, ${selectedStatuses.length} selected` : "Filter by status"}>
        Status
        {selectedStatuses.length > 0 && <Badge variant="outline" className="h-5 min-w-5 px-1 text-[10px]">{selectedStatuses.length}</Badge>}
        <ChevronDownIcon data-icon="inline-end" />
      </Button>
    </PopoverTrigger>
    <PopoverContent data-parry-theme side="bottom" align="start" collisionPadding={12} className="w-52 p-2">
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <span className="text-xs font-semibold">Status</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={selectedStatuses.length === 0} onClick={() => onChange([])}>Clear</Button>
      </div>
      <fieldset className="flex flex-col gap-0.5" aria-label="Filter by status">
        {recordStatuses.map((status) => <label key={status} className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
          <Checkbox checked={selectedStatuses.includes(status)} onCheckedChange={(checked) => toggleStatus(status, checked)} />
          <span className="text-left">{status}</span>
        </label>)}
      </fieldset>
    </PopoverContent>
  </Popover>
}

function PriorityQuickFilter({ selectedPriority, onChange }: {
  selectedPriority: RecordPriority | null
  onChange: (priority: RecordPriority | null) => void
}) {
  const [open, setOpen] = useState(false)
  const options: { value: RecordPriority | null; label: string }[] = [
    { value: null, label: "All priorities" },
    ...recordPriorities.map((priority) => ({ value: priority, label: priority })),
  ]

  function selectPriority(priority: RecordPriority | null) {
    onChange(priority === selectedPriority ? null : priority)
    setOpen(false)
  }

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button type="button" variant={selectedPriority ? "secondary" : "outline"} size="sm" className="h-8 gap-1.5 px-2.5" aria-label={selectedPriority ? `Filter by priority: ${selectedPriority}` : "Filter by priority"}>
        Priority
        {selectedPriority && <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{selectedPriority}</Badge>}
        <ChevronDownIcon data-icon="inline-end" />
      </Button>
    </PopoverTrigger>
    <PopoverContent data-parry-theme side="bottom" align="start" collisionPadding={12} className="w-52 p-2">
      <div className="flex flex-col gap-0.5" role="group" aria-label="Priority options">
        {options.map(({ value, label }) => <Button key={value ?? "all"} type="button" variant="ghost" size="sm" className="h-8 w-full justify-between px-2 text-left font-normal" aria-pressed={selectedPriority === value} onClick={() => selectPriority(value)}>
          <span className="text-left">{label}</span>
          {selectedPriority === value && <CheckIcon aria-hidden="true" />}
        </Button>)}
      </div>
    </PopoverContent>
  </Popover>
}

function displayCell(record: EnterpriseRecord, key: ColumnKey) {
  const value = record[key]
  if (key === "status") return <Badge variant="outline" className={statusTone(record.status)}>{record.status}</Badge>
  if (key === "priority") return <Badge variant="outline" className={priorityTone(record.priority)}>{record.priority}</Badge>
  if (key === "createdAt" || key === "updatedAt") return dateLabel(String(value))
  if (key === "id") return <span className="font-mono text-xs text-muted-foreground">{value}</span>
  return value
}

function safeConfiguration(value: unknown): value is ViewConfiguration {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<ViewConfiguration>
  return typeof candidate.search === "string" &&
    Array.isArray(candidate.visibleColumns) && candidate.visibleColumns.every(isColumnKey) &&
    (candidate.columnOrder === undefined || (Array.isArray(candidate.columnOrder) && candidate.columnOrder.every(isColumnKey))) &&
    (candidate.density === undefined || candidate.density === "compact" || candidate.density === "default" || candidate.density === "comfortable") &&
    (candidate.stickyFirst === undefined || [0, 1, 2].includes(candidate.stickyFirst)) &&
    (candidate.stickyLast === undefined || [0, 1, 2].includes(candidate.stickyLast)) &&
    !!candidate.sort && (candidate.sort.key === null || isColumnKey(candidate.sort.key)) &&
    (candidate.sort.direction === "asc" || candidate.sort.direction === "desc") &&
    !!candidate.filters && typeof candidate.filters === "object" && Array.isArray(candidate.filters.conditions) && Array.isArray(candidate.filters.groups) &&
    (candidate.quickFilters === undefined || (!!candidate.quickFilters && Array.isArray(candidate.quickFilters.statuses) && candidate.quickFilters.statuses.every((status) => recordStatuses.includes(status)) && (candidate.quickFilters.priority === null || recordPriorities.includes(candidate.quickFilters.priority)))) &&
    (candidate.groupBy === "none" || groupOptions.some(({ value: group }) => group === candidate.groupBy)) &&
    pageSizeOptions.includes(candidate.pageSize ?? 0)
}

function normalizeConfiguration(configuration: ViewConfiguration): ViewConfiguration {
  const orderedKeys = [...new Set([
    ...(configuration.columnOrder ?? []).filter(isColumnKey),
    ...tableColumns.map(({ key }) => key),
  ])]
  const requiredKeys = tableColumns.filter(({ required }) => required).map(({ key }) => key)
  const visibleKeys = new Set([...requiredKeys, ...configuration.visibleColumns.filter(isColumnKey)])
  return {
    ...defaultConfiguration,
    ...configuration,
    quickFilters: {
      statuses: recordStatuses.filter((status) => configuration.quickFilters?.statuses?.includes(status)),
      priority: configuration.quickFilters?.priority && recordPriorities.includes(configuration.quickFilters.priority) ? configuration.quickFilters.priority : null,
    },
    filters: cloneFilterGroup(configuration.filters),
    columnOrder: orderedKeys,
    visibleColumns: orderedKeys.filter((key) => visibleKeys.has(key)),
    density: configuration.density ?? "default",
    stickyFirst: configuration.stickyFirst ?? 0,
    stickyLast: configuration.stickyLast ?? 0,
  }
}

function safeStoredViews(value: unknown): SavedView[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is SavedView => {
    if (!item || typeof item !== "object") return false
    const view = item as Partial<SavedView>
    return typeof view.id === "string" && view.id.startsWith("custom-") && typeof view.name === "string" &&
      view.name.trim().length > 0 && view.builtIn === false && safeConfiguration(view.configuration)
  }).map((view) => ({ ...view, configuration: normalizeConfiguration(view.configuration) }))
}

function equalConfiguration(first: ViewConfiguration, second: ViewConfiguration) {
  const normalizeFilters = (group: FilterGroup): unknown => ({
    logic: group.logic,
    conditions: group.conditions.map(({ field, operator, value, secondValue, values }) => ({ field, operator, value, secondValue, values })),
    groups: group.groups.map(normalizeFilters),
  })
  const normalize = (configuration: ViewConfiguration) => ({
    ...configuration,
    filters: normalizeFilters(configuration.filters),
  })
  return JSON.stringify(normalize(first)) === JSON.stringify(normalize(second))
}

function DetailModal({ record, open, onClose }: { record: EnterpriseRecord | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      {record && <DialogContent data-parry-theme showCloseButton={false} className="left-auto right-0 top-0 flex h-dvh w-[min(24rem,100vw)] max-w-none -translate-x-0 -translate-y-0 flex-col gap-0 overflow-hidden rounded-l-xl rounded-r-none p-0" aria-describedby="record-details-description">
        <DialogHeader className="sr-only"><DialogTitle>Record details</DialogTitle><DialogDescription id="record-details-description">Detailed information for {record.name}, record {record.id}.</DialogDescription></DialogHeader>
        <RecordDetailPanel record={record} onClose={onClose} className="h-full" />
      </DialogContent>}
    </Dialog>
  )
}

export function AdvancedFilterableTablePreview() {
  const [configurationState, setConfigurationState] = useState<ViewConfiguration>(() => normalizeConfiguration(defaultConfiguration))
  const [page, setPage] = useState(1)
  const [savedViews, setSavedViews] = useState<SavedView[]>(demoSavedViews)
  const [selectedViewId, setSelectedViewId] = useState("all-records")
  const [isRestoring, setIsRestoring] = useState(true)
  const [viewDialog, setViewDialog] = useState<"create" | "rename" | "delete" | "duplicate" | null>(null)
  const [viewName, setViewName] = useState("")
  const [viewError, setViewError] = useState<string | null>(null)
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(() => new Set())
  const [isNarrow, setIsNarrow] = useState(false)
  const [detailWidth, setDetailWidth] = useState(340)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())
  const [tableViewportWidth, setTableViewportWidth] = useState(0)
  const [tableScrollLeft, setTableScrollLeft] = useState(0)
  const tableLayoutRef = useRef<HTMLDivElement>(null)
  const tableViewportRef = useRef<HTMLDivElement>(null)

  const configuration = configurationState
  const { search: query, quickFilters, filters, sort, visibleColumns, columnOrder, density, stickyFirst, stickyLast, groupBy, pageSize } = configuration

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw) as { views?: unknown; selectedViewId?: unknown }
        const customViews = safeStoredViews(stored.views)
        // Browser-only preferences load after hydration so the server and first client render remain identical.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (customViews.length) setSavedViews([...demoSavedViews, ...customViews])
        if (typeof stored.selectedViewId === "string") {
          const selected = [...demoSavedViews, ...customViews].find(({ id }) => id === stored.selectedViewId)
          if (selected) {
            setSelectedViewId(selected.id)
            setConfigurationState(normalizeConfiguration(selected.configuration))
          }
        }
      }
    } catch {
      // Local demo preferences are optional; unreadable storage falls back to the built-in views.
    }
    setIsRestoring(false)
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const update = () => setIsNarrow(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const element = tableViewportRef.current
    const scroller = element?.querySelector<HTMLElement>("[data-slot=table-container]")
    if (!element || !scroller) return
    const observer = new ResizeObserver(([entry]) => setTableViewportWidth(entry.contentRect.width))
    const updateScrollPosition = () => setTableScrollLeft(scroller.scrollLeft)
    observer.observe(element)
    scroller.addEventListener("scroll", updateScrollPosition, { passive: true })
    updateScrollPosition()
    return () => {
      observer.disconnect()
      scroller.removeEventListener("scroll", updateScrollPosition)
    }
  }, [])

  useEffect(() => {
    if (isRestoring) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        views: savedViews.filter(({ builtIn }) => !builtIn),
        selectedViewId,
      }))
    } catch {
      // Keep the table usable when browser storage is disabled or full.
    }
  }, [isRestoring, savedViews, selectedViewId])

  const selectedView = savedViews.find(({ id }) => id === selectedViewId) ?? demoSavedViews[0]
  const hasUnsavedChanges = !equalConfiguration(configuration, selectedView.configuration)
  const advancedConditionCount = flattenConditions(filters).length

  const matchingRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const filtered = demoRecords.filter((record) => {
      const matchesSearch = !normalizedQuery || Object.values(record).some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery))
      const matchesQuickStatuses = quickFilters.statuses.length === 0 || quickFilters.statuses.includes(record.status)
      const matchesQuickPriority = quickFilters.priority === null || record.priority === quickFilters.priority
      return matchesSearch && matchesQuickStatuses && matchesQuickPriority && recordMatchesGroup(record, filters)
    })
    return sortRecords(filtered, sort)
  }, [filters, query, quickFilters, sort])

  const pageCount = Math.max(1, Math.ceil(matchingRecords.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRecords = matchingRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const activeColumns = columnOrder.filter((key) => visibleColumns.includes(key)).map((key) => tableColumns.find((column) => column.key === key)!).filter(Boolean)
  const selectedRecord = selectedRecordId ? matchingRecords.find(({ id }) => id === selectedRecordId) ?? null : null
  let effectiveStickyFirst = Math.min(stickyFirst, activeColumns.length)
  let effectiveStickyLast = Math.min(stickyLast, Math.max(0, activeColumns.length - effectiveStickyFirst))
  const widthOfVisibleColumns = activeColumns.reduce((total, column) => total + columnWidths[column.key], 0)
  const maxPinnedWidth = Math.max(0, tableViewportWidth - 120)
  const pinnedWidth = () => selectionColumnWidth +
    activeColumns.slice(0, effectiveStickyFirst).reduce((total, column) => total + columnWidths[column.key], 0) +
    activeColumns.slice(activeColumns.length - effectiveStickyLast).reduce((total, column) => total + columnWidths[column.key], 0)
  while ((effectiveStickyFirst > 0 || effectiveStickyLast > 0) && pinnedWidth() > maxPinnedWidth) {
    if (effectiveStickyLast > 0) effectiveStickyLast -= 1
    else effectiveStickyFirst -= 1
  }
  const tableWidth = Math.max(940, widthOfVisibleColumns + selectionColumnWidth)
  const extraWidthPerColumn = activeColumns.length ? (tableWidth - widthOfVisibleColumns - selectionColumnWidth) / activeColumns.length : 0
  const actualColumnWidth = (index: number) => columnWidths[activeColumns[index]?.key] + extraWidthPerColumn
  const stickyLastStart = activeColumns.length - effectiveStickyLast
  const stickyLastWidth = activeColumns.slice(stickyLastStart).reduce((total, _column, index) => total + actualColumnWidth(stickyLastStart + index), 0)
  const stickyLastNaturalStart = selectionColumnWidth + activeColumns.slice(0, stickyLastStart).reduce((total, _column, index) => total + actualColumnWidth(index), 0)
  const stickyLastThreshold = stickyLastNaturalStart - (tableViewportWidth - stickyLastWidth)
  const isStickyLastActive = effectiveStickyLast > 0 && tableScrollLeft + 1 >= stickyLastThreshold

  useEffect(() => {
    if (selectedRecordId && !matchingRecords.some(({ id }) => id === selectedRecordId)) {
      // A selected record must not reopen if a later query happens to match it again.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRecordId(null)
    }
  }, [matchingRecords, selectedRecordId])

  function updateConfiguration(patch: Partial<ViewConfiguration>) {
    setConfigurationState((current) => ({
      ...current,
      ...patch,
      ...(patch.filters ? { filters: cloneFilterGroup(patch.filters) } : {}),
      ...(patch.quickFilters ? { quickFilters: { statuses: [...patch.quickFilters.statuses], priority: patch.quickFilters.priority } } : {}),
      ...(patch.sort ? { sort: { ...patch.sort } } : {}),
      ...(patch.visibleColumns ? { visibleColumns: [...patch.visibleColumns] } : {}),
      ...(patch.columnOrder ? { columnOrder: [...patch.columnOrder] } : {}),
    }))
    if (patch.groupBy !== undefined || patch.search !== undefined || patch.filters !== undefined || patch.quickFilters !== undefined || patch.sort !== undefined || patch.pageSize !== undefined) setPage(1)
    if (patch.groupBy !== undefined) setCollapsedGroups(new Set())
  }

  function setConfiguration(next: ViewConfiguration) {
    setConfigurationState(normalizeConfiguration(next))
    const scroller = tableViewportRef.current?.querySelector<HTMLElement>("[data-slot=table-container]")
    if (scroller) scroller.scrollLeft = 0
    setTableScrollLeft(0)
    setPage(1)
    setCollapsedGroups(new Set())
  }

  function selectView(viewId: string) {
    const view = savedViews.find(({ id }) => id === viewId)
    if (!view) return
    setSelectedViewId(view.id)
    setConfiguration(view.configuration)
    setSelectedRecordId(null)
    setSelectedRecordIds(new Set())
  }

  function clearAdvancedFilters() {
    updateConfiguration({ filters: { id: `root-${Date.now()}`, logic: "AND", conditions: [], groups: [] } })
    setSelectedRecordId(null)
  }

  function toggleSort(key: ColumnKey) {
    updateConfiguration({ sort: {
      key: sort.key !== key ? key : sort.direction === "asc" ? key : null,
      direction: sort.key !== key || sort.direction === "desc" ? "asc" : "desc",
    } })
  }

  function handleSortKey(value: string) {
    updateConfiguration({ sort: { key: value === "none" ? null : value as ColumnKey, direction: sort.key === value ? sort.direction : "asc" } })
  }

  function openSaveAsDialog() {
    setViewName("")
    setViewError(null)
    setViewDialog("create")
  }

  function openDuplicateDialog() {
    setViewName(`${selectedView.name} copy`)
    setViewError(null)
    setViewDialog("duplicate")
  }

  function saveCurrentView() {
    if (selectedView.builtIn) {
      openSaveAsDialog()
      return
    }
    setSavedViews((current) => current.map((view) => view.id === selectedView.id ? { ...view, configuration: normalizeConfiguration(configuration) } : view))
    toast.success(`“${selectedView.name}” updated.`, { position: "bottom-right" })
  }

  function confirmViewDialog() {
    const normalizedName = viewName.trim()
    if (viewDialog !== "delete" && !normalizedName) {
      setViewError("Enter a name for this view.")
      return
    }
    if ((viewDialog === "create" || viewDialog === "duplicate" || viewDialog === "rename") && savedViews.some((view) => view.id !== selectedViewId && view.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
      setViewError("A view with that name already exists.")
      return
    }
    if (viewDialog === "create" || viewDialog === "duplicate") {
      const view: SavedView = { id: `custom-${Date.now()}`, name: normalizedName, builtIn: false, configuration: normalizeConfiguration(configuration) }
      setSavedViews((current) => [...current, view])
      setSelectedViewId(view.id)
      setViewDialog(null)
      toast.success(`“${normalizedName}” saved in this browser.`, { position: "bottom-right" })
    } else if (viewDialog === "rename" && !selectedView.builtIn) {
      setSavedViews((current) => current.map((view) => view.id === selectedView.id ? { ...view, name: normalizedName } : view))
      setViewDialog(null)
      toast.success("Saved view renamed.", { position: "bottom-right" })
    } else if (viewDialog === "delete" && !selectedView.builtIn) {
      setSavedViews((current) => current.filter((view) => view.id !== selectedView.id))
      setSelectedViewId("all-records")
      setConfiguration(demoSavedViews[0].configuration)
      setSelectedRecordId(null)
      setViewDialog(null)
      toast.success("Saved view deleted.", { position: "bottom-right" })
    }
    setViewError(null)
  }

  function openRenameDialog() {
    setViewName(selectedView.name)
    setViewError(null)
    setViewDialog("rename")
  }

  function handleResizeStart(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function handleResizeMove(event: PointerEvent<HTMLDivElement>) {
    if (event.buttons !== 1 || !tableLayoutRef.current) return
    const bounds = tableLayoutRef.current.getBoundingClientRect()
    setDetailWidth(Math.min(520, Math.max(280, bounds.right - event.clientX)))
  }

  function handleResizeKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      setDetailWidth((width) => Math.min(520, width + 16))
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      setDetailWidth((width) => Math.max(280, width - 16))
    }
  }

  function stickyStyle(index: number, isHeader: boolean): CSSProperties {
    if (index < effectiveStickyFirst) {
      return {
        position: "sticky",
        left: selectionColumnWidth + activeColumns.slice(0, index).reduce((total, _column, columnIndex) => total + actualColumnWidth(columnIndex), 0),
        zIndex: isHeader ? 30 : 10,
      }
    }
    if (isStickyLastActive && index >= activeColumns.length - effectiveStickyLast) {
      return {
        position: "sticky",
        right: activeColumns.slice(index + 1).reduce((total, _column, nextIndex) => total + actualColumnWidth(index + 1 + nextIndex), 0),
        zIndex: isHeader ? 30 : 10,
      }
    }
    return {}
  }

  const groupsOnPage = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "", records: pageRecords, total: matchingRecords.length }]
    const pageGroups = new Map<string, EnterpriseRecord[]>()
    const allCounts = new Map<string, number>()
    for (const record of matchingRecords) {
      const key = String(record[groupBy])
      allCounts.set(key, (allCounts.get(key) ?? 0) + 1)
    }
    for (const record of pageRecords) {
      const key = String(record[groupBy])
      pageGroups.set(key, [...(pageGroups.get(key) ?? []), record])
    }
    return Array.from(pageGroups.entries()).map(([key, records]) => ({ key, label: key, records, total: allCounts.get(key) ?? records.length }))
  }, [groupBy, matchingRecords, pageRecords])

  const densityClasses = density === "compact"
    ? { head: "h-9 px-3 py-1.5 text-xs", cell: "px-3 py-1.5 text-xs", row: "h-9" }
    : density === "comfortable"
      ? { head: "h-14 px-5 py-4 text-sm", cell: "px-5 py-4 text-sm", row: "h-14" }
      : { head: "h-11 px-4 py-2.5 text-sm", cell: "px-4 py-2.5 text-sm", row: "h-11" }
  const allPageSelected = pageRecords.length > 0 && pageRecords.every(({ id }) => selectedRecordIds.has(id))
  const somePageSelected = pageRecords.some(({ id }) => selectedRecordIds.has(id))

  function togglePageSelection(checked: boolean | "indeterminate") {
    setSelectedRecordIds((current) => {
      const next = new Set(current)
      for (const record of pageRecords) {
        if (checked) next.add(record.id)
        else next.delete(record.id)
      }
      return next
    })
  }

  return (
    <section aria-label="Advanced Filterable Table preview" aria-busy={isRestoring} data-parry-theme className="font-data flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">
      <header className="flex flex-col gap-1 border-b px-4 py-4 sm:px-5 sm:py-5">
        <h2 className="font-data text-xl font-semibold tracking-tight">Records Explorer</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Search, organize, and inspect a fictional enterprise dataset.</p>
      </header>

      <div className="flex flex-col gap-2.5 border-b px-3 py-3 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Select value={selectedViewId} onValueChange={selectView}>
              <SelectTrigger aria-label="Saved views" className="h-8 w-44 min-w-40"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                <SelectGroup>{savedViews.filter(({ builtIn }) => builtIn).map((view) => <SelectItem key={view.id} value={view.id}>{view.name}</SelectItem>)}</SelectGroup>
                {savedViews.some(({ builtIn }) => !builtIn) && <SelectGroup>{savedViews.filter(({ builtIn }) => !builtIn).map((view) => <SelectItem key={view.id} value={view.id}>{view.name}</SelectItem>)}</SelectGroup>}
              </SelectContent>
            </Select>
            {hasUnsavedChanges && <Badge variant="outline" className="border-warning/40 bg-warning-soft text-warning">Unsaved changes</Badge>}
            <DropdownMenu>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label="View actions"><EllipsisIcon /></Button></DropdownMenuTrigger></TooltipTrigger>
                  <TooltipContent data-parry-theme>View actions</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent data-parry-theme align="start" className="w-52">
                <DropdownMenuGroup>
                  {!selectedView.builtIn && <DropdownMenuItem onSelect={openRenameDialog}>Rename view</DropdownMenuItem>}
                  <DropdownMenuItem onSelect={openDuplicateDialog}>Duplicate view</DropdownMenuItem>
                  {hasUnsavedChanges && <DropdownMenuItem onSelect={() => { setConfiguration(selectedView.configuration); setSelectedRecordId(null) }}>Reset changes</DropdownMenuItem>}
                  {!selectedView.builtIn && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => { setViewError(null); setViewDialog("delete") }}>Delete view</DropdownMenuItem>
                  </>}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1.5">
            <AdvancedTableViewOptions configuration={configuration} onChange={updateConfiguration} />
            <StatusQuickFilter selectedStatuses={quickFilters.statuses} onChange={(statuses) => updateConfiguration({ quickFilters: { ...quickFilters, statuses } })} />
            <PriorityQuickFilter selectedPriority={quickFilters.priority} onChange={(priority) => updateConfiguration({ quickFilters: { ...quickFilters, priority } })} />
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant={advancedConditionCount > 0 ? "secondary" : "outline"} size="icon-sm" className="relative" aria-label={advancedConditionCount > 0 ? `Advanced filter, ${advancedConditionCount} active conditions` : "Advanced filter"} aria-expanded={isAdvancedExpanded} aria-controls={isAdvancedExpanded ? "advanced-filter-builder" : undefined} onClick={() => setIsAdvancedExpanded((expanded) => !expanded)}>
                    <FilterIcon />
                    {advancedConditionCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent data-parry-theme>Advanced filter</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select value={groupBy} onValueChange={(value) => updateConfiguration({ groupBy: value as GroupByKey | "none" })}>
              <SelectTrigger aria-label="Group records by" className="h-8 w-[9.5rem] justify-between"><span className="flex min-w-0 items-center gap-2"><Layers3Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /><SelectValue className="min-w-0 text-left" /></span></SelectTrigger>
              <SelectContent data-parry-theme position="popper" align="start" className="w-[var(--radix-select-trigger-width)]"><SelectGroup>{groupOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm" className="h-8"><ArrowUpDownIcon data-icon="inline-start" />Sort{sort.key ? `: ${tableColumns.find(({ key }) => key === sort.key)?.label ?? ""}` : ""}</Button></DropdownMenuTrigger>
              <DropdownMenuContent data-parry-theme align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  {tableColumns.map(({ key, label }) => <DropdownMenuItem key={key} onSelect={() => handleSortKey(key)}>{label}{sort.key === key && <span className="ml-auto text-xs text-muted-foreground">{sort.direction === "asc" ? "Ascending" : "Descending"}</span>}</DropdownMenuItem>)}
                  <DropdownMenuItem onSelect={() => handleSortKey("none")}>No sorting</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={!sort.key} onSelect={() => updateConfiguration({ sort: { ...sort, direction: sort.direction === "asc" ? "desc" : "asc" } })}>Change to {sort.direction === "asc" ? "descending" : "ascending"}</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {hasUnsavedChanges && !selectedView.builtIn && <Button type="button" size="sm" className="h-8" onClick={saveCurrentView}>Save changes</Button>}
            <Button type="button" variant={selectedView.builtIn && hasUnsavedChanges ? "default" : "outline"} size="sm" className="h-8" onClick={openSaveAsDialog}>Save as</Button>
          </div>
        </div>
        <AdvancedFilterBuilder
          appliedFilters={filters}
          expanded={isAdvancedExpanded}
          search={query}
          onSearchChange={(value) => { updateConfiguration({ search: value }); setSelectedRecordId(null) }}
          onApply={(next) => { updateConfiguration({ filters: next }); setSelectedRecordId(null) }}
          onClear={clearAdvancedFilters}
        />
      </div>

      <div ref={tableLayoutRef} className="flex min-w-0 items-stretch">
        <div ref={tableViewportRef} onScrollCapture={(event) => {
          const target = event.target as HTMLElement
          if (target.dataset.slot === "table-container") setTableScrollLeft(target.scrollLeft)
        }} className="min-w-0 flex-1">
          <div className="flex min-h-9 items-center justify-between gap-3 border-b bg-muted/20 px-4 py-2 sm:px-5">
            <p className="text-xs font-medium tabular-nums text-muted-foreground" aria-live="polite">{isRestoring ? "Restoring records…" : `${matchingRecords.length} ${matchingRecords.length === 1 ? "record" : "records"}`}</p>
            <span className="text-xs text-muted-foreground">{pageSize} per page</span>
          </div>
          <Table className="min-w-[940px] table-fixed" style={{ width: tableWidth }}>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className={`${densityClasses.head} sticky left-0 z-40 w-10 bg-muted`} style={{ position: "sticky", left: 0, width: selectionColumnWidth }}>
                  <Checkbox aria-label="Select all records on this page" checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false} onCheckedChange={togglePageSelection} />
                </TableHead>
                {activeColumns.map(({ key, label }, index) => {
                  const activeSort = sort.key === key
                  return <TableHead key={key} aria-sort={activeSort ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} className={`${densityClasses.head} ${index < effectiveStickyFirst || (isStickyLastActive && index >= activeColumns.length - effectiveStickyLast) ? "bg-muted" : ""}`} style={{ ...stickyStyle(index, true), width: actualColumnWidth(index), minWidth: columnWidths[key] }}>
                    <button type="button" onClick={() => toggleSort(key)} className="inline-flex min-h-8 items-center gap-1.5 rounded-sm text-left font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {label}{activeSort ? sort.direction === "asc" ? <ArrowUpIcon aria-hidden="true" className="size-3.5 text-primary" /> : <ArrowDownIcon aria-hidden="true" className="size-3.5 text-primary" /> : <ArrowUpDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground/70" />}
                    </button>
                  </TableHead>
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRestoring ? Array.from({ length: 6 }).map((_, rowIndex) => <TableRow key={`loading-${rowIndex}`} aria-label="Loading records">
                <TableCell className={`${densityClasses.cell} sticky left-0 z-20 bg-background`} style={{ position: "sticky", left: 0, width: selectionColumnWidth }} />
                {activeColumns.map((column, index) => <TableCell key={column.key} className={`${densityClasses.cell} ${index < effectiveStickyFirst || (isStickyLastActive && index >= activeColumns.length - effectiveStickyLast) ? "bg-background" : ""}`} style={{ ...stickyStyle(index, false), width: actualColumnWidth(index), minWidth: columnWidths[column.key] }}><Skeleton className="h-4 w-20" /></TableCell>)}
              </TableRow>) : matchingRecords.length === 0 ? (
                <TableRow><TableCell colSpan={activeColumns.length + 1} className="h-48 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                    <p className="font-medium">No records match this query</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">Try a different search term or remove one of the active filters.</p>
                    <Button variant="outline" size="sm" onClick={() => { updateConfiguration({ search: "", quickFilters: { statuses: [], priority: null } }); clearAdvancedFilters() }}>Clear search and filters</Button>
                  </div>
                </TableCell></TableRow>
              ) : groupsOnPage.map((group) => <Fragment key={group.key}>
                {groupBy !== "none" && <TableRow key={`group-${group.key}`} className="bg-muted/40 hover:bg-muted/40">
                  <TableCell className={`${densityClasses.cell} sticky left-0 z-20 bg-muted/40`} style={{ position: "sticky", left: 0, width: selectionColumnWidth }} />
                  <TableCell colSpan={activeColumns.length} className={densityClasses.cell}>
                    <button type="button" className="sticky z-10 inline-flex w-fit max-w-full items-center gap-2 bg-muted text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ position: "sticky", left: selectionColumnWidth }} aria-expanded={!collapsedGroups.has(group.key)} onClick={() => setCollapsedGroups((current) => {
                      const next = new Set(current)
                      if (next.has(group.key)) next.delete(group.key)
                      else next.add(group.key)
                      return next
                    })}>
                      <ChevronRightIcon aria-hidden="true" className={`size-4 transition-transform ${collapsedGroups.has(group.key) ? "" : "rotate-90"}`} />
                      <span>{group.label}</span><Badge variant="secondary" className="ml-1">{group.total}</Badge>
                    </button>
                  </TableCell>
                </TableRow>}
                {!collapsedGroups.has(group.key) && group.records.map((record) => <TableRow key={record.id} tabIndex={0} aria-selected={selectedRecordId === record.id} onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button, input, [role=checkbox]")) return
                  setSelectedRecordId(record.id)
                }} onKeyDown={(event) => {
                  if ((event.target as HTMLElement).closest("button, input, [role=checkbox]")) return
                  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedRecordId(record.id) }
                }} className={`cursor-pointer ${selectedRecordId === record.id ? "bg-accent" : ""}`}>
                  <TableCell className={`${densityClasses.cell} sticky left-0 z-20 bg-background`} style={{ position: "sticky", left: 0, width: selectionColumnWidth }}>
                    <Checkbox aria-label={`Select ${record.name}`} checked={selectedRecordIds.has(record.id)} onCheckedChange={(checked) => setSelectedRecordIds((current) => {
                      const next = new Set(current)
                      if (checked) next.add(record.id)
                      else next.delete(record.id)
                      return next
                    })} />
                  </TableCell>
                  {activeColumns.map(({ key }, index) => <TableCell key={key} className={`${densityClasses.cell} ${key === "name" ? "font-medium" : ""} ${index < effectiveStickyFirst || (isStickyLastActive && index >= activeColumns.length - effectiveStickyLast) ? selectedRecordId === record.id ? "bg-accent" : "bg-background" : ""}`} style={{ ...stickyStyle(index, false), width: actualColumnWidth(index), minWidth: columnWidths[key] }}>{displayCell(record, key)}</TableCell>)}
                </TableRow>)}
              </Fragment>)}
            </TableBody>
          </Table>
          <footer className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs tabular-nums text-muted-foreground">{matchingRecords.length === 0 ? "0 records" : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, matchingRecords.length)} of ${matchingRecords.length} records`}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="record-page-size" className="text-xs text-muted-foreground">Rows</Label>
              <Select value={String(pageSize)} onValueChange={(value) => updateConfiguration({ pageSize: Number(value) })}>
                <SelectTrigger id="record-page-size" className="h-7 w-[4.5rem]"><SelectValue /></SelectTrigger>
                <SelectContent data-parry-theme><SelectGroup>{pageSizeOptions.map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">Page {currentPage} of {pageCount}</span>
              <Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeftIcon /></Button>
              <Button variant="outline" size="icon-sm" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRightIcon /></Button>
            </div>
          </footer>
        </div>
        {selectedRecord && !isNarrow && <>
          <div
            role="separator"
            aria-label="Resize record details panel"
            aria-orientation="vertical"
            aria-valuemin={280}
            aria-valuemax={520}
            aria-valuenow={detailWidth}
            tabIndex={0}
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
            onKeyDown={handleResizeKey}
            className="group flex w-3 shrink-0 cursor-col-resize touch-none items-center justify-center border-l border-r bg-muted/30 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          ><GripVerticalIcon aria-hidden="true" className="size-4 text-muted-foreground group-hover:text-foreground" /></div>
          <RecordDetailPanel record={selectedRecord} onClose={() => setSelectedRecordId(null)} className="min-h-0 shrink-0 border-l" style={{ width: detailWidth }} />
        </>}
      </div>
      <DetailModal record={selectedRecord} open={isNarrow && Boolean(selectedRecord)} onClose={() => setSelectedRecordId(null)} />
      <div className="border-t bg-muted/20 px-4 py-2.5 sm:px-5">
        <p className="text-xs leading-relaxed text-muted-foreground">Demo workspace · fictional records only. Saved views stay in this browser.</p>
      </div>

      <Dialog open={viewDialog !== null} onOpenChange={(open) => { if (!open) { setViewDialog(null); setViewError(null) } }}>
        {viewDialog && <DialogContent data-parry-theme aria-describedby="saved-view-dialog-description" className="font-data sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewDialog === "create" ? "Save as new view" : viewDialog === "duplicate" ? "Duplicate saved view" : viewDialog === "rename" ? "Rename saved view" : "Delete saved view?"}</DialogTitle>
            <DialogDescription id="saved-view-dialog-description">{viewDialog === "delete" ? `“${selectedView.name}” will be removed from this browser. Built-in views cannot be deleted.` : "Save search, status and priority filters, advanced filters, sorting, columns, density, sticky columns, grouping, and page size together."}</DialogDescription>
          </DialogHeader>
          {viewDialog !== "delete" && <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="saved-view-name">View name</Label>
            <Input id="saved-view-name" value={viewName} aria-invalid={Boolean(viewError)} onChange={(event) => { setViewName(event.target.value); setViewError(null) }} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) confirmViewDialog() }} autoFocus />
            {viewError && <p role="alert" className="text-sm text-destructive">{viewError}</p>}
          </div>}
          {viewDialog === "delete" && <p className="text-sm text-destructive">This action cannot be undone.</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(null)}>Cancel</Button>
            <Button variant={viewDialog === "delete" ? "destructive" : "default"} onClick={confirmViewDialog}>{viewDialog === "create" ? "Save view" : viewDialog === "duplicate" ? "Duplicate view" : viewDialog === "rename" ? "Rename view" : "Delete view"}</Button>
          </DialogFooter>
        </DialogContent>}
      </Dialog>
    </section>
  )
}
