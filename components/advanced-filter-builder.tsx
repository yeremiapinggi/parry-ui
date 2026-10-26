"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { CheckIcon, CirclePlusIcon, FilterXIcon, SearchIcon, XIcon } from "lucide-react"

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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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

function setGroupLogic(group: FilterGroup, groupId: string, logic: FilterLogic): FilterGroup {
  if (group.id === groupId) return { ...group, logic }
  return { ...group, groups: group.groups.map((nested) => setGroupLogic(nested, groupId, logic)) }
}

type Composer = {
  id: string
  groupId: string
  condition: FilterCondition
  stage: "field" | "operator" | "value"
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
  const composerSequence = useRef(0)
  const valueInputRef = useRef<HTMLInputElement>(null)
  const conditions = flattenConditions(appliedFilters)
  const hasFilters = conditions.length > 0 || appliedFilters.groups.length > 0

  useEffect(() => {
    if (composer?.stage === "value" && fieldType(composer.condition.field) !== "enum") {
      valueInputRef.current?.focus()
    }
  }, [composer?.id, composer?.stage, composer?.condition.field])

  function openComposer(groupId: string, condition?: FilterCondition) {
    const draft = condition ? { ...condition, values: condition.values ? [...condition.values] : undefined } : createEmptyCondition()
    setComposer({
      id: condition?.id ?? `new-${draft.id}-${++composerSequence.current}`,
      groupId,
      condition: draft,
      stage: "field",
      isNew: !condition,
      error: null,
    })
  }

  function changeComposer(update: (condition: FilterCondition) => FilterCondition) {
    setComposer((current) => current ? { ...current, condition: update(current.condition), error: null } : current)
  }

  function finishComposer() {
    if (!composer) return
    const error = validateCondition(composer.condition)
    if (error) {
      setComposer((current) => current ? { ...current, error } : current)
      return
    }

    const next = cloneFilterGroup(appliedFilters)
    if (composer.isNew) {
      const appendToGroup = (group: FilterGroup): FilterGroup => group.id === composer.groupId
        ? { ...group, conditions: [...group.conditions, composer.condition] }
        : { ...group, groups: group.groups.map(appendToGroup) }
      onApply(appendToGroup(next))
    } else {
      onApply(updateConditionInGroup(next, composer.condition.id, () => composer.condition))
    }
    setComposer(null)
  }

  function updateLogic(groupId: string, logic: FilterLogic) {
    onApply(setGroupLogic(cloneFilterGroup(appliedFilters), groupId, logic))
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
    if (appliedFilters.groups.length > 0) return
    const group = createEmptyGroup()
    group.conditions = []
    onApply({ ...cloneFilterGroup(appliedFilters), groups: [...appliedFilters.groups, group] })
    openComposer(group.id)
  }

  function handleEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      finishComposer()
    }
  }

  function renderComposerContent() {
    if (!composer) return null
    const { condition, stage } = composer
    const field = filterFields.find(({ key }) => key === condition.field)
    const kind = fieldType(condition.field)
    const options = kind === "enum" ? enumOptions(condition.field) : []

    if (stage === "field") {
      return <>
        <DropdownMenuLabel>Choose a field</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filterFields.map(({ key, label, type }) => <DropdownMenuItem key={key} onSelect={(event) => {
          event.preventDefault()
          setComposer((current) => current ? {
            ...current,
            condition: { ...current.condition, field: key, operator: operatorsForField(key)[0], value: "", secondValue: "", values: [] },
            stage: "operator",
            error: null,
          } : current)
        }}>
          <span className="min-w-0 flex-1">{label}</span><span className="text-xs text-muted-foreground">{type}</span>
        </DropdownMenuItem>)}
      </>
    }

    if (stage === "operator") {
      return <>
        <DropdownMenuLabel>{field?.label ?? "Field"} · Choose an operator</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {operatorsForField(condition.field).map((operator) => <DropdownMenuItem key={operator} onSelect={(event) => {
          event.preventDefault()
          const nextCondition = { ...condition, operator, value: "", secondValue: "", values: [] }
          if (kind === "enum" && operator !== "is_any_of") {
            setComposer((current) => current ? { ...current, condition: nextCondition, stage: "value", error: null } : current)
          } else {
            setComposer((current) => current ? { ...current, condition: nextCondition, stage: "value", error: null } : current)
          }
        }}>{operatorLabels[operator]}</DropdownMenuItem>)}
      </>
    }

    if (kind === "enum" && condition.operator === "is_any_of") {
      return <>
        <DropdownMenuLabel>Choose {field?.label.toLocaleLowerCase()} values</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => <DropdownMenuCheckboxItem
          key={option}
          checked={condition.values?.includes(option) ?? false}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={(checked) => changeComposer((current) => ({
            ...current,
            values: checked ? [...(current.values ?? []), option] : (current.values ?? []).filter((value) => value !== option),
          }))}
        >{option}</DropdownMenuCheckboxItem>)}
        <DropdownMenuSeparator />
        {composer.error && <p role="alert" className="px-2 py-1 text-xs text-destructive">{composer.error}</p>}
        <Button type="button" size="sm" className="w-full" disabled={!condition.values?.length} onClick={finishComposer}>Apply values</Button>
      </>
    }

    return <div className="flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2 p-2">
      <DropdownMenuLabel className="px-0">{field?.label} {operatorLabels[condition.operator]}</DropdownMenuLabel>
      {condition.operator === "between" ? <div className="flex flex-col gap-2">
        <Input ref={valueInputRef} aria-label="Start date" type="text" placeholder="Start · YYYY-MM-DD" value={condition.value} onChange={(event) => changeComposer((current) => ({ ...current, value: event.target.value }))} />
        <Input aria-label="End date" type="text" placeholder="End · YYYY-MM-DD" value={condition.secondValue ?? ""} onChange={(event) => changeComposer((current) => ({ ...current, secondValue: event.target.value }))} />
      </div> : kind === "enum" ? <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
        {options.map((option) => <DropdownMenuItem key={option} onSelect={(event) => {
          event.preventDefault()
          const nextCondition = { ...condition, value: option }
          setComposer((current) => current ? { ...current, condition: nextCondition } : current)
          const next = cloneFilterGroup(appliedFilters)
          const updateGroup = (group: FilterGroup): FilterGroup => group.id === composer.groupId
            ? { ...group, conditions: composer.isNew ? [...group.conditions, nextCondition] : group.conditions.map((item) => item.id === nextCondition.id ? nextCondition : item) }
            : { ...group, groups: group.groups.map(updateGroup) }
          onApply(updateGroup(next))
          setComposer(null)
        }}>{option}</DropdownMenuItem>)}
      </div> : <Input
        ref={valueInputRef}
        aria-label={`${field?.label ?? "Filter"} value`}
        type="text"
        placeholder={kind === "date" ? "YYYY-MM-DD" : `Enter ${field?.label.toLocaleLowerCase() ?? "value"}`}
        value={condition.value}
        onChange={(event) => changeComposer((current) => ({ ...current, value: event.target.value }))}
        onKeyDown={handleEnter}
      />}
      {composer.error && <p role="alert" className="text-xs text-destructive">{composer.error}</p>}
      {kind !== "enum" && <Button type="button" size="sm" className="w-full" onClick={finishComposer}>
        <CheckIcon data-icon="inline-start" />Apply condition
      </Button>}
    </div>
  }

  function renderConditionToken(condition: FilterCondition, groupId: string) {
    const isOpen = composer?.id === condition.id
    return <span key={condition.id} className="inline-flex max-w-full items-center overflow-hidden rounded-md border border-border bg-background text-xs shadow-sm">
      <DropdownMenu modal={false} open={isOpen} onOpenChange={(open) => {
        if (open) openComposer(groupId, condition)
        else if (isOpen) setComposer(null)
      }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 max-w-[min(100%,20rem)] truncate rounded-none px-2 text-xs font-medium hover:bg-accent" aria-label={`Edit filter: ${conditionText(condition)}`}>
            {conditionText(condition)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" collisionPadding={12} className="w-64 max-w-[calc(100vw-2rem)]">
          {renderComposerContent()}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button type="button" variant="ghost" size="icon-xs" className="h-7 rounded-none border-l" aria-label={`Remove filter: ${conditionText(condition)}`} onClick={() => removeCondition(condition.id)}><XIcon /></Button>
    </span>
  }

  function renderAddCondition(groupId: string, label = "Add condition") {
    const id = composer?.groupId === groupId && composer.isNew ? composer.id : `add-${groupId}`
    const isOpen = composer?.id === id
    return <DropdownMenu key={id} modal={false} open={isOpen} onOpenChange={(open) => {
      if (open) openComposer(groupId)
      else if (isOpen) setComposer(null)
    }}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 px-2 text-xs">
          <CirclePlusIcon data-icon="inline-start" />{label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" collisionPadding={12} className="w-64 max-w-[calc(100vw-2rem)]">
        {renderComposerContent()}
      </DropdownMenuContent>
    </DropdownMenu>
  }

  function renderGroup(group: FilterGroup, isRoot: boolean) {
    const groupConditions = group.conditions.map((condition) => renderConditionToken(condition, group.id))
    return <div key={group.id} className={isRoot ? "flex min-w-0 flex-wrap items-center gap-2" : "flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-dashed bg-muted/20 px-2 py-1.5"}>
      {!isRoot && <span aria-hidden="true" className="font-mono text-sm text-muted-foreground">(</span>}
      <Select value={group.logic} onValueChange={(value) => updateLogic(group.id, value as FilterLogic)}>
        <SelectTrigger aria-label={`${isRoot ? "Query" : "Group"} match logic`} className="h-7 w-24 shrink-0 px-2 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup><SelectItem value="AND">Match all</SelectItem><SelectItem value="OR">Match any</SelectItem></SelectGroup></SelectContent>
      </Select>
      {groupConditions}
      {renderAddCondition(group.id)}
      {!isRoot && <>
        <span aria-hidden="true" className="font-mono text-sm text-muted-foreground">)</span>
        <Button type="button" variant="ghost" size="icon-xs" className="size-7" aria-label="Remove condition group" onClick={() => removeGroup(group.id)}><XIcon /></Button>
      </>}
    </div>
  }

  return <div className="flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-2.5 sm:flex-row sm:items-start sm:p-3">
    <div className="relative min-w-0 shrink-0 sm:w-56">
      <SearchIcon aria-hidden="true" className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input aria-label="Search records" placeholder="Search records…" value={search} onChange={(event) => onSearchChange(event.target.value)} className="h-8 border-transparent bg-muted/40 pl-9 shadow-none focus-visible:border-ring sm:w-full" />
    </div>
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2" aria-label="Filter query">
      {renderGroup(appliedFilters, true)}
      {appliedFilters.groups.map((group) => <div key={group.id} className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{appliedFilters.logic}</span>
        {renderGroup(group, false)}
      </div>)}
      {!appliedFilters.groups.length && <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={addGroup}>Add group</Button>}
    </div>
    {(hasFilters || search.trim()) && <Button type="button" variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={onClear}>
      <FilterXIcon data-icon="inline-start" />Clear all
    </Button>}
  </div>
}
