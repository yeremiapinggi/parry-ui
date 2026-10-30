"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "cn"

type StepperStep = { title: string; description?: string }

const stateLabel = { complete: "completed", current: "current step", upcoming: "upcoming" }

// Numbered progress through steps. Steps before `value` count as done; with onValueChange they become clickable.
function Stepper({
  steps,
  value,
  onValueChange,
  orientation = "horizontal",
  className,
  "aria-label": ariaLabel = "Progress",
}: {
  steps: StepperStep[]
  value: number
  onValueChange?: (index: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
  "aria-label"?: string
}) {
  return (
    <nav aria-label={ariaLabel} data-slot="stepper" data-orientation={orientation} className={className}>
      <ol className={cn("flex", orientation === "vertical" ? "flex-col gap-1" : "items-start gap-2")}>
        {steps.map((step, i) => {
          const state = i < value ? "complete" : i === value ? "current" : "upcoming"
          const clickable = onValueChange && i <= value
          const Indicator = clickable ? "button" : "span"
          return (
            <li
              key={step.title}
              data-state={state}
              className={cn("group/step relative flex flex-1 gap-2", orientation === "horizontal" ? "flex-col items-center text-center" : "items-start pb-4 last:pb-0")}
            >
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute bg-border group-data-[state=complete]/step:bg-primary",
                    orientation === "horizontal" ? "top-4 left-[calc(50%+1.25rem)] h-px w-[calc(100%-2.5rem+0.5rem)]" : "top-9 bottom-1 left-4 w-px"
                  )}
                />
              )}
              <Indicator
                {...(clickable ? { type: "button" as const, onClick: () => onValueChange(i), "aria-label": `${step.title}, ${stateLabel[state]}` } : { "aria-hidden": true })}
                aria-current={clickable && state === "current" ? "step" : undefined}
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  state === "complete" && "border-primary bg-primary text-primary-foreground",
                  state === "current" && "border-primary bg-background text-foreground ring-2 ring-primary/20",
                  state === "upcoming" && "bg-muted text-muted-foreground"
                )}
              >
                {state === "complete" ? <CheckIcon className="size-4" /> : i + 1}
              </Indicator>
              {/* Clickable steps are named by their button; otherwise the text below carries the name and state. */}
              <span
                className="flex min-w-0 flex-col gap-0.5"
                aria-hidden={clickable || undefined}
                aria-current={!clickable && state === "current" ? "step" : undefined}
              >
                <span className={cn("text-sm font-medium", state === "upcoming" && "text-muted-foreground")}>
                  {step.title}
                  <span className="sr-only">, {stateLabel[state]}</span>
                </span>
                {step.description && <span className="text-xs text-muted-foreground">{step.description}</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Stepper, type StepperStep }
