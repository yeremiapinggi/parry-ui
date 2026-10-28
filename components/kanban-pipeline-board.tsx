"use client"

import { useEffect, useMemo, useState } from "react"
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { ArchiveIcon, BriefcaseBusinessIcon, CalendarDaysIcon, CircleDollarSignIcon, LayoutGridIcon, ListIcon, PlusIcon, SearchIcon, SlidersHorizontalIcon, UsersRoundIcon } from "lucide-react"
import { toast } from "sonner"

import { getOpportunityStatus, formatCloseDate, formatOpportunityValue, OPPORTUNITY_OWNERS, DEFAULT_PIPELINE_STAGES, DEMO_OPPORTUNITIES } from "@/components/kanban-pipeline-board-data"
import { OpportunityFormDialog, StageManagerDialog } from "@/components/kanban-pipeline-board-dialogs"
import { KanbanPipelineColumn, type OpportunityCardHandlers } from "@/components/kanban-pipeline-board-column"
import { KanbanOpportunityCard, OpportunityActions } from "@/components/kanban-opportunity-card"
import type { Opportunity, OpportunityInput, OpportunityPriority, PipelineStage } from "@/components/kanban-pipeline-board-types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type BoardView = "board" | "list"
type SortMode = "close-asc" | "value-desc" | "name-asc" | "priority"
type FormMode = "create" | "edit"

const priorityRank: Record<OpportunityPriority, number> = { High: 0, Medium: 1, Low: 2 }

function getStatusClass(status: Opportunity["status"]) {
  if (status === "Won") return "bg-success-soft text-success"
  if (status === "Lost") return "bg-muted text-muted-foreground"
  return "bg-info-soft text-info"
}

function formatSortLabel(mode: SortMode) {
  return {
    "close-asc": "Close date · soonest",
    "value-desc": "Deal value · highest",
    "name-asc": "Opportunity · A to Z",
    priority: "Priority · highest",
  }[mode]
}

export function KanbanPipelineBoard() {
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES)
  const [opportunities, setOpportunities] = useState<Opportunity[]>(DEMO_OPPORTUNITIES)
  const [view, setView] = useState<BoardView>("board")
  const [search, setSearch] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortMode, setSortMode] = useState<SortMode>("close-asc")
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [formSession, setFormSession] = useState(0)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [formInitial, setFormInitial] = useState<Opportunity | null>(null)
  const [formStageId, setFormStageId] = useState(DEFAULT_PIPELINE_STAGES[0].id)
  const [stageManagerOpen, setStageManagerOpen] = useState(false)
  const [stageSession, setStageSession] = useState(0)
  const [detailOpportunity, setDetailOpportunity] = useState<Opportunity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null)
  const [dragOpportunity, setDragOpportunity] = useState<Opportunity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const activeOpportunities = useMemo(() => opportunities.filter((opportunity) => !opportunity.archived), [opportunities])
  const archivedOpportunities = useMemo(() => opportunities.filter((opportunity) => opportunity.archived), [opportunities])
  const sourceOpportunities = showArchived ? archivedOpportunities : activeOpportunities
  const searchTerm = search.trim().toLocaleLowerCase()
  const visibleOpportunities = useMemo(() => {
    const filtered = sourceOpportunities.filter((opportunity) => {
      const searchMatches = !searchTerm || [opportunity.name, opportunity.company, opportunity.owner].some((value) => value.toLocaleLowerCase().includes(searchTerm))
      return searchMatches && (ownerFilter === "all" || opportunity.owner === ownerFilter) && (priorityFilter === "all" || opportunity.priority === priorityFilter)
    })
    return filtered.sort((first, second) => {
      if (sortMode === "value-desc") return second.value - first.value
      if (sortMode === "name-asc") return first.name.localeCompare(second.name)
      if (sortMode === "priority") return priorityRank[first.priority] - priorityRank[second.priority]
      return first.closeDate.localeCompare(second.closeDate)
    })
  }, [sourceOpportunities, searchTerm, ownerFilter, priorityFilter, sortMode])

  const openPipelineValue = activeOpportunities.filter((opportunity) => opportunity.status === "Open").reduce((sum, opportunity) => sum + opportunity.value, 0)
  const wonValue = activeOpportunities.filter((opportunity) => opportunity.status === "Won").reduce((sum, opportunity) => sum + opportunity.value, 0)
  const hasFilters = Boolean(searchTerm || ownerFilter !== "all" || priorityFilter !== "all")
  const emptyCollection = sourceOpportunities.length === 0

  function openCreate(stageId = stages.find((stage) => !stage.terminal)?.id ?? stages[0]?.id) {
    setFormSession((session) => session + 1)
    setFormInitial(null)
    setFormMode("create")
    setFormStageId(stageId ?? "")
    setFormOpen(true)
  }

  function openEdit(opportunity: Opportunity) {
    setFormSession((session) => session + 1)
    setDetailOpportunity(null)
    setFormInitial(opportunity)
    setFormMode("edit")
    setFormStageId(opportunity.stageId)
    setFormOpen(true)
  }

  function duplicateOpportunity(opportunity: Opportunity) {
    setFormSession((session) => session + 1)
    setFormInitial({ ...opportunity, id: `${opportunity.id}-copy`, name: `${opportunity.name} (copy)`, archived: false, status: getOpportunityStatus(opportunity.stageId, stages) })
    setFormMode("create")
    setFormStageId(opportunity.stageId)
    setFormOpen(true)
  }

  function saveOpportunity(input: OpportunityInput) {
    if (formMode === "edit" && formInitial) {
      setOpportunities((current) => current.map((opportunity) => opportunity.id === formInitial.id ? { ...opportunity, ...input, status: getOpportunityStatus(input.stageId, stages) } : opportunity))
      toast.success("Opportunity updated")
    } else {
      setOpportunities((current) => [{ ...input, id: `opp-${Date.now()}`, status: getOpportunityStatus(input.stageId, stages), archived: false }, ...current])
      toast.success("Opportunity added")
    }
    setFormOpen(false)
  }

  function moveOpportunity(opportunityId: string, stageId: string) {
    const nextStage = stages.find((stage) => stage.id === stageId)
    if (!nextStage) return
    setOpportunities((current) => current.map((opportunity) => opportunity.id === opportunityId ? { ...opportunity, stageId, status: getOpportunityStatus(stageId, stages) } : opportunity))
    toast.success(`Moved to ${nextStage.name}`)
  }

  function archiveOpportunity(opportunity: Opportunity) {
    setOpportunities((current) => current.map((record) => record.id === opportunity.id ? { ...record, archived: true } : record))
    setDetailOpportunity(null)
    toast.success("Opportunity archived")
  }

  function restoreOpportunity(opportunity: Opportunity) {
    setOpportunities((current) => current.map((record) => record.id === opportunity.id ? { ...record, archived: false } : record))
    toast.success("Opportunity restored")
  }

  function deleteOpportunity() {
    if (!deleteTarget) return
    setOpportunities((current) => current.filter((record) => record.id !== deleteTarget.id))
    if (detailOpportunity?.id === deleteTarget.id) setDetailOpportunity(null)
    setDeleteTarget(null)
    toast.success("Opportunity deleted")
  }

  function saveStages(nextStages: PipelineStage[], deleteActions: Array<{ stageId: string; reassignToId?: string }>) {
    const reassignment = new Map(deleteActions.map((action) => [action.stageId, action.reassignToId]))
    setOpportunities((current) => current.map((opportunity) => {
      let stageId = opportunity.stageId
      const visited = new Set<string>()
      while (reassignment.has(stageId) && !visited.has(stageId)) {
        visited.add(stageId)
        stageId = reassignment.get(stageId) ?? stageId
      }
      return stageId === opportunity.stageId ? opportunity : { ...opportunity, stageId, status: getOpportunityStatus(stageId, nextStages) }
    }))
    setStages(nextStages)
    toast.success("Pipeline stages updated")
  }

  function handleDragStart(event: DragStartEvent) {
    const opportunity = opportunities.find((record) => record.id === String(event.active.id))
    setDragOpportunity(opportunity ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const targetStageId = event.over?.data.current?.stageId ?? String(event.over?.id ?? "")
    if (event.over && targetStageId && stages.some((stage) => stage.id === targetStageId) && event.active.id !== targetStageId) {
      moveOpportunity(String(event.active.id), targetStageId)
    }
    setDragOpportunity(null)
  }

  function openStageManager() {
    setStageSession((session) => session + 1)
    setStageManagerOpen(true)
  }

  function clearFilters() {
    setSearch("")
    setOwnerFilter("all")
    setPriorityFilter("all")
  }

  const cardHandlers: OpportunityCardHandlers = {
    onOpen: setDetailOpportunity,
    onEdit: openEdit,
    onDuplicate: duplicateOpportunity,
    onArchive: archiveOpportunity,
    onDelete: setDeleteTarget,
    onRestore: restoreOpportunity,
    onMove: moveOpportunity,
  }

  return (
    <div className="font-data mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-5 text-foreground">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><BriefcaseBusinessIcon aria-hidden="true" className="size-3.5" />Revenue operations</div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Sales Pipeline</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Track every opportunity from first conversation through close.</p>
        </div>
        <Button className="shrink-0" onClick={() => openCreate()}><PlusIcon data-icon="inline-start" />Add Opportunity</Button>
      </header>

      <section aria-label="Pipeline summary" className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground"><BriefcaseBusinessIcon aria-hidden="true" className="size-4" /></span>
          <span className="flex flex-col"><span className="font-data text-lg font-semibold tabular-nums">{activeOpportunities.length}</span><span className="text-xs text-muted-foreground">Opportunities</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-info-soft text-info"><CircleDollarSignIcon aria-hidden="true" className="size-4" /></span>
          <span className="flex flex-col"><span className="font-data text-lg font-semibold tabular-nums">{formatOpportunityValue(openPipelineValue)}</span><span className="text-xs text-muted-foreground">Open pipeline value</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-success-soft text-success"><CircleDollarSignIcon aria-hidden="true" className="size-4" /></span>
          <span className="flex flex-col"><span className="font-data text-lg font-semibold tabular-nums">{formatOpportunityValue(wonValue)}</span><span className="text-xs text-muted-foreground">Won value</span></span>
        </div>
        <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex"><CalendarDaysIcon aria-hidden="true" className="size-3.5" />Updated just now</span>
      </section>

      <section aria-label="Pipeline controls" className="flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-3 sm:p-4">
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search opportunities" className="pl-8" onChange={(event) => setSearch(event.target.value)} placeholder="Search opportunities or companies" value={search} />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger aria-label="Filter by owner" className="w-full sm:w-36"><UsersRoundIcon aria-hidden="true" className="size-3.5 text-muted-foreground" /><SelectValue placeholder="Owner" /></SelectTrigger>
              <SelectContent><SelectGroup><SelectItem value="all">All owners</SelectItem>{OPPORTUNITY_OWNERS.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger aria-label="Filter by priority" className="w-full sm:w-32"><SlidersHorizontalIcon aria-hidden="true" className="size-3.5 text-muted-foreground" /><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent><SelectGroup><SelectItem value="all">All priorities</SelectItem><SelectItem value="High">High priority</SelectItem><SelectItem value="Medium">Medium priority</SelectItem><SelectItem value="Low">Low priority</SelectItem></SelectGroup></SelectContent>
            </Select>
            <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
              <SelectTrigger aria-label="Sort opportunities" className="col-span-2 w-full sm:col-span-1 sm:w-48"><SelectValue>{formatSortLabel(sortMode)}</SelectValue></SelectTrigger>
              <SelectContent><SelectGroup>{(["close-asc", "value-desc", "name-asc", "priority"] as SortMode[]).map((mode) => <SelectItem key={mode} value={mode}>{formatSortLabel(mode)}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup type="single" value={view} onValueChange={(value) => { if (value) setView(value as BoardView) }} variant="outline" size="sm" aria-label="Choose pipeline view">
              <ToggleGroupItem value="board" aria-label="Board view"><LayoutGridIcon data-icon="inline-start" />Board</ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view"><ListIcon data-icon="inline-start" />List</ToggleGroupItem>
            </ToggleGroup>
            <Button aria-pressed={showArchived} onClick={() => setShowArchived((current) => !current)} size="sm" variant={showArchived ? "secondary" : "outline"}>
              <ArchiveIcon data-icon="inline-start" />{showArchived ? "Active" : `Archived${archivedOpportunities.length ? ` · ${archivedOpportunities.length}` : ""}`}
            </Button>
            <Button onClick={openStageManager} size="sm" variant="outline">Manage Stages</Button>
            {hasFilters && <Button onClick={clearFilters} size="sm" variant="ghost">Clear filters</Button>}
          </div>
          <span className="text-xs text-muted-foreground">{visibleOpportunities.length} shown</span>
        </div>
      </section>

      {loading ? (
        <div aria-label="Loading pipeline" className="flex gap-3 overflow-hidden" role="status">
          {stages.map((stage) => <div key={stage.id} className="flex w-[17rem] shrink-0 flex-col gap-3 rounded-xl border p-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-24 w-full" /></div>)}
          <span className="sr-only">Loading opportunities</span>
        </div>
      ) : emptyCollection ? (
        <div className="rounded-xl border bg-card">
          <Empty className="min-h-72">
            <EmptyHeader>
              <EmptyMedia variant="icon"><BriefcaseBusinessIcon /></EmptyMedia>
              <EmptyTitle>{showArchived ? "No archived opportunities" : "No opportunities yet"}</EmptyTitle>
              <EmptyDescription>{showArchived ? "Archived opportunities will appear here." : "Add your first opportunity to start building the pipeline."}</EmptyDescription>
            </EmptyHeader>
            {!showArchived && <EmptyContent><Button onClick={() => openCreate()}><PlusIcon data-icon="inline-start" />Add Opportunity</Button></EmptyContent>}
          </Empty>
        </div>
      ) : visibleOpportunities.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon"><SearchIcon /></EmptyMedia>
              <EmptyTitle>No search results</EmptyTitle>
              <EmptyDescription>Try another search or clear the active filters to see more opportunities.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button onClick={clearFilters} variant="outline">Clear filters</Button></EmptyContent>
          </Empty>
        </div>
      ) : view === "board" ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setDragOpportunity(null)}>
          <div className="min-w-0 max-w-full overflow-hidden rounded-xl border bg-background p-2 sm:p-3">
            <div aria-label="Pipeline stages" className="flex min-w-0 gap-3 overflow-x-auto overscroll-x-contain pb-2" role="region" tabIndex={0}>
              {stages.map((stage) => (
                <KanbanPipelineColumn
                  key={stage.id}
                  stage={stage}
                  stages={stages}
                  opportunities={visibleOpportunities.filter((opportunity) => opportunity.stageId === stage.id)}
                  onAddOpportunity={openCreate}
                  onManageStages={openStageManager}
                  {...cardHandlers}
                />
              ))}
            </div>
          </div>
          <DragOverlay>
            {dragOpportunity && <KanbanOpportunityCard opportunity={dragOpportunity} stages={stages} {...cardHandlers} overlay />}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead><TableHead>Stage</TableHead><TableHead>Value</TableHead><TableHead>Owner</TableHead><TableHead>Priority</TableHead><TableHead>Expected close</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOpportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell>
                    <button className="flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setDetailOpportunity(opportunity)} type="button">
                      <span className="font-medium text-foreground">{opportunity.name}</span><span className="text-xs text-muted-foreground">{opportunity.company}</span>
                    </button>
                  </TableCell>
                  <TableCell>
                    {opportunity.archived ? <span>{stages.find((stage) => stage.id === opportunity.stageId)?.name}</span> : (
                      <Select value={opportunity.stageId} onValueChange={(stageId) => moveOpportunity(opportunity.id, stageId)}>
                        <SelectTrigger aria-label={`Move ${opportunity.name} to stage`} className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectGroup>{stages.map((stage) => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}</SelectGroup></SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="font-data tabular-nums">{formatOpportunityValue(opportunity.value)}</TableCell>
                  <TableCell><span className="flex items-center gap-2"><Avatar className="size-6"><AvatarFallback className="text-[10px]">{opportunity.ownerInitials}</AvatarFallback></Avatar>{opportunity.owner}</span></TableCell>
                  <TableCell><Badge className={opportunity.priority === "High" ? "bg-destructive-soft text-destructive" : opportunity.priority === "Medium" ? "bg-warning-soft text-warning" : "bg-secondary text-secondary-foreground"} variant="secondary">{opportunity.priority}</Badge></TableCell>
                  <TableCell>{formatCloseDate(opportunity.closeDate)}</TableCell>
                  <TableCell><Badge className={getStatusClass(opportunity.status)} variant="secondary">{opportunity.archived ? "Archived" : opportunity.status}</Badge></TableCell>
                  <TableCell><OpportunityActions opportunity={opportunity} stages={stages} onMove={moveOpportunity} onEdit={openEdit} onDuplicate={duplicateOpportunity} onArchive={archiveOpportunity} onDelete={setDeleteTarget} onRestore={restoreOpportunity} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <OpportunityFormDialog key={`form-${formSession}`} open={formOpen} onOpenChange={setFormOpen} initialOpportunity={formInitial} isEditing={formMode === "edit"} initialStageId={formStageId} stages={stages} onSave={saveOpportunity} />
      <StageManagerDialog key={`stages-${stageSession}`} open={stageManagerOpen} onOpenChange={setStageManagerOpen} stages={stages} opportunities={opportunities} onSave={saveStages} />

      <Sheet open={detailOpportunity !== null} onOpenChange={(open) => { if (!open) setDetailOpportunity(null) }}>
        {detailOpportunity && (
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader className="border-b px-5 py-5 pr-12">
              <div className="flex items-center gap-2"><Badge className={getStatusClass(detailOpportunity.status)} variant="secondary">{detailOpportunity.status}</Badge><Badge variant="outline">{stages.find((stage) => stage.id === detailOpportunity.stageId)?.name}</Badge></div>
              <SheetTitle className="pt-2 text-xl">{detailOpportunity.name}</SheetTitle>
              <SheetDescription>{detailOpportunity.company}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-card p-3"><span className="text-xs text-muted-foreground">Deal value</span><p className="mt-1 font-data text-lg font-semibold">{formatOpportunityValue(detailOpportunity.value)}</p></div>
                <div className="rounded-lg border bg-card p-3"><span className="text-xs text-muted-foreground">Priority</span><p className="mt-1"><Badge className={detailOpportunity.priority === "High" ? "bg-destructive-soft text-destructive" : detailOpportunity.priority === "Medium" ? "bg-warning-soft text-warning" : "bg-secondary text-secondary-foreground"} variant="secondary">{detailOpportunity.priority}</Badge></p></div>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2"><span className="text-sm text-muted-foreground">Owner</span><span className="flex items-center gap-2 text-sm font-medium"><Avatar className="size-6"><AvatarFallback className="text-[10px]">{detailOpportunity.ownerInitials}</AvatarFallback></Avatar>{detailOpportunity.owner}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-sm text-muted-foreground">Expected close</span><span className="text-sm font-medium">{formatCloseDate(detailOpportunity.closeDate)}</span></div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Opportunity notes</h3>
                <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">{detailOpportunity.notes || "No notes added yet."}</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Move to stage</h3>
                <Select disabled={detailOpportunity.archived} value={detailOpportunity.stageId} onValueChange={(stageId) => { moveOpportunity(detailOpportunity.id, stageId); setDetailOpportunity((current) => current ? { ...current, stageId, status: getOpportunityStatus(stageId, stages) } : current) }}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup>{stages.map((stage) => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="mt-auto border-t bg-card px-5 py-5 sm:flex-row sm:justify-between">
              <Button onClick={() => detailOpportunity.archived ? restoreOpportunity(detailOpportunity) : archiveOpportunity(detailOpportunity)} variant="outline">{detailOpportunity.archived ? <><ArchiveIcon data-icon="inline-start" />Restore</> : <><ArchiveIcon data-icon="inline-start" />Archive</>}</Button>
              <Button onClick={() => openEdit(detailOpportunity)}>Edit opportunity</Button>
            </SheetFooter>
          </SheetContent>
        )}
      </Sheet>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the opportunity from this demo pipeline. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={deleteOpportunity}>Delete opportunity</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
