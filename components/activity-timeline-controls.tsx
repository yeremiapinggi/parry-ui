import { useId, type FormEvent } from "react"
import { FilterIcon, RotateCcwIcon, SearchIcon, SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { activityActors, activityTypeLabels, activityTypes, type ActivityType } from "@/lib/activity-timeline-data"

export type ActivityDateRange = "today" | "7d" | "30d" | "all"
export type ActivitySort = "newest" | "oldest"
export type TimelineFilterState = {
  search: string
  types: ActivityType[]
  actorId: string
  dateRange: ActivityDateRange
  sort: ActivitySort
}

type TimelineFiltersProps = {
  filters: TimelineFilterState
  onChange: (next: TimelineFilterState) => void
  onReset: () => void
}

export function TimelineFilters({ filters, onChange, onReset }: TimelineFiltersProps) {
  function toggleType(type: ActivityType, selected: boolean) {
    const nextTypes = selected
      ? [...new Set([...filters.types, type])]
      : filters.types.filter((current) => current !== type)
    onChange({ ...filters, types: nextTypes })
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Activity timeline filters">
      <label className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border bg-background px-2.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 sm:max-w-xs">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          controlSize="sm"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.currentTarget.value })}
          placeholder="Search activities"
          aria-label="Search activities"
          className="h-8 min-w-0 border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
      </label>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" controlSize="sm" variant="outline" aria-label={`Filter by activity type${filters.types.length ? `, ${filters.types.length} selected` : ""}`}>
            <FilterIcon data-icon="inline-start" />
            Activity type{filters.types.length > 0 && <span className="rounded-full bg-muted px-1.5 text-[10px]">{filters.types.length}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent widthMode="custom" align="start" className="w-72">
          <PopoverHeader>
            <PopoverTitle>Activity types</PopoverTitle>
            <p className="text-xs text-muted-foreground">Select one or more events to include.</p>
          </PopoverHeader>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {activityTypes.map((type) => {
              const id = `activity-filter-${type}`
              return (
                <label key={type} htmlFor={id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <Checkbox id={id} checked={filters.types.includes(type)} onCheckedChange={(checked) => toggleType(type, checked === true)} />
                  <span>{activityTypeLabels[type]}</span>
                </label>
              )
            })}
          </div>
          {filters.types.length > 0 && (
            <Button type="button" variant="ghost" size="sm" className="w-full justify-start" onClick={() => onChange({ ...filters, types: [] })}>Clear activity types</Button>
          )}
        </PopoverContent>
      </Popover>

      <Select value={filters.actorId} onValueChange={(actorId) => onChange({ ...filters, actorId })}>
        <SelectTrigger size="sm" aria-label="Filter by actor"><SelectValue placeholder="All actors" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All actors</SelectItem>
            {activityActors.map((actor) => <SelectItem key={actor.id} value={actor.id}>{actor.name}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={filters.dateRange} onValueChange={(dateRange) => onChange({ ...filters, dateRange: dateRange as ActivityDateRange })}>
        <SelectTrigger size="sm" aria-label="Filter by date range"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Past 7 days</SelectItem>
            <SelectItem value="30d">Past 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={filters.sort} onValueChange={(sort) => onChange({ ...filters, sort: sort as ActivitySort })}>
        <SelectTrigger size="sm" aria-label="Sort activities"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button type="button" size="sm" variant="ghost" onClick={onReset}>
        <RotateCcwIcon data-icon="inline-start" />
        Reset filters
      </Button>
    </div>
  )
}

type ActivityCommentComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}

export function ActivityCommentComposer({ value, onChange, onSubmit }: ActivityCommentComposerProps) {
  const inputId = useId()
  const canSubmit = value.trim().length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSubmit) onSubmit(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" aria-label="Add an activity comment">
      <FieldGroup className="gap-2">
        <Field className="gap-1.5">
          <FieldLabel htmlFor={inputId}>Add a comment</FieldLabel>
          <Textarea
            id={inputId}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value.slice(0, 400))}
            placeholder="Share a note with the account team…"
            maxLength={400}
            rows={2}
            className="min-h-16 resize-y text-sm"
          />
        </Field>
      </FieldGroup>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{value.length}/400 characters</span>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          <SendIcon data-icon="inline-start" />
          Add comment
        </Button>
      </div>
    </form>
  )
}
