"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDaysIcon, CirclePlusIcon, FilterIcon, Trash2Icon, XIcon } from "lucide-react"

import {
  filterFields,
  recordChannels,
  recordOwners,
  recordPriorities,
  recordStatuses,
  type FilterCondition,
  type FilterField,
  type FilterGroup,
  type FilterLogic,
} from "@/lib/advanced-filterable-table-data"
import {
  cloneFilterGroup,
  createEmptyCondition,
  createEmptyGroup,
  fieldType,
  operatorLabels,
  operatorsForField,
  validateFilterGroup,
  updateConditionInGroup,
} from "@/lib/advanced-filter-engine"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function enumOptions(field: FilterField) {
  if (field === "status") return recordStatuses
  if (field === "priority") return recordPriorities
  if (field === "channel") return recordChannels
  return recordOwners
}

function newCondition(field: FilterField = "status"): FilterCondition {
  const condition = createEmptyCondition()
  return { ...condition, field, operator: operatorsForField(field)[0], value: "", values: [] }
}

function updateAt(group: FilterGroup, groupId: string, conditionId: string, update: (condition: FilterCondition) => FilterCondition): FilterGroup {
  if (group.id === groupId) return updateConditionInGroup(group, conditionId, update)
  return { ...group, groups: group.groups.map((nested) => updateAt(nested, groupId, conditionId, update)) }
}

function addCondition(group: FilterGroup, groupId: string): FilterGroup {
  if (group.id === groupId) return { ...group, conditions: [...group.conditions, newCondition()] }
  return { ...group, groups: group.groups.map((nested) => addCondition(nested, groupId)) }
}

function updateLogic(group: FilterGroup, groupId: string, logic: FilterLogic): FilterGroup {
  if (group.id === groupId) return { ...group, logic }
  return { ...group, groups: group.groups.map((nested) => updateLogic(nested, groupId, logic)) }
}

function removeCondition(group: FilterGroup, groupId: string, conditionId: string): FilterGroup {
  if (group.id === groupId) return { ...group, conditions: group.conditions.filter((condition) => condition.id !== conditionId) }
  return { ...group, groups: group.groups.map((nested) => removeCondition(nested, groupId, conditionId)) }
}

function ConditionRow({
  condition,
  groupId,
  error,
  onChange,
  onRemove,
}: {
  condition: FilterCondition
  groupId: string
  error: string | null
  onChange: (groupId: string, conditionId: string, update: (condition: FilterCondition) => FilterCondition) => void
  onRemove: (groupId: string, conditionId: string) => void
}) {
  const kind = fieldType(condition.field)
  const operators = operatorsForField(condition.field)
  const fieldLabel = filterFields.find(({ key }) => key === condition.field)?.label ?? "Field"
  const options = kind === "enum" ? enumOptions(condition.field) : []

  function updateField(field: FilterField) {
    onChange(groupId, condition.id, (current) => ({ ...current, field, operator: operatorsForField(field)[0], value: "", secondValue: "", values: [] }))
  }

  function renderValue() {
    if (kind === "enum" && condition.operator === "is_any_of") {
      return (
        <select
          aria-label={`${fieldLabel} values`}
          multiple
          size={3}
          value={condition.values ?? []}
          onChange={(event) => onChange(groupId, condition.id, (current) => ({ ...current, values: Array.from(event.target.selectedOptions, (option) => option.value) }))}
          className="min-h-20 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      )
    }
    if (kind === "enum") {
      return (
        <Select value={condition.value} onValueChange={(value) => onChange(groupId, condition.id, (current) => ({ ...current, value }))}>
          <SelectTrigger aria-label={`${fieldLabel} value`} className="w-full"><SelectValue placeholder={`Choose ${fieldLabel.toLocaleLowerCase()}`} /></SelectTrigger>
          <SelectContent><SelectGroup>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      )
    }
    if (kind === "date" && condition.operator === "between") {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input aria-label="Start date" type="date" value={condition.value} onChange={(event) => onChange(groupId, condition.id, (current) => ({ ...current, value: event.target.value }))} />
          <Input aria-label="End date" type="date" value={condition.secondValue ?? ""} onChange={(event) => onChange(groupId, condition.id, (current) => ({ ...current, secondValue: event.target.value }))} />
        </div>
      )
    }
    return (
      <Input
        aria-label={`${fieldLabel} value`}
        type={kind === "date" ? "date" : "text"}
        placeholder={kind === "date" ? "Choose date" : `Enter ${fieldLabel.toLocaleLowerCase()}`}
        value={condition.value}
        onChange={(event) => onChange(groupId, condition.id, (current) => ({ ...current, value: event.target.value }))}
      />
    )
  }

  return (
    <div className="grid min-w-0 gap-2 rounded-lg border bg-background p-3 md:grid-cols-[minmax(8rem,1fr)_minmax(9rem,1fr)_minmax(10rem,1.4fr)_auto] md:items-start">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Field</Label>
        <Select value={condition.field} onValueChange={(value) => updateField(value as FilterField)}>
          <SelectTrigger aria-label="Filter field" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>{filterFields.map(({ key, label }) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Operator</Label>
        <Select value={condition.operator} onValueChange={(value) => onChange(groupId, condition.id, (current) => ({ ...current, operator: value as FilterCondition["operator"], value: "", secondValue: "", values: [] }))}>
          <SelectTrigger aria-label="Filter operator" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>{operators.map((operator) => <SelectItem key={operator} value={operator}>{operatorLabels[operator]}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Value</Label>
        {renderValue()}
        {kind === "enum" && condition.operator === "is_any_of" && <p className="text-xs text-muted-foreground">Use Ctrl or Command to select multiple values.</p>}
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      </div>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${fieldLabel} condition`} onClick={() => onRemove(groupId, condition.id)} className="md:mt-5">
        <XIcon />
      </Button>
    </div>
  )
}

function FilterGroupEditor({
  group,
  root,
  error,
  onChange,
  onAddCondition,
  onRemoveCondition,
  onLogicChange,
  onRemoveGroup,
  onAddGroup,
}: {
  group: FilterGroup
  root: boolean
  error: string | null
  onChange: (groupId: string, conditionId: string, update: (condition: FilterCondition) => FilterCondition) => void
  onAddCondition: (groupId: string) => void
  onRemoveCondition: (groupId: string, conditionId: string) => void
  onLogicChange: (groupId: string, logic: FilterLogic) => void
  onRemoveGroup?: (groupId: string) => void
  onAddGroup?: () => void
}) {
  return (
    <section aria-label={root ? "Main filter group" : "Nested filter group"} className={root ? "flex flex-col gap-3" : "flex flex-col gap-3 rounded-lg border border-dashed p-3 sm:p-4"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={root ? "secondary" : "outline"}>{root ? "Main group" : "Nested group"}</Badge>
          <span className="text-xs text-muted-foreground">Match</span>
          <Select value={group.logic} onValueChange={(value) => onLogicChange(group.id, value as FilterLogic)}>
            <SelectTrigger aria-label={`${root ? "Main" : "Nested"} condition logic`} className="h-7 w-24"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="AND">all (AND)</SelectItem><SelectItem value="OR">any (OR)</SelectItem></SelectGroup></SelectContent>
          </Select>
        </div>
        {!root && <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove nested group" onClick={() => onRemoveGroup?.(group.id)}><Trash2Icon /></Button>}
      </div>
      {group.conditions.length === 0 && group.groups.length === 0 ? <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">Add a condition to this group or remove it.</p> : null}
      <div className="flex flex-col gap-2">
        {group.conditions.map((condition) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            groupId={group.id}
            error={error && !condition.value.trim() && !(condition.values?.length) ? error : null}
            onChange={onChange}
            onRemove={onRemoveCondition}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onAddCondition(group.id)}><CirclePlusIcon data-icon="inline-start" />Add condition</Button>
        {root && group.groups.length === 0 && <Button type="button" variant="ghost" size="sm" onClick={() => onAddGroup?.()}><CirclePlusIcon data-icon="inline-start" />Add nested group</Button>}
      </div>
      {group.groups.map((nested) => <FilterGroupEditor key={nested.id} group={nested} root={false} error={error} onChange={onChange} onAddCondition={onAddCondition} onRemoveCondition={onRemoveCondition} onLogicChange={onLogicChange} onRemoveGroup={onRemoveGroup} />)}
    </section>
  )
}

export function AdvancedFilterBuilder({
  appliedFilters,
  openRequest,
  onApply,
  onClear,
}: {
  appliedFilters: FilterGroup
  openRequest: { groupId: string; conditionId: string; nonce: number } | null
  onApply: (filters: FilterGroup) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<FilterGroup>(() => cloneFilterGroup(appliedFilters))
  const [error, setError] = useState<string | null>(null)
  const handledRequest = useRef<number | null>(null)

  function readyGroup(group: FilterGroup) {
    const copy = cloneFilterGroup(group)
    if (copy.conditions.length === 0 && copy.groups.length === 0) copy.conditions = [newCondition()]
    return copy
  }

  function openBuilder() {
    setDraft(readyGroup(appliedFilters))
    setError(null)
    setOpen(true)
  }

  useEffect(() => {
    if (!openRequest || handledRequest.current === openRequest.nonce) return
    handledRequest.current = openRequest.nonce
    setDraft(readyGroup(appliedFilters))
    setError(null)
    setOpen(true)
  }, [appliedFilters, openRequest])

  function handleApply() {
    const validationError = validateFilterGroup(draft)
    if (validationError) {
      setError(validationError)
      return
    }
    onApply(draft)
    setOpen(false)
    setError(null)
  }

  function handleClear() {
    onClear()
    setDraft({ id: "root-clear", logic: "AND", conditions: [], groups: [] })
    setError(null)
  }

  function addNestedGroup() {
    if (draft.groups.length > 0) return
    const root = { ...draft, conditions: [...draft.conditions], groups: [createEmptyGroup()] }
    setDraft(root)
  }

  const conditionCount = (group: FilterGroup): number => group.conditions.length + group.groups.reduce((total, nested) => total + conditionCount(nested), 0)

  return (
    <>
      <Button variant="outline" size="sm" onClick={openBuilder} aria-haspopup="dialog">
        <FilterIcon data-icon="inline-start" />Filters{conditionCount(appliedFilters) > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0">{conditionCount(appliedFilters)}</Badge>}
      </Button>
      <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (nextOpen) setDraft(cloneFilterGroup(appliedFilters)) }}>
        <DialogContent className="font-data max-h-[min(90dvh,52rem)] w-[min(46rem,calc(100vw-2rem))] max-w-none sm:max-w-[min(46rem,calc(100vw-2rem))] overflow-y-auto" aria-describedby="advanced-filter-description">
          <DialogHeader>
            <DialogTitle>Advanced Filter Builder</DialogTitle>
            <DialogDescription id="advanced-filter-description">Combine text, status, priority, owner, and date conditions. A single nested group supports a second level of logic.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDaysIcon aria-hidden="true" className="size-4" />Conditions apply to the current demo records.</div>
            <FilterGroupEditor
              group={draft}
              root
              error={error}
              onChange={(groupId, conditionId, update) => setDraft((current) => updateAt(current, groupId, conditionId, update))}
              onAddCondition={(groupId) => setDraft((current) => addCondition(current, groupId))}
              onRemoveCondition={(groupId, conditionId) => setDraft((current) => removeCondition(current, groupId, conditionId))}
              onLogicChange={(groupId, logic) => setDraft((current) => updateLogic(current, groupId, logic))}
              onRemoveGroup={(groupId) => setDraft((current) => ({ ...current, groups: current.groups.filter((nested) => nested.id !== groupId) }))}
              onAddGroup={addNestedGroup}
            />
            {error && <p role="alert" className="rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="ghost" onClick={handleClear}>Clear filters</Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleApply}>Apply filters</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {conditionCount(appliedFilters) > 0 && (
        <div className="sr-only" aria-live="polite">{conditionCount(appliedFilters)} advanced filter conditions applied</div>
      )}
    </>
  )
}

