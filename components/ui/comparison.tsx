"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"

import { cn } from "cn"

// Before/after slider. A native range input sits on top, so mouse, touch and arrow keys all move the divider.
function Comparison({
  before,
  after,
  defaultPosition = 50,
  label = "Comparison position",
  className,
}: {
  before: React.ReactNode
  after: React.ReactNode
  defaultPosition?: number
  label?: string
  className?: string
}) {
  const [position, setPosition] = React.useState(defaultPosition)

  return (
    <div data-slot="comparison" className={cn("relative isolate overflow-hidden rounded-lg border select-none has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50", className)}>
      <div className="[&>*]:size-full">{before}</div>
      <div className="absolute inset-0 [&>*]:size-full" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        {after}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-background shadow" style={{ left: `${position}%` }}>
        <span className="absolute top-1/2 left-1/2 flex size-7 -translate-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
          <GripVerticalIcon className="size-4" />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        aria-label={label}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}

export { Comparison }
