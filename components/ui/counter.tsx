"use client"

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"

// Quantity stepper: −/+ buttons around a value, clamped to [min, max].
function Counter({
  value,
  onValueChange,
  min = 0,
  max = Infinity,
  step = 1,
  className,
  "aria-label": ariaLabel = "Quantity",
}: {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  "aria-label"?: string
}) {
  const set = (next: number) => onValueChange(Math.min(max, Math.max(min, next)))

  return (
    <div data-slot="counter" role="group" aria-label={ariaLabel} className={cn("inline-flex items-center rounded-lg border", className)}>
      <Button variant="ghost" size="icon-sm" aria-label="Decrease" disabled={value <= min} onClick={() => set(value - step)}>
        <MinusIcon />
      </Button>
      <output aria-live="polite" className="min-w-10 text-center text-sm font-medium tabular-nums">
        {value}
      </output>
      <Button variant="ghost" size="icon-sm" aria-label="Increase" disabled={value >= max} onClick={() => set(value + step)}>
        <PlusIcon />
      </Button>
    </div>
  )
}

export { Counter }
