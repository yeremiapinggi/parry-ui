"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  disabled,
  className,
  calendarProps,
}: {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  // date-fns format string for the trigger label.
  dateFormat?: string
  disabled?: boolean
  className?: string
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect">
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="date-picker"
          variant="outline"
          disabled={disabled}
          data-empty={!date}
          className={cn("w-60 justify-start font-normal data-[empty=true]:text-muted-foreground", className)}
        >
          <CalendarIcon />
          {date ? format(date, dateFormat) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          {...calendarProps}
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            onDateChange?.(next)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
