"use client"

import * as React from "react"
import { addDays, format, isSameDay, startOfDay } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"

// A compact strip of consecutive days with prev/next paging.
function MiniCalendar({
  value,
  onValueChange,
  defaultStartDate,
  days = 5,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  value?: Date
  onValueChange?: (date: Date) => void
  defaultStartDate?: Date
  days?: number
}) {
  const [start, setStart] = React.useState(() => startOfDay(defaultStartDate ?? value ?? new Date()))
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i))

  return (
    <div data-slot="mini-calendar" role="group" className={cn("inline-flex items-center gap-1 rounded-lg border bg-background p-1", className)} {...props}>
      <Button variant="ghost" size="icon-sm" aria-label="Previous days" onClick={() => setStart(addDays(start, -days))}>
        <ChevronLeftIcon />
      </Button>
      {dates.map((date) => {
        const selected = value ? isSameDay(date, value) : false
        return (
          <button
            key={date.toISOString()}
            type="button"
            aria-pressed={selected}
            aria-label={format(date, "EEEE, d MMMM yyyy")}
            onClick={() => onValueChange?.(date)}
            className={cn(
              "flex w-10 flex-col items-center gap-0.5 rounded-md py-1.5 text-xs outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
              selected && "bg-primary text-primary-foreground hover:bg-primary-hover"
            )}
          >
            <span className={cn("text-muted-foreground", selected && "text-primary-foreground/80")}>{format(date, "EEE")}</span>
            <span className="text-sm font-medium tabular-nums">{format(date, "d")}</span>
          </button>
        )
      })}
      <Button variant="ghost" size="icon-sm" aria-label="Next days" onClick={() => setStart(addDays(start, days))}>
        <ChevronRightIcon />
      </Button>
    </div>
  )
}

export { MiniCalendar }
