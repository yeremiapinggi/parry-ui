"use client"

import * as React from "react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const HEX = /^#[0-9a-f]{6}$/i

function ColorPicker({
  value,
  onValueChange,
  swatches = [],
  className,
  "aria-label": ariaLabel = "Color",
}: {
  // Six-digit hex, e.g. "#3366e0".
  value: string
  onValueChange: (value: string) => void
  swatches?: string[]
  className?: string
  "aria-label"?: string
}) {
  const [draft, setDraft] = React.useState(value)
  const [lastValue, setLastValue] = React.useState(value)
  // Keep the hex field in sync when the value changes from outside.
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button data-slot="color-picker" variant="outline" aria-label={`${ariaLabel}: ${value}`} className={cn("w-36 justify-start font-mono", className)}>
          <span className="size-4 rounded-sm border" style={{ backgroundColor: value }} />
          {value.toUpperCase()}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-56 flex-col gap-3">
        {/* The native picker gives the full spectrum without a custom canvas. */}
        <input
          type="color"
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="h-24 w-full cursor-pointer rounded-md border bg-transparent"
        />
        {swatches.length > 0 && (
          <div className="grid grid-cols-8 gap-1.5">
            {swatches.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={swatch}
                aria-pressed={swatch.toLowerCase() === value.toLowerCase()}
                onClick={() => onValueChange(swatch)}
                className="aspect-square rounded-sm border outline-none aria-pressed:ring-2 aria-pressed:ring-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        )}
        <Input
          aria-label={`${ariaLabel} hex`}
          value={draft}
          aria-invalid={!HEX.test(draft)}
          onChange={(e) => {
            setDraft(e.target.value)
            if (HEX.test(e.target.value)) onValueChange(e.target.value)
          }}
          className="font-mono"
        />
      </PopoverContent>
    </Popover>
  )
}

export { ColorPicker }
