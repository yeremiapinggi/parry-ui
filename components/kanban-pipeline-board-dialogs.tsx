"use client"

import { useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { OPPORTUNITY_OWNERS } from "@/components/kanban-pipeline-board-data"
import type { Opportunity, OpportunityInput, PipelineStage } from "@/components/kanban-pipeline-board-types"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type OpportunityFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialOpportunity: Opportunity | null
  isEditing: boolean
  initialStageId: string
  stages: PipelineStage[]
  onSave: (input: OpportunityInput) => void
}

type OpportunityDraft = Omit<OpportunityInput, "value"> & { value: string }
type OpportunityField = keyof OpportunityDraft

function getOpportunityDraft(initialOpportunity: Opportunity | null, initialStageId: string): OpportunityDraft {
  return {
    name: initialOpportunity?.name ?? "",
    company: initialOpportunity?.company ?? "",
    value: initialOpportunity ? String(initialOpportunity.value) : "",
    owner: initialOpportunity?.owner ?? OPPORTUNITY_OWNERS[0],
    ownerInitials: initialOpportunity?.ownerInitials ?? "AC",
    priority: initialOpportunity?.priority ?? "Medium",
    closeDate: initialOpportunity?.closeDate ?? "",
    stageId: initialOpportunity?.stageId ?? initialStageId,
    notes: initialOpportunity?.notes ?? "",
  }
}

function getInitials(name: string) {
  return name.split(/\s+/).map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase()
}

export function OpportunityFormDialog({ open, onOpenChange, initialOpportunity, isEditing, initialStageId, stages, onSave }: OpportunityFormDialogProps) {
  const [draft, setDraft] = useState<OpportunityDraft>(() => getOpportunityDraft(initialOpportunity, initialStageId))
  const [errors, setErrors] = useState<Partial<Record<OpportunityField, string>>>({})
  const [discardOpen, setDiscardOpen] = useState(false)
  const initialDraft = useMemo(() => getOpportunityDraft(initialOpportunity, initialStageId), [initialOpportunity, initialStageId])
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initialDraft)
  const canSubmit = Boolean(draft.name.trim() && draft.company.trim() && draft.value.trim() && draft.owner && draft.stageId && draft.closeDate)

  function updateField(field: OpportunityField, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value,
      ...(field === "owner" ? { ownerInitials: getInitials(value) } : {}),
    }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function requestClose(nextOpen: boolean) {
    if (!nextOpen && isDirty) {
      setDiscardOpen(true)
      return
    }
    onOpenChange(nextOpen)
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(draft.value)
    const nextErrors: Partial<Record<OpportunityField, string>> = {}
    if (!draft.name.trim()) nextErrors.name = "Enter an opportunity name."
    if (!draft.company.trim()) nextErrors.company = "Enter a company name."
    if (!Number.isFinite(value) || value <= 0) nextErrors.value = "Enter a value greater than zero."
    if (!draft.closeDate) nextErrors.closeDate = "Choose an expected close date."
    if (!draft.owner) nextErrors.owner = "Choose an owner."
    if (!draft.stageId) nextErrors.stageId = "Choose a stage."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({ ...draft, name: draft.name.trim(), company: draft.company.trim(), value, ownerInitials: getInitials(draft.owner) })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit opportunity" : "Add opportunity"}</DialogTitle>
            <DialogDescription>Keep opportunity details current as the deal moves through your pipeline.</DialogDescription>
          </DialogHeader>
          {isDirty && <p className="flex items-center gap-2 text-xs font-medium text-warning"><span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />Unsaved changes</p>}
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="opportunity-name">Opportunity name</FieldLabel>
                <Input id="opportunity-name" value={draft.name} onChange={(event) => updateField("name", event.target.value)} aria-invalid={Boolean(errors.name)} autoFocus />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.company)}>
                <FieldLabel htmlFor="opportunity-company">Company</FieldLabel>
                <Input id="opportunity-company" value={draft.company} onChange={(event) => updateField("company", event.target.value)} aria-invalid={Boolean(errors.company)} />
                <FieldError>{errors.company}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.value)}>
                <FieldLabel htmlFor="opportunity-value">Deal value (USD)</FieldLabel>
                <Input id="opportunity-value" type="number" min="0" step="1" inputMode="numeric" value={draft.value} onChange={(event) => updateField("value", event.target.value)} aria-invalid={Boolean(errors.value)} />
                <FieldError>{errors.value}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.closeDate)}>
                <FieldLabel htmlFor="opportunity-close-date">Expected close date</FieldLabel>
                <Input id="opportunity-close-date" type="date" value={draft.closeDate} onChange={(event) => updateField("closeDate", event.target.value)} aria-invalid={Boolean(errors.closeDate)} />
                <FieldError>{errors.closeDate}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.owner)}>
                <FieldLabel htmlFor="opportunity-owner">Owner</FieldLabel>
                <Select value={draft.owner} onValueChange={(value) => updateField("owner", value)}>
                  <SelectTrigger id="opportunity-owner" aria-invalid={Boolean(errors.owner)} className="w-full"><SelectValue placeholder="Select an owner" /></SelectTrigger>
                  <SelectContent><SelectGroup>{OPPORTUNITY_OWNERS.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
                <FieldError>{errors.owner}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="opportunity-priority">Priority</FieldLabel>
                <Select value={draft.priority} onValueChange={(value) => updateField("priority", value as OpportunityDraft["priority"])}>
                  <SelectTrigger id="opportunity-priority" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectGroup></SelectContent>
                </Select>
              </Field>
              <Field data-invalid={Boolean(errors.stageId)}>
                <FieldLabel htmlFor="opportunity-stage">Stage</FieldLabel>
                <Select value={draft.stageId} onValueChange={(value) => updateField("stageId", value)}>
                  <SelectTrigger id="opportunity-stage" aria-invalid={Boolean(errors.stageId)} className="w-full"><SelectValue placeholder="Select a stage" /></SelectTrigger>
                  <SelectContent><SelectGroup>{stages.map((stage) => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
                <FieldError>{errors.stageId}</FieldError>
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel htmlFor="opportunity-notes">Notes <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Textarea id="opportunity-notes" rows={3} value={draft.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </Field>
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => requestClose(false)}>Cancel</Button>
              <Button type="submit" disabled={!canSubmit}>{isEditing ? "Save changes" : "Add opportunity"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>Your edits will be lost if you close this form now.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setDiscardOpen(false); onOpenChange(false) }}>Discard changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

type StageDeleteAction = { stageId: string; reassignToId?: string }

type StageManagerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stages: PipelineStage[]
  opportunities: Opportunity[]
  onSave: (stages: PipelineStage[], deleteActions: StageDeleteAction[]) => void
}

function hasDuplicateStageNames(stages: PipelineStage[]) {
  const names = stages.map((stage) => stage.name.trim().toLocaleLowerCase()).filter(Boolean)
  return new Set(names).size !== names.length
}

export function StageManagerDialog({ open, onOpenChange, stages, opportunities, onSave }: StageManagerDialogProps) {
  const [draftStages, setDraftStages] = useState(() => stages.map((stage) => ({ ...stage })))
  const [newStageName, setNewStageName] = useState("")
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<PipelineStage | null>(null)
  const [reassignToId, setReassignToId] = useState("")
  const [deleteActions, setDeleteActions] = useState<StageDeleteAction[]>([])

  const canSave = draftStages.length >= 2 && !hasDuplicateStageNames(draftStages) && draftStages.every((stage) => stage.name.trim())
  const deleteCount = deleteTarget ? opportunities.filter((opportunity) => opportunity.stageId === deleteTarget.id).length : 0
  const reassignOptions = deleteTarget ? draftStages.filter((stage) => stage.id !== deleteTarget.id) : []

  function addStage() {
    const name = newStageName.trim()
    if (!name) {
      setError("Enter a stage name.")
      return
    }
    if (draftStages.some((stage) => stage.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError("Stage names must be unique.")
      return
    }
    const terminalStart = draftStages.findIndex((stage) => stage.terminal)
    const insertionIndex = terminalStart === -1 ? draftStages.length : terminalStart
    const next = [...draftStages]
    next.splice(insertionIndex, 0, { id: `stage-${Date.now()}`, name })
    setDraftStages(next)
    setNewStageName("")
    setError("")
  }

  function moveStage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    const terminalStart = draftStages.findIndex((stage) => stage.terminal)
    if (nextIndex < 0 || nextIndex >= (terminalStart === -1 ? draftStages.length : terminalStart)) return
    const next = [...draftStages]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    setDraftStages(next)
  }

  function confirmDelete() {
    if (!deleteTarget || (deleteCount > 0 && !reassignToId)) return
    setDraftStages((current) => current.filter((stage) => stage.id !== deleteTarget.id))
    setDeleteActions((current) => [...current, { stageId: deleteTarget.id, reassignToId: deleteCount ? reassignToId : undefined }])
    setDeleteTarget(null)
    setReassignToId("")
    setError("")
  }

  function saveStages() {
    if (!canSave) {
      setError(hasDuplicateStageNames(draftStages) ? "Stage names must be unique." : "Add a name to every stage and keep at least two stages.")
      return
    }
    onSave(draftStages.map((stage) => ({ ...stage, name: stage.name.trim() })), deleteActions)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage stages</DialogTitle>
            <DialogDescription>Add, rename, and reorder the workflow stages. Won and Lost stay visible as terminal stages.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="new-pipeline-stage">Add a stage</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input id="new-pipeline-stage" value={newStageName} onChange={(event) => { setNewStageName(event.target.value); setError("") }} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); addStage() } }} placeholder="e.g. Technical review" aria-invalid={Boolean(error)} />
                  <Button type="button" variant="outline" onClick={addStage}><PlusIcon data-icon="inline-start" />Add</Button>
                </div>
                <FieldError>{error}</FieldError>
              </Field>
            </FieldGroup>
            <ol className="flex flex-col gap-2" aria-label="Pipeline stages">
              {draftStages.map((stage, index) => {
                const count = opportunities.filter((opportunity) => opportunity.stageId === stage.id).length
                const terminalStart = draftStages.findIndex((candidate) => candidate.terminal)
                return (
                  <li key={stage.id} className="flex items-center gap-2 rounded-lg border bg-card p-2">
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <Input aria-label={`${stage.name} stage name`} value={stage.name} onChange={(event) => { const name = event.target.value; setDraftStages((current) => current.map((candidate) => candidate.id === stage.id ? { ...candidate, name } : candidate)); setError("") }} />
                      {stage.terminal && <span className="shrink-0 text-[10px] text-muted-foreground">Terminal</span>}
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{count}</span>
                    </span>
                    <Button aria-label={`Move ${stage.name} up`} disabled={Boolean(stage.terminal) || index === 0} onClick={() => moveStage(index, -1)} size="icon-sm" variant="ghost"><ArrowUpIcon /></Button>
                    <Button aria-label={`Move ${stage.name} down`} disabled={Boolean(stage.terminal) || index >= (terminalStart === -1 ? draftStages.length - 1 : terminalStart - 1)} onClick={() => moveStage(index, 1)} size="icon-sm" variant="ghost"><ArrowDownIcon /></Button>
                    <Button aria-label={`Delete ${stage.name}`} disabled={Boolean(stage.terminal)} onClick={() => { setDeleteTarget(stage); setReassignToId("") }} size="icon-sm" variant="ghost"><Trash2Icon /></Button>
                  </li>
                )
              })}
            </ol>
            {(error || hasDuplicateStageNames(draftStages) || draftStages.some((stage) => !stage.name.trim()) || draftStages.length < 2) && <p role="alert" className="text-sm text-destructive">{error || (hasDuplicateStageNames(draftStages) ? "Stage names must be unique." : draftStages.length < 2 ? "Keep at least two stages in the workflow." : "Add a name to every stage.")}</p>}
            <DialogFooter className="border-t pt-4">
              <Button type="button" onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
              <Button type="button" onClick={saveStages} disabled={!canSave}>Save stages</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteTarget !== null} onOpenChange={(nextOpen) => { if (!nextOpen) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCount > 0 ? `${deleteCount} opportunity${deleteCount === 1 ? " is" : "ies are"} in this stage. Choose where to move ${deleteCount === 1 ? "it" : "them"} before deleting the stage.` : "This empty stage will be removed from the workflow."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteCount > 0 && (
            <Field>
              <FieldLabel htmlFor="stage-reassignment">Move opportunities to</FieldLabel>
              <Select value={reassignToId} onValueChange={setReassignToId}>
                <SelectTrigger id="stage-reassignment" className="w-full"><SelectValue placeholder="Select a stage" /></SelectTrigger>
                <SelectContent><SelectGroup>{reassignOptions.map((stage) => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
            </Field>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={deleteCount > 0 && !reassignToId} onClick={confirmDelete}>Delete stage</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
