import type {
  EnterpriseRecord,
  FilterCondition,
  FilterField,
  FilterGroup,
  FilterOperator,
  FilterLogic,
  SortConfiguration,
} from "@/lib/advanced-filterable-table-data"

let nextFilterId = 0

export function createEmptyCondition(): FilterCondition {
  return { id: `filter-condition-${++nextFilterId}`, field: "status", operator: "is", value: "" }
}

export function createEmptyGroup(id = `filter-group-${++nextFilterId}`): FilterGroup {
  return { id, logic: "AND", conditions: [createEmptyCondition()], groups: [] }
}

export function cloneFilterGroup(group: FilterGroup): FilterGroup {
  return {
    ...group,
    conditions: group.conditions.map((condition) => ({ ...condition, values: condition.values ? [...condition.values] : undefined })),
    groups: group.groups.map(cloneFilterGroup),
  }
}

export function fieldType(field: FilterField): "text" | "enum" | "date" {
  if (field === "createdAt" || field === "updatedAt") return "date"
  if (field === "channel" || field === "status" || field === "priority" || field === "owner") return "enum"
  return "text"
}

export function operatorsForField(field: FilterField): FilterOperator[] {
  const type = fieldType(field)
  if (type === "text") return ["contains", "not_contains", "equals", "not_equals"]
  if (type === "enum") return ["is", "is_not", "is_any_of"]
  return ["before", "after", "between"]
}

export const operatorLabels: Record<FilterOperator, string> = {
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

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function validateCondition(condition: FilterCondition): string | null {
  const fieldKind = fieldType(condition.field)
  if (fieldKind === "enum" && condition.operator === "is_any_of") {
    return condition.values?.length ? null : "Choose at least one value."
  }
  if (fieldKind === "date") {
    if (!isValidDate(condition.value)) return "Choose a valid date."
    if (condition.operator === "between") {
      if (!isValidDate(condition.secondValue ?? "")) return "Choose an end date."
      if (condition.value > (condition.secondValue ?? "")) return "The end date must be on or after the start date."
    }
    return null
  }
  return condition.value.trim() ? null : "Enter a value for this condition."
}

export function validateFilterGroup(group: FilterGroup): string | null {
  for (const condition of group.conditions) {
    const error = validateCondition(condition)
    if (error) return error
  }
  for (const nested of group.groups) {
    if (nested.conditions.length === 0 && nested.groups.length === 0) continue
    const error = validateFilterGroup(nested)
    if (error) return error
  }
  return null
}

function conditionMatches(record: EnterpriseRecord, condition: FilterCondition) {
  const candidate = String(record[condition.field] ?? "")
  const value = condition.value
  switch (condition.operator) {
    case "contains": return candidate.toLocaleLowerCase().includes(value.trim().toLocaleLowerCase())
    case "not_contains": return !candidate.toLocaleLowerCase().includes(value.trim().toLocaleLowerCase())
    case "equals": return candidate.toLocaleLowerCase() === value.trim().toLocaleLowerCase()
    case "not_equals": return candidate.toLocaleLowerCase() !== value.trim().toLocaleLowerCase()
    case "is": return candidate === value
    case "is_not": return candidate !== value
    case "is_any_of": return (condition.values ?? []).includes(candidate)
    case "before": return candidate < value
    case "after": return candidate > value
    case "between": return candidate >= value && candidate <= (condition.secondValue ?? "")
  }
}

export function recordMatchesGroup(record: EnterpriseRecord, group: FilterGroup): boolean {
  const conditionNodes = group.conditions.map((condition) => () => conditionMatches(record, condition))
  const nestedNodes = group.groups
    .filter((nested) => nested.conditions.length > 0 || nested.groups.length > 0)
    .map((nested) => () => recordMatchesGroup(record, nested))
  const nodes = [...conditionNodes, ...nestedNodes]
  if (nodes.length === 0) return true
  return group.logic === "AND" ? nodes.every((matches) => matches()) : nodes.some((matches) => matches())
}

export function sortRecords(records: EnterpriseRecord[], sort: SortConfiguration): EnterpriseRecord[] {
  if (!sort.key) return [...records]
  const multiplier = sort.direction === "asc" ? 1 : -1
  return [...records].sort((first, second) => {
    const comparison = String(first[sort.key!] ?? "").localeCompare(String(second[sort.key!] ?? ""), undefined, { numeric: true, sensitivity: "base" })
    return comparison === 0 ? first.id.localeCompare(second.id) : comparison * multiplier
  })
}

export function updateConditionInGroup(group: FilterGroup, conditionId: string, update: (condition: FilterCondition) => FilterCondition): FilterGroup {
  return {
    ...group,
    conditions: group.conditions.map((condition) => condition.id === conditionId ? update(condition) : condition),
    groups: group.groups.map((nested) => updateConditionInGroup(nested, conditionId, update)),
  }
}

export function removeConditionFromGroup(group: FilterGroup, conditionId: string): FilterGroup {
  return {
    ...group,
    conditions: group.conditions.filter((condition) => condition.id !== conditionId),
    groups: group.groups.map((nested) => removeConditionFromGroup(nested, conditionId)),
  }
}

export function removeGroupFromGroup(group: FilterGroup, groupId: string): FilterGroup {
  return {
    ...group,
    conditions: [...group.conditions],
    groups: group.groups.filter((nested) => nested.id !== groupId).map((nested) => removeGroupFromGroup(nested, groupId)),
  }
}

export function flattenConditions(group: FilterGroup): { condition: FilterCondition; groupId: string; logic: FilterLogic }[] {
  return [
    ...group.conditions.map((condition) => ({ condition, groupId: group.id, logic: group.logic })),
    ...group.groups.flatMap(flattenConditions),
  ]
}
