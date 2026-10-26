"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  ChevronDownIcon,
  FilterIcon,
  MoreHorizontalIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type RecordStatus = "Active" | "Invited" | "Suspended"
type DemoRecord = {
  id: string
  name: string
  email: string
  company: string
  department: string
  status: RecordStatus
  created: string
}
type Condition = "normal" | "few" | "empty" | "loading"
type FeatureKey = "search" | "filters" | "rowSelection" | "bulkActions" | "rowActions" | "pagination" | "advancedFilters"
type SortKey = "name" | "company" | "department" | "status" | "created"
type FeatureConfig = Record<FeatureKey, boolean>
type FormValues = Pick<DemoRecord, "name" | "email" | "company" | "department" | "status">

const initialRecords: DemoRecord[] = [
  { id: "rec-001", name: "Alya Pratama", email: "alya.pratama@northstar.co", company: "Northstar Labs", department: "Product", status: "Active", created: "2025-06-03" },
  { id: "rec-002", name: "Rafael Putra", email: "rafael.putra@horizon.id", company: "Horizon Group", department: "Operations", status: "Active", created: "2025-06-07" },
  { id: "rec-003", name: "Mei Tan", email: "mei.tan@meridian.co", company: "Meridian Works", department: "Finance", status: "Invited", created: "2025-06-11" },
  { id: "rec-004", name: "Dimas Saputra", email: "dimas.saputra@northstar.co", company: "Northstar Labs", department: "Engineering", status: "Active", created: "2025-06-14" },
  { id: "rec-005", name: "Nadia Kusuma", email: "nadia.kusuma@atlas.id", company: "Atlas Commerce", department: "Marketing", status: "Suspended", created: "2025-06-18" },
  { id: "rec-006", name: "Theo Wijaya", email: "theo.wijaya@horizon.id", company: "Horizon Group", department: "Engineering", status: "Invited", created: "2025-06-21" },
  { id: "rec-007", name: "Sofia Rahman", email: "sofia.rahman@meridian.co", company: "Meridian Works", department: "Product", status: "Active", created: "2025-06-25" },
  { id: "rec-008", name: "Kevin Santoso", email: "kevin.santoso@atlas.id", company: "Atlas Commerce", department: "Operations", status: "Active", created: "2025-06-28" },
  { id: "rec-009", name: "Lina Hartono", email: "lina.hartono@northstar.co", company: "Northstar Labs", department: "Finance", status: "Invited", created: "2025-07-02" },
  { id: "rec-010", name: "Arman Yulianto", email: "arman.yulianto@meridian.co", company: "Meridian Works", department: "Marketing", status: "Active", created: "2025-07-05" },
  { id: "rec-011", name: "Priya Ananda", email: "priya.ananda@atlas.id", company: "Atlas Commerce", department: "Product", status: "Active", created: "2025-07-08" },
  { id: "rec-012", name: "Ben Setiawan", email: "ben.setiawan@horizon.id", company: "Horizon Group", department: "Finance", status: "Suspended", created: "2025-07-11" },
]

const featureOptions: { key: FeatureKey; label: string; description: string }[] = [
  { key: "search", label: "Search", description: "Find records by keyword" },
  { key: "filters", label: "Filters", description: "Filter by record status" },
  { key: "rowSelection", label: "Row selection", description: "Select rows individually or by page" },
  { key: "bulkActions", label: "Bulk actions", description: "Show actions for selected rows" },
  { key: "rowActions", label: "Row actions", description: "Edit or remove a record" },
  { key: "pagination", label: "Pagination", description: "Navigate and adjust page size" },
  { key: "advancedFilters", label: "Advanced filters", description: "Add a department filter" },
]

const defaultFeatures: FeatureConfig = {
  search: true,
  filters: true,
  rowSelection: true,
  bulkActions: true,
  rowActions: true,
  pagination: true,
  advancedFilters: true,
}

const formDefaults: FormValues = { name: "", email: "", company: "", department: "", status: "Active" }
const departments = ["Engineering", "Finance", "Marketing", "Operations", "Product"]
const sortColumns: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "created", label: "Date added" },
]
const conditionOptions: { value: Condition; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "few", label: "Few records" },
  { value: "empty", label: "Empty" },
  { value: "loading", label: "Loading" },
]

function statusClass(status: RecordStatus) {
  if (status === "Active") return "border-success/30 bg-success-soft text-success"
  if (status === "Invited") return "border-info/30 bg-info-soft text-info"
  return "border-destructive/30 bg-destructive-soft text-destructive"
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`))
}

function getColumnValue(record: DemoRecord, key: SortKey) {
  return key === "created" ? record.created : record[key]
}

export function DataManagementListPreview({ showControls = true }: { showControls?: boolean }) {
  const [records, setRecords] = useState(initialRecords)
  const [condition, setCondition] = useState<Condition>("normal")
  const [features, setFeatures] = useState<FeatureConfig>(defaultFeatures)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("created")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("5")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DemoRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DemoRecord | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(formDefaults)

  const filteredRecords = useMemo(() => {
    const conditionRecords = condition === "few" ? records.slice(0, 3) : condition === "empty" ? [] : records
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return conditionRecords
      .filter((record) => {
        const matchesQuery = !features.search || !normalizedQuery ||
          [record.name, record.email, record.company, record.department].some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
        const matchesStatus = !features.filters || statusFilter === "all" || record.status === statusFilter
        const matchesDepartment = !features.advancedFilters || departmentFilter === "all" || record.department === departmentFilter
        return matchesQuery && matchesStatus && matchesDepartment
      })
      .sort((first, second) => {
        const result = String(getColumnValue(first, sortKey)).localeCompare(String(getColumnValue(second, sortKey)), undefined, { numeric: true })
        return sortDirection === "asc" ? result : -result
      })
  }, [condition, departmentFilter, features.advancedFilters, features.filters, features.search, query, records, sortDirection, sortKey, statusFilter])

  const parsedPageSize = Number(pageSize)
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / parsedPageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleRecords = features.pagination
    ? filteredRecords.slice((currentPage - 1) * parsedPageSize, currentPage * parsedPageSize)
    : filteredRecords
  const selectedVisibleCount = visibleRecords.filter((record) => selectedIds.has(record.id)).length
  const allVisibleSelected = visibleRecords.length > 0 && selectedVisibleCount === visibleRecords.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const firstRecordNumber = filteredRecords.length === 0 ? 0 : features.pagination ? (currentPage - 1) * parsedPageSize + 1 : 1
  const lastRecordNumber = features.pagination ? Math.min(currentPage * parsedPageSize, filteredRecords.length) : filteredRecords.length
  const columnCount = sortColumns.length + (features.rowSelection ? 1 : 0) + (features.rowActions ? 1 : 0)
  const hasFilters = query.trim().length > 0 || statusFilter !== "all" || departmentFilter !== "all"
  const formIsValid = formValues.name.trim().length > 0 && formValues.company.trim().length > 0 &&
    formValues.department.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())

  function resetPageAndSelection() {
    setPage(1)
    setSelectedIds(new Set())
  }

  function updateFeature(key: FeatureKey, enabled: boolean) {
    setFeatures((current) => ({ ...current, [key]: enabled }))
    if (!enabled && key === "search") setQuery("")
    if (!enabled && key === "filters") setStatusFilter("all")
    if (!enabled && key === "advancedFilters") {
      setDepartmentFilter("all")
      setAdvancedOpen(false)
    }
    if (!enabled && key === "pagination") setPage(1)
    if (!enabled && key === "rowSelection") setSelectedIds(new Set())
  }

  function changeCondition(value: Condition) {
    setCondition(value)
    resetPageAndSelection()
  }

  function changeQuery(value: string) {
    setQuery(value)
    resetPageAndSelection()
  }

  function changeStatus(value: string) {
    setStatusFilter(value)
    resetPageAndSelection()
  }

  function changeDepartment(value: string) {
    setDepartmentFilter(value)
    resetPageAndSelection()
  }

  function resetFilters() {
    setQuery("")
    setStatusFilter("all")
    setDepartmentFilter("all")
    setAdvancedOpen(false)
    resetPageAndSelection()
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDirection((direction) => direction === "asc" ? "desc" : "asc")
    else {
      setSortKey(key)
      setSortDirection("asc")
    }
    resetPageAndSelection()
  }

  function toggleRecord(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleVisibleRecords(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      visibleRecords.forEach(({ id }) => checked ? next.add(id) : next.delete(id))
      return next
    })
  }

  function openCreateDialog() {
    setEditingRecord(null)
    setFormValues(formDefaults)
    setFormOpen(true)
  }

  function openEditDialog(record: DemoRecord) {
    setEditingRecord(record)
    setFormValues({ name: record.name, email: record.email, company: record.company, department: record.department, status: record.status })
    setFormOpen(true)
  }

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formIsValid) return
    if (editingRecord) {
      setRecords((current) => current.map((record) => record.id === editingRecord.id ? { ...record, ...formValues } : record))
      toast.success("Record updated")
    } else {
      const newRecord: DemoRecord = { id: `rec-${Date.now()}`, ...formValues, created: new Date().toISOString().slice(0, 10) }
      setRecords((current) => [newRecord, ...current])
      setCondition("normal")
      setPage(1)
      toast.success("Record added")
    }
    setFormOpen(false)
  }

  function deleteRecord() {
    if (!deleteTarget) return
    const deletedId = deleteTarget.id
    setRecords((current) => current.filter((record) => record.id !== deletedId))
    setSelectedIds((current) => {
      const next = new Set(current)
      next.delete(deletedId)
      return next
    })
    setDeleteTarget(null)
    toast.success("Record deleted")
  }

  function activateSelectedRecords() {
    setRecords((current) => current.map((record) => selectedIds.has(record.id) ? { ...record, status: "Active" } : record))
    const count = selectedIds.size
    setSelectedIds(new Set())
    toast.success(`${count} ${count === 1 ? "record" : "records"} marked active`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        {showControls && (
          <details className="group rounded-xl border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              <span className="flex flex-col gap-1">
                <span className="font-heading text-base font-semibold">Preview settings</span>
                <span className="text-sm text-muted-foreground">Conditions and optional features</span>
              </span>
              <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid gap-4 border-t p-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="preview-condition">Condition</Label>
                <Select value={condition} onValueChange={(value) => changeCondition(value as Condition)}>
                  <SelectTrigger id="preview-condition" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent data-parry-theme>
                    <SelectGroup>
                      {conditionOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Optional features</p>
                {featureOptions.map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Label htmlFor={`feature-${key}`} className="text-sm">{label}</Label>
                      <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
                    </div>
                    <Switch id={`feature-${key}`} checked={features[key]} onCheckedChange={(checked) => updateFeature(key, checked)} aria-label={`Toggle ${label}`} />
                  </div>
                ))}
              </div>
            </div>
          </details>
        )}

        <section aria-label="Live data management list preview" className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-col gap-5 p-4 sm:p-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-xl font-semibold tracking-tight">Team directory</h2>
                <p className="text-sm text-muted-foreground">Manage people, access, and organization details.</p>
              </div>
              <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                <CirclePlusIcon data-icon="inline-start" /> Add Record
              </Button>
            </header>

            <div className="flex flex-col gap-3">
              {condition === "loading" ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Skeleton className="h-8 w-full sm:max-w-64" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {features.search && (
                    <div className="relative w-full sm:max-w-64">
                      <SearchIcon aria-hidden className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Search records…" aria-label="Search records" className="pl-8" />
                    </div>
                  )}
                  {features.filters && (
                    <Select value={statusFilter} onValueChange={changeStatus}>
                      <SelectTrigger aria-label="Filter by status" className="w-full sm:w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
                      <SelectContent data-parry-theme>
                        <SelectGroup>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Invited">Invited</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                  {features.advancedFilters && (
                    <Button type="button" variant={advancedOpen ? "secondary" : "outline"} onClick={() => setAdvancedOpen((open) => !open)} aria-pressed={advancedOpen}>
                      <FilterIcon data-icon="inline-start" /> Advanced filters
                    </Button>
                  )}
                  {hasFilters && (
                    <Button type="button" variant="ghost" onClick={resetFilters} className="justify-start sm:ml-auto sm:justify-center">
                      <XIcon data-icon="inline-start" /> Reset filters
                    </Button>
                  )}
                </div>
              )}
              {features.advancedFilters && advancedOpen && condition !== "loading" && (
                <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 sm:flex-row sm:items-center">
                  <Label htmlFor="department-filter" className="text-sm">Department</Label>
                  <Select value={departmentFilter} onValueChange={changeDepartment}>
                    <SelectTrigger id="department-filter" className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                    <SelectContent data-parry-theme>
                      <SelectGroup>
                        <SelectItem value="all">All departments</SelectItem>
                        {departments.map((department) => <SelectItem key={department} value={department}>{department}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {features.bulkActions && features.rowSelection && selectedIds.size > 0 && condition !== "loading" && (
              <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-2 rounded-lg border bg-info-soft/50 p-2.5">
                <span className="mr-auto text-sm font-medium">{selectedIds.size} selected</span>
                <Button size="sm" variant="outline" onClick={activateSelectedRecords}>Mark active</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear selection</Button>
              </div>
            )}

            <div className="min-w-0 overflow-hidden rounded-lg border">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {features.rowSelection && (
                      <TableHead className="w-10">
                        <Checkbox aria-label="Select all records on this page" checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false} onCheckedChange={(checked) => toggleVisibleRecords(checked === true)} disabled={condition === "loading" || visibleRecords.length === 0} />
                      </TableHead>
                    )}
                    {sortColumns.map(({ key, label }) => (
                      <TableHead key={key}>
                        <Button type="button" variant="ghost" size="sm" onClick={() => toggleSort(key)} className="-ml-2 h-7 px-2 font-medium text-muted-foreground hover:text-foreground">
                          {label}
                          {sortKey === key ? sortDirection === "asc" ? <ArrowUpIcon aria-label="Sorted ascending" /> : <ArrowDownIcon aria-label="Sorted descending" /> : <ArrowUpDownIcon aria-hidden />}
                        </Button>
                      </TableHead>
                    ))}
                    {features.rowActions && <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {condition === "loading" ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} aria-hidden="true">
                      {features.rowSelection && <TableCell><Skeleton className="size-4" /></TableCell>}
                      {sortColumns.map(({ key }) => <TableCell key={key}><Skeleton className={key === "name" ? "h-4 w-28" : key === "company" ? "h-4 w-32" : "h-4 w-20"} /></TableCell>)}
                      {features.rowActions && <TableCell><Skeleton className="ml-auto size-7" /></TableCell>}
                    </TableRow>
                  )) : visibleRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columnCount} className="h-48 whitespace-normal">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center">
                          <p className="font-medium">{condition === "empty" ? "No records yet" : "No matching records"}</p>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {condition === "empty" ? "Add a record to start building your directory." : "Try changing your search or filters to find what you are looking for."}
                          </p>
                          {condition === "empty" ? <Button size="sm" onClick={openCreateDialog}>Add Record</Button> : hasFilters ? <Button size="sm" variant="outline" onClick={resetFilters}>Reset filters</Button> : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : visibleRecords.map((record) => (
                    <TableRow key={record.id} data-state={selectedIds.has(record.id) ? "selected" : undefined}>
                      {features.rowSelection && <TableCell><Checkbox aria-label={`Select ${record.name}`} checked={selectedIds.has(record.id)} onCheckedChange={(checked) => toggleRecord(record.id, checked === true)} /></TableCell>}
                      <TableCell>
                        <div className="flex min-w-40 flex-col gap-0.5">
                          <span className="font-medium">{record.name}</span>
                          <span className="text-xs text-muted-foreground">{record.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{record.company}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell><Badge variant="outline" className={statusClass(record.status)}>{record.status}</Badge></TableCell>
                      <TableCell>{dateLabel(record.created)}</TableCell>
                      {features.rowActions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${record.name}`}><MoreHorizontalIcon /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" data-parry-theme>
                              <DropdownMenuGroup>
                                <DropdownMenuItem onSelect={() => openEditDialog(record)}>Edit record</DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(record)}>Delete record</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {features.pagination && condition !== "loading" && (
              <footer className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p aria-live="polite">Showing {firstRecordNumber}–{lastRecordNumber} of {filteredRecords.length} records</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="page-size" className="text-sm font-normal text-muted-foreground">Rows</Label>
                    <Select value={pageSize} onValueChange={(value) => { setPageSize(value); setPage(1); setSelectedIds(new Set()) }}>
                      <SelectTrigger id="page-size" className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent data-parry-theme>
                        <SelectGroup>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="min-w-20 text-center">Page {currentPage} of {pageCount}</span>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" onClick={() => { setPage((value) => Math.max(1, value - 1)); setSelectedIds(new Set()) }} disabled={currentPage <= 1}>
                      <ChevronLeftIcon />
                    </Button>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" onClick={() => { setPage((value) => Math.min(pageCount, value + 1)); setSelectedIds(new Set()) }} disabled={currentPage >= pageCount}>
                      <ChevronRightIcon />
                    </Button>
                  </div>
                </div>
              </footer>
            )}
          </div>
        </section>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent data-parry-theme className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit record" : "Add record"}</DialogTitle>
            <DialogDescription>{editingRecord ? "Update the details for this directory record." : "Add a person to the team directory."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveRecord} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="record-name">Full name</Label>
                <Input id="record-name" value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="record-email">Email</Label>
                <Input id="record-email" type="email" value={formValues.email} onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="record-company">Company</Label>
                <Input id="record-company" value={formValues.company} onChange={(event) => setFormValues((current) => ({ ...current, company: event.target.value }))} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="record-department">Department</Label>
                <Select value={formValues.department} onValueChange={(value) => setFormValues((current) => ({ ...current, department: value }))}>
                  <SelectTrigger id="record-department" className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent data-parry-theme>
                    <SelectGroup>{departments.map((department) => <SelectItem key={department} value={department}>{department}</SelectItem>)}</SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="record-status">Status</Label>
                <Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value as RecordStatus }))}>
                  <SelectTrigger id="record-status" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent data-parry-theme>
                    <SelectGroup>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Invited">Invited</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!formIsValid}>{editingRecord ? "Save changes" : "Add record"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent data-parry-theme>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>{deleteTarget ? `${deleteTarget.name} will be removed from this local demo.` : "This record will be removed from the local demo."}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteRecord}>Delete record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
