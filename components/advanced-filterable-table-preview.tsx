"use client"

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Columns3Icon,
  EllipsisIcon,
  GripVerticalIcon,
  Layers3Icon,
  SaveIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AdvancedFilterBuilder } from "@/components/advanced-filter-builder"
import { RecordDetailPanel } from "@/components/record-detail-panel"
import {
  defaultConfiguration,
  demoRecords,
  demoSavedViews,
  filterFields,
  tableColumns,
  type ColumnKey,
  type EnterpriseRecord,
  type FilterCondition,
  type FilterGroup,
  type GroupByKey,
  type SavedView,
  type ViewConfiguration,
} from "@/lib/advanced-filterable-table-data"
import { cloneFilterGroup, flattenConditions, recordMatchesGroup, removeConditionFromGroup, sortRecords } from "@/lib/advanced-filter-engine"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const STORAGE_KEY = "parry-ui-advanced-filterable-table-views-v1"
const pageSizeOptions = [10, 20, 50]
const groupOptions: { value: GroupByKey | "none"; label: string }[] = [
  { value: "none", label: "No grouping" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "channel", label: "Channel" },
  { value: "owner", label: "Owner" },
]
const fieldLabelByKey = Object.fromEntries(filterFields.map(({ key, label }) => [key, label])) as Record<string, string>
const operatorText: Record<FilterCondition["operator"], string> = {
  contains: "contains",
  not_contains: "does not contain",
  equals: "equals",
  not_equals: "does not equal",
  is: "is",
  is_not: "is not",
  is_any_of: "is any of",
  before: "before",
  after: "after",
  between: "between",
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
    Array.isArray(candidate.visibleColumns) && candidate.visibleColumns.every((column) => tableColumns.some(({ key }) => key === column)) &&
    !!candidate.sort && (candidate.sort.key === null || tableColumns.some(({ key }) => key === candidate.sort?.key)) &&
    (candidate.sort.direction === "asc" || candidate.sort.direction === "desc") &&
    !!candidate.filters && typeof candidate.filters === "object" && Array.isArray(candidate.filters.conditions) && Array.isArray(candidate.filters.groups) &&
    (candidate.groupBy === "none" || groupOptions.some(({ value: group }) => group === candidate.groupBy)) &&
    pageSizeOptions.includes(candidate.pageSize ?? 0)
}

function safeStoredViews(value: unknown): SavedView[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is SavedView => {
    if (!item || typeof item !== "object") return false
    const view = item as Partial<SavedView>
    return typeof view.id === "string" && view.id.startsWith("custom-") && typeof view.name === "string" &&
      view.name.trim().length > 0 && view.builtIn === false && safeConfiguration(view.configuration)
  }).map((view) => ({ ...view, configuration: { ...view.configuration, filters: cloneFilterGroup(view.configuration.filters) } }))
}

function formatCondition(condition: FilterCondition) {
  const field = fieldLabelByKey[condition.field] ?? condition.field
  const value = condition.operator === "is_any_of" ? (condition.values ?? []).join(", ") : condition.operator === "between" ? `${condition.value} – ${condition.secondValue ?? ""}` : condition.value
  return `${field} ${operatorText[condition.operator]} ${value}`
}

function countConditions(group: FilterGroup): number {
  return group.conditions.length + group.groups.reduce((total, nested) => total + countConditions(nested), 0)
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
      {record && <DialogContent showCloseButton={false} className="left-1/2 top-1/2 flex h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden p-0" aria-describedby="record-details-description">
        <DialogHeader className="sr-only"><DialogTitle>Record details</DialogTitle><DialogDescription id="record-details-description">Detailed information for {record.name}, record {record.id}.</DialogDescription></DialogHeader>
        <RecordDetailPanel record={record} onClose={onClose} className="h-full" />
      </DialogContent>}
    </Dialog>
  )
}

export function AdvancedFilterableTablePreview() {
  const [query, setQuery] = useState(defaultConfiguration.search)
  const [filters, setFilters] = useState<FilterGroup>(() => cloneFilterGroup(defaultConfiguration.filters))
  const [sort, setSort] = useState(defaultConfiguration.sort)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([...defaultConfiguration.visibleColumns])
  const [groupBy, setGroupBy] = useState<GroupByKey | "none">(defaultConfiguration.groupBy)
  const [pageSize, setPageSize] = useState(defaultConfiguration.pageSize)
  const [page, setPage] = useState(1)
  const [savedViews, setSavedViews] = useState<SavedView[]>(demoSavedViews)
  const [selectedViewId, setSelectedViewId] = useState("all-records")
  const [isRestoring, setIsRestoring] = useState(true)
  const [viewDialog, setViewDialog] = useState<"create" | "rename" | "delete" | null>(null)
  const [viewName, setViewName] = useState("")
  const [viewError, setViewError] = useState<string | null>(null)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [isNarrow, setIsNarrow] = useState(false)
  const [detailWidth, setDetailWidth] = useState(340)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())
  const [filterOpenRequest, setFilterOpenRequest] = useState<{ groupId: string; conditionId: string; nonce: number } | null>(null)
  const tableLayoutRef = useRef<HTMLDivElement>(null)

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
            setConfiguration(selected.configuration)
          }
        }
      }
    } catch {
      // Local demo preferences are optional; unreadable storage falls back to the built-in views.
    }
    setIsRestoring(false)
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)")
    const update = () => setIsNarrow(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
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

  const configuration = useMemo<ViewConfiguration>(() => ({
    search: query,
    filters,
    sort,
    visibleColumns,
    groupBy,
    pageSize,
  }), [filters, groupBy, pageSize, query, sort, visibleColumns])

  const selectedView = savedViews.find(({ id }) => id === selectedViewId) ?? demoSavedViews[0]
  const hasUnsavedChanges = !equalConfiguration(configuration, selectedView.configuration)

  const matchingRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const filtered = demoRecords.filter((record) => {
      const matchesSearch = !normalizedQuery || Object.values(record).some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery))
      return matchesSearch && recordMatchesGroup(record, filters)
    })
    return sortRecords(filtered, sort)
  }, [filters, query, sort])

  const pageCount = Math.max(1, Math.ceil(matchingRecords.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRecords = matchingRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const activeColumns = tableColumns.filter(({ key }) => visibleColumns.includes(key))
  const selectedRecord = selectedRecordId ? matchingRecords.find(({ id }) => id === selectedRecordId) ?? null : null
  const activeConditions = flattenConditions(filters)
  const allConditionsCount = countConditions(filters)

  function setConfiguration(next: ViewConfiguration) {
    setQuery(next.search)
    setFilters(cloneFilterGroup(next.filters))
    setSort({ ...next.sort })
    setVisibleColumns([...next.visibleColumns])
    setGroupBy(next.groupBy)
    setPageSize(next.pageSize)
    setPage(1)
    setCollapsedGroups(new Set())
  }

  function selectView(viewId: string) {
    const view = savedViews.find(({ id }) => id === viewId)
    if (!view) return
    setSelectedViewId(view.id)
    setConfiguration(view.configuration)
    setSelectedRecordId(null)
  }

  function clearAllFilters() {
    setFilters({ id: `root-${Date.now()}`, logic: "AND", conditions: [], groups: [] })
    setPage(1)
    setSelectedRecordId(null)
  }

  function toggleSort(key: ColumnKey) {
    setSort((current) => {
      if (current.key !== key) return { key, direction: "asc" }
      if (current.direction === "asc") return { key, direction: "desc" }
      return { key: null, direction: "asc" }
    })
    setPage(1)
  }

  function handleSortKey(value: string) {
    setSort((current) => ({ key: value === "none" ? null : value as ColumnKey, direction: current.key === value ? current.direction : "asc" }))
    setPage(1)
  }

  function saveCurrentView() {
    if (selectedView.builtIn) {
      setViewName("")
      setViewError(null)
      setViewDialog("create")
      return
    }
    setSavedViews((current) => current.map((view) => view.id === selectedView.id ? { ...view, configuration } : view))
    toast.success(`“${selectedView.name}” updated.`, { position: "bottom-right" })
  }

  function confirmViewDialog() {
    const normalizedName = viewName.trim()
    if (viewDialog !== "delete" && !normalizedName) {
      setViewError("Enter a name for this view.")
      return
    }
    if ((viewDialog === "create" || viewDialog === "rename") && savedViews.some((view) => view.id !== selectedViewId && view.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
      setViewError("A view with that name already exists.")
      return
    }
    if (viewDialog === "create") {
      const view: SavedView = { id: `custom-${Date.now()}`, name: normalizedName, builtIn: false, configuration }
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

  return (
    <section aria-label="Advanced Filterable Table preview" aria-busy={isRestoring} data-parry-theme className="font-data flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">
      <header className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-data text-xl font-semibold tracking-tight">Records Explorer</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Search, organize, and inspect a fictional enterprise dataset.</p>
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">{isRestoring ? "Restoring views…" : `${matchingRecords.length} matching records`}</Badge>
        </div>
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[min(100%,14rem)] flex-1 xl:max-w-sm">
              <SearchIcon aria-hidden="true" className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search records" placeholder="Search records…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); setSelectedRecordId(null) }} className="pl-9" />
            </div>
            <AdvancedFilterBuilder
              appliedFilters={filters}
              openRequest={filterOpenRequest}
              onApply={(next) => { setFilters(cloneFilterGroup(next)); setPage(1); setSelectedRecordId(null) }}
              onClear={clearAllFilters}
            />
            <div className="flex min-w-0 flex-1 basis-full items-center gap-1 sm:basis-auto sm:flex-none">
              <Select value={selectedViewId} onValueChange={selectView}>
                <SelectTrigger aria-label="Saved views" className="w-full min-w-40 sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all-records">All Records</SelectItem>
                    <SelectItem value="priority-queue">Priority Queue</SelectItem>
                    <SelectItem value="review-by-owner">Review by Owner</SelectItem>
                  </SelectGroup>
                  {savedViews.some(({ builtIn }) => !builtIn) && <SelectGroup>
                    {savedViews.filter(({ builtIn }) => !builtIn).map((view) => <SelectItem key={view.id} value={view.id}>{view.name}</SelectItem>)}
                  </SelectGroup>}
                </SelectContent>
              </Select>
              <Button variant={hasUnsavedChanges ? "default" : "outline"} size="icon-sm" aria-label={selectedView.builtIn ? "Save as a new view" : "Save current view"} title={selectedView.builtIn ? "Save as a new view" : "Save current view"} onClick={saveCurrentView}><SaveIcon /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Saved view actions"><EllipsisIcon /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => { setViewName(""); setViewError(null); setViewDialog("create") }}>Create saved view</DropdownMenuItem>
                    {!selectedView.builtIn && <>
                      <DropdownMenuItem onSelect={openRenameDialog}>Rename “{selectedView.name}”</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => { setViewError(null); setViewDialog("delete") }}>Delete “{selectedView.name}”</DropdownMenuItem>
                    </>}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {hasUnsavedChanges && <Badge variant="outline" className="border-warning/40 bg-warning-soft text-warning">Unsaved changes</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Columns3Icon data-icon="inline-start" />Columns</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tableColumns.map(({ key, label, required }) => (
                  <DropdownMenuCheckboxItem key={key} checked={visibleColumns.includes(key)} disabled={required} onSelect={(event) => event.preventDefault()} onCheckedChange={(checked) => {
                    if (required) return
                    setVisibleColumns((current) => checked ? [...current, key] : current.filter((column) => column !== key))
                  }}>{label}{required && <span className="ml-auto text-xs text-muted-foreground">Always shown</span>}</DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setVisibleColumns([...defaultConfiguration.visibleColumns])}>Reset to default columns</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Select value={groupBy} onValueChange={(value) => { setGroupBy(value as GroupByKey | "none"); setPage(1) }}>
              <SelectTrigger aria-label="Group records by" className="w-[9.5rem]"><Layers3Icon aria-hidden="true" className="size-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup>{groupOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={sort.key ?? "none"} onValueChange={handleSortKey}>
              <SelectTrigger aria-label="Sort records by" className="w-[9.5rem]"><ArrowUpDownIcon aria-hidden="true" className="size-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup><SelectItem value="none">Sort: none</SelectItem>{tableColumns.map(({ key, label }) => <SelectItem key={key} value={key}>Sort: {label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Button variant="outline" size="icon-sm" aria-label={`Sort ${sort.direction === "asc" ? "ascending" : "descending"}`} title={`Sort ${sort.direction === "asc" ? "ascending" : "descending"}`} disabled={!sort.key} onClick={() => { setSort((current) => ({ ...current, direction: current.direction === "asc" ? "desc" : "asc" })); setPage(1) }}>
              {sort.direction === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2" aria-label="Active filters">
          {allConditionsCount === 0 ? <span className="text-xs text-muted-foreground">No advanced filters applied</span> : <>
            <span className="text-xs font-medium text-muted-foreground">Filters</span>
            {activeConditions.map(({ condition, groupId, logic }, index) => (
              <span key={condition.id} className="inline-flex max-w-full items-center overflow-hidden rounded-md border bg-background text-xs">
                <button type="button" className="truncate px-2 py-1.5 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" title="Edit this filter in the builder" onClick={() => setFilterOpenRequest({ groupId, conditionId: condition.id, nonce: Date.now() + index })}>
                  {index > 0 && <span className="mr-1 text-muted-foreground">{logic}</span>}{formatCondition(condition)}
                </button>
                <Button variant="ghost" size="icon-xs" className="rounded-none border-l" aria-label={`Remove filter: ${formatCondition(condition)}`} onClick={() => { setFilters((current) => removeConditionFromGroup(current, condition.id)); setPage(1); setSelectedRecordId(null) }}><XIcon /></Button>
              </span>
            ))}
          </>}
        </div>
        {(query.trim() || allConditionsCount > 0) && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); clearAllFilters() }}>Clear all</Button>}
      </div>

      <div ref={tableLayoutRef} className="flex min-w-0 items-stretch">
        <div className="min-w-0 flex-1">
          <div className="overflow-x-auto">
            <Table className="min-w-[940px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {activeColumns.map(({ key, label }) => {
                    const sortable = true
                    const activeSort = sort.key === key
                    return <TableHead key={key} aria-sort={activeSort ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                      <button type="button" onClick={() => toggleSort(key)} className="inline-flex min-h-8 items-center gap-1.5 rounded-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {label}{sortable && (activeSort ? sort.direction === "asc" ? <ArrowUpIcon aria-hidden="true" className="size-3.5 text-primary" /> : <ArrowDownIcon aria-hidden="true" className="size-3.5 text-primary" /> : <ArrowUpDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground/70" />)}
                      </button>
                    </TableHead>
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRestoring ? Array.from({ length: 6 }).map((_, rowIndex) => <TableRow key={`loading-${rowIndex}`} aria-label="Loading records">{activeColumns.map((column) => <TableCell key={column.key}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>) : matchingRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={activeColumns.length} className="h-48 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <p className="font-medium">No records match this query</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">Try a different search term or remove one of the active filters.</p>
                      <Button variant="outline" size="sm" onClick={() => { setQuery(""); clearAllFilters() }}>Clear search and filters</Button>
                    </div>
                  </TableCell></TableRow>
                ) : groupsOnPage.map((group) => <Fragment key={group.key}>
                  {groupBy !== "none" && <TableRow key={`group-${group.key}`} className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={activeColumns.length}>
                      <button type="button" className="flex w-full items-center gap-2 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-expanded={!collapsedGroups.has(group.key)} onClick={() => setCollapsedGroups((current) => {
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
                  {!collapsedGroups.has(group.key) && group.records.map((record) => <TableRow key={record.id} tabIndex={0} aria-selected={selectedRecordId === record.id} onClick={() => setSelectedRecordId(record.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedRecordId(record.id) } }} className={`cursor-pointer ${selectedRecordId === record.id ? "bg-accent" : ""}`}>
                    {activeColumns.map(({ key }) => <TableCell key={key} className={key === "name" ? "font-medium" : ""}>{displayCell(record, key)}</TableCell>)}
                  </TableRow>)}
                </Fragment>)}
              </TableBody>
            </Table>
          </div>
          {matchingRecords.length > 0 && <footer className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs tabular-nums text-muted-foreground">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, matchingRecords.length)} of {matchingRecords.length} records</p>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="record-page-size" className="text-xs text-muted-foreground">Rows</Label>
              <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1) }}>
                <SelectTrigger id="record-page-size" className="h-7 w-[4.5rem]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{pageSizeOptions.map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">Page {currentPage} of {pageCount}</span>
              <Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeftIcon /></Button>
              <Button variant="outline" size="icon-sm" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRightIcon /></Button>
            </div>
          </footer>}
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
          <RecordDetailPanel record={selectedRecord} onClose={() => setSelectedRecordId(null)} className="max-h-[34rem] shrink-0 border-l" style={{ width: detailWidth }} />
        </>}
      </div>
      <DetailModal record={selectedRecord} open={isNarrow && Boolean(selectedRecord)} onClose={() => setSelectedRecordId(null)} />
      <div className="border-t bg-muted/20 px-4 py-2.5 sm:px-5">
        <p className="text-xs leading-relaxed text-muted-foreground">Demo workspace · fictional records only. Saved views stay in this browser.</p>
      </div>

      <Dialog open={viewDialog !== null} onOpenChange={(open) => { if (!open) { setViewDialog(null); setViewError(null) } }}>
        {viewDialog && <DialogContent aria-describedby="saved-view-dialog-description" className="font-data sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewDialog === "create" ? "Create saved view" : viewDialog === "rename" ? "Rename saved view" : "Delete saved view?"}</DialogTitle>
            <DialogDescription id="saved-view-dialog-description">{viewDialog === "delete" ? `“${selectedView.name}” will be removed from this browser. Built-in views cannot be deleted.` : "Save the current search, filters, sort, columns, grouping, and page size together."}</DialogDescription>
          </DialogHeader>
          {viewDialog !== "delete" && <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="saved-view-name">View name</Label>
            <Input id="saved-view-name" value={viewName} aria-invalid={Boolean(viewError)} onChange={(event) => { setViewName(event.target.value); setViewError(null) }} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) confirmViewDialog() }} autoFocus />
            {viewError && <p role="alert" className="text-sm text-destructive">{viewError}</p>}
          </div>}
          {viewDialog === "delete" && <p className="text-sm text-destructive">This action cannot be undone.</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(null)}>Cancel</Button>
            <Button variant={viewDialog === "delete" ? "destructive" : "default"} onClick={confirmViewDialog}>{viewDialog === "create" ? "Save view" : viewDialog === "rename" ? "Rename view" : "Delete view"}</Button>
          </DialogFooter>
        </DialogContent>}
      </Dialog>
    </section>
  )
}
