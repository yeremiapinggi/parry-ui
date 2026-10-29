"use client"

import * as React from "react"

import { cn } from "cn"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Card-style radio options: a RadioGroup whose items carry a title and optional description.
function Choicebox({ className, ...props }: React.ComponentProps<typeof RadioGroup>) {
  return <RadioGroup data-slot="choicebox" className={cn("grid gap-2", className)} {...props} />
}

function ChoiceboxItem({
  value,
  title,
  description,
  disabled,
  className,
}: {
  value: string
  title: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
}) {
  const id = React.useId()

  return (
    <label
      htmlFor={id}
      data-slot="choicebox-item"
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-muted/50 has-data-[state=checked]:border-ring has-data-[state=checked]:bg-info-soft/40 has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
      )}
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        {description && <span className="text-muted-foreground">{description}</span>}
      </span>
      <RadioGroupItem id={id} value={value} disabled={disabled} className="mt-0.5" />
    </label>
  )
}

export { Choicebox, ChoiceboxItem }
