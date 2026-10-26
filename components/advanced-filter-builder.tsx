"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { CirclePlusIcon, FilterIcon, FilterXIcon, Layers3Icon, SearchIcon, XIcon } from "lucide-react"

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
  flattenConditions,
  operatorLabels,
  operatorsForField,
  removeConditionFromGroup,
  removeGroupFromGroup,
  updateConditionInGroup,
  validateCondition,
} from "@/lib/advanced-filter-engine"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function enumOptions(field: FilterField) {
  if (field === "status") return recordStatuses
  if (field === "priority") return recordPriorities
  if (field === "channel") return recordChannels
  return recordOwners
}

function conditionText(condition: FilterCondition) {
  const field = filterFields.find(({ key }) => key === condition.field)?.label ?? condition.field
  const value = condition.operator === "is_any_of"
    ? (condition.values ?? []).join(", ")
    : condition.operator === "between"
      ? `${condition.value} – ${condition.secondValue ?? ""}`
      : condition.value
  return `${field} ${operatorLabels[condition.operator]} ${value}`
}

function replaceGroupLogic(group: FilterGroup, groupId: string, logic: FilterLogic): FilterGroup {
  if (group.id === groupId) return { ...group, logic }
  return { ...group, groups: group.groups.map((nested) => replaceGroupLogic(nested, groupId, logic)) }
}

type Composer = {
  groupId: string
  condition: FilterCondition
  isNew: boolean
  error: string | null
}

export function AdvancedFilterBuilder({
  appliedFilters,
  search,
  onSearchChange,
  onApply,
  onClear,
}: {
  appliedFilters: FilterGroup
  search: string
  onSearchChange: (value: string) => void
  onApply: (filters: FilterGroup) => void
  onClear: () => void
}) {
  const [composer, setComposer] = useState<Composer | null>(null)
  const valueInputRef = useRef<HTMLInputElement>(null)
  const flattened = flattenConditions(appliedFilters)
  const activeTerms = appliedFilters.conditions.length + appliedFilters.groups.filter((group) => group.conditions.length > 0).length
  const hasFilters = flattened.length > 0 || appliedFilters.groups.length > 0
  const hasQuery = hasFilters || Boolean(search.trim())
  const shouldFocusValueInput = Boolean(composer && fieldType(composer.condition.field) !== "enum" && composer.condition.operator !== "is_any_of")

  useEffect(() => {
    if (shouldFocusValueInput) valueInputRef.current?.focus()
  }, [shouldFocusValueInput, composer?.condition.id])

  function openComposer(groupId: string, condition?: FilterCondition) {
    setComposer({
      groupId,
      condition: condition ? { ...condition, values: condition.values ? [...condition.values] : undefined } : createEmptyCondition(),
      isNew: !condition,
      error: null,
    })
  }

  function editCondition(update: (condition: FilterCondition) => FilterCondition) {
    setComposer((current) => current ? { ...current, condition: update(current.condition), error: null } : current)
  }

  function applyCondition() {
    if (!composer) return
    const error = validateCondition(composer.condition)
    if (error) {
      setComposer((current) => current ? { ...current, error } : current)
      return
    }

    const next = cloneFilterGroup(appliedFilters)
    if (composer.isNew) {
      const append = (group: FilterGroup): FilterGroup => group.id === composer.groupId
        ? { ...group, conditions: [...group.conditions, composer.condition] }
        : { ...group, groups: group.groups.map(append) }
      onApply(append(next))
    } else {
      onApply(updateConditionInGroup(next, composer.condition.id, () => composer.condition))
    }
    setComposer(null)
  }

  function changeLogic(groupId: string, logic: FilterLogic) {
    onApply(replaceGroupLogic(cloneFilterGroup(appliedFilters), groupId, logic))
  }

  function removeCondition(conditionId: string) {
    onApply(removeConditionFromGroup(cloneFilterGroup(appliedFilters), conditionId))
    if (composer?.condition.id === conditionId) setComposer(null)
  }

  function removeGroup(groupId: string) {
    onApply(removeGroupFromGroup(cloneFilterGroup(appliedFilters), groupId))
    if (composer?.groupId === groupId) setComposer(null)
  }

  function addGroup() {
    const group = createEmptyGroup()
    group.conditions = []
    onApply({ ...cloneFilterGroup(appliedFilters), groups: [...appliedFilters.groups, group] })
  }

  function handleEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      applyCondition()
    }
  }

  function renderEditor() {
    if (!composer) return null
    const { condition, error } = composer
    const fieldKind = fieldType(condition.field)
    const choices = fieldKind === "enum" ? enumOptions(condition.field) : []

    return <div className="flex max-h-[min(34rem,calc(100dvh-8rem))] flex-col gap-3 overflow-y-auto p-1">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground">
          Field
          <Select value={condition.field} onValueChange={(value) => editCondition((current) => ({
            ...current,
            field: value as FilterField,
            operator: operatorsForField(value as FilterField)[0],
            value: "",
            secondValue: "",
            values: [],
          }))}>
            <SelectTrigger aria-label="Filter field" className="h-8 text-sm text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent data-parry-theme><SelectGroup>{filterFields.map(({ key, label }) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground">
          Operator
          <Select value={condition.operator} onValueChange={(value) => editCondition((current) => ({
            ...current,
            operator: value as FilterCondition["operator"],
            value: "",
            secondValue: "",
            values: [],
          }))}>
            <SelectTrigger aria-label="Filter operator" className="h-8 text-sm text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent data-parry-theme><SelectGroup>{operatorsForField(condition.field).map((operator) => <SelectItem key={operator} value={operator}>{operatorLabels[operator]}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </label>
      </div>

      {fieldKind === "enum" && condition.operator === "is_any_of" ? <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="text-xs font-medium text-muted-foreground">Values</legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-md border p-2">
          {choices.map((choice) => <label key={choice} className="flex min-w-0 items-center gap-2 text-sm">
            <Checkbox checked={condition.values?.includes(choice) ?? false} onCheckedChange={(checked) => editCondition((current) => ({
              ...current,
              values: checked ? [...(current.values ?? []), choice] : (current.values ?? []).filter((value) => value !== choice),
            }))} />
            <span className="truncate">{choice}</span>
          </label>)}
        </div>
      </fieldset> : fieldKind === "enum" ? <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Value
        <Select value={condition.value} onValueChange={(value) => editCondition((current) => ({ ...current, value }))}>
          <SelectTrigger aria-label="Filter value" className="h-8 text-sm text-foreground"><SelectValue placeholder="Choose a value" /></SelectTrigger>
          <SelectContent data-parry-theme><SelectGroup>{choices.map((choice) => <SelectItem key={choice} value={choice}>{choice}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </label> : condition.operator === "between" ? <div className="grid grid-cols-2 gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground">From
          <Input ref={valueInputRef} aria-label="Start date" type="date" value={condition.value} onChange={(event) => editCondition((current) => ({ ...current, value: event.target.value }))} />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground">To
          <Input aria-label="End date" type="date" value={condition.secondValue ?? ""} onChange={(event) => editCondition((current) => ({ ...current, secondValue: event.target.value }))} />
        </label>
      </div> : <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Value
        <Input ref={valueInputRef} aria-label={`${filterFields.find(({ key }) => key === condition.field)?.label ?? "Filter"} value`} type={fieldKind === "date" ? "date" : "text"} placeholder={fieldKind === "date" ? "Choose a date" : "Enter a value"} value={condition.value} onChange={(event) => editCondition((current) => ({ ...current, value: event.target.value }))} onKeyDown={handleEnter} />
      </label>}

      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center justify-between gap-2 border-t pt-2">
        {!composer.isNew ? <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeCondition(condition.id)}>Delete</Button> : <span />}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setComposer(null)}>Cancel</Button>
          <Button type="button" size="sm" onClick={applyCondition}>Apply condition</Button>
        </div>
      </div>
    </div>
  }

  function renderConditionChip(condition: FilterCondition, groupId: string) {
    const isOpen = composer?.condition.id === condition.id
    const label = conditionText(condition)
    return <span key={condition.id} className="inline-flex max-w-full items-center overflow-hidden rounded-md border border-info/30 bg-info-soft text-info">
      <Popover open={isOpen} onOpenChange={(open) => {
        if (open) openComposer(groupId, condition)
        else if (isOpen) setComposer(null)
      }}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-7 min-w-0 max-w-[min(20rem,calc(100vw-5rem))] justify-start gap-1.5 rounded-none px-2 text-left text-xs font-medium text-info hover:bg-info/10 hover:text-info" aria-label={`Edit filter: ${label}`}>
            <FilterIcon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent data-parry-theme side="bottom" align="start" collisionPadding={10} className="w-[min(22rem,calc(100vw-1.5rem))] p-2.5">
          {renderEditor()}
        </PopoverContent>
      </Popover>
      <Button type="button" variant="ghost" size="icon-xs" className="size-7 shrink-0 rounded-none border-l border-info/20 text-info hover:bg-info/10 hover:text-info" aria-label={`Remove filter: ${label}`} onClick={() => removeCondition(condition.id)}><XIcon /></Button>
    </span>
  }

  function renderAddCondition(groupId: string, label = "Add condition") {
    const isOpen = composer?.isNew === true && composer.groupId === groupId
    return <Popover open={isOpen} onOpenChange={(open) => {
      if (open) openComposer(groupId)
      else if (isOpen) setComposer(null)
    }}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 gap-1.5 px-2 text-xs">
          <CirclePlusIcon data-icon="inline-start" />{label}
        </Button>
      </PopoverTrigger>
      <PopoverContent data-parry-theme side="bottom" align="start" collisionPadding={10} className="w-[min(22rem,calc(100vw-1.5rem))] p-2.5">
        {renderEditor()}
      </PopoverContent>
    </Popover>
  }

  function renderLogic(group: FilterGroup, label: string) {
    return <Select value={group.logic} onValueChange={(value) => changeLogic(group.id, value as FilterLogic)}>
      <SelectTrigger aria-label={`${label} match logic`} className="h-7 w-[7.25rem] shrink-0 px-2 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent data-parry-theme><SelectGroup><SelectItem value="AND">Match all</SelectItem><SelectItem value="OR">Match any</SelectItem></SelectGroup></SelectContent>
    </Select>
  }

  return <div className="flex min-w-0 flex-col gap-2.5 rounded-lg border bg-background p-2.5 sm:flex-row sm:items-start sm:p-3">
    <div className="relative min-w-0 sm:w-56 sm:shrink-0">
      <SearchIcon aria-hidden="true" className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input aria-label="Search records" placeholder="Search records…" value={search} onChange={(event) => onSearchChange(event.target.value)} className="h-8 border-transparent bg-muted/40 pl-9 shadow-none focus-visible:border-ring sm:w-full" />
    </div>
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2" aria-label="Filter query">
      {activeTerms > 1 && renderLogic(appliedFilters, "Query")}
      {appliedFilters.conditions.map((condition) => renderConditionChip(condition, appliedFilters.id))}
      {appliedFilters.groups.map((group) => <div key={group.id} className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5 rounded-md border border-dashed border-info/30 bg-info-soft/30 px-2 py-1.5">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Layers3Icon aria-hidden="true" className="size-3.5" />Group</span>
        {group.conditions.length > 1 && renderLogic(group, "Group")}
        {group.conditions.map((condition) => renderConditionChip(condition, group.id))}
        {renderAddCondition(group.id, "Add")}
        <Button type="button" variant="ghost" size="icon-xs" className="size-7 shrink-0" aria-label="Remove condition group" onClick={() => removeGroup(group.id)}><XIcon /></Button>
      </div>)}
      {renderAddCondition(appliedFilters.id)}
      <Button type="button" variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={addGroup}>
        <Layers3Icon data-icon="inline-start" />Add group
      </Button>
    </div>
    {hasQuery && <Button type="button" variant="ghost" size="sm" className="h-7 shrink-0 self-end px-2 text-xs sm:self-start" onClick={onClear}>
      <FilterXIcon data-icon="inline-start" />Clear all
    </Button>}
  </div>
}
