"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "cn"

// Enter or comma adds the typed text as a tag; Backspace on an empty input removes the last one.
function TagsInput({
  value,
  onValueChange,
  placeholder = "Add a tag…",
  className,
  "aria-label": ariaLabel,
}: {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  className?: string
  "aria-label"?: string
}) {
  const [draft, setDraft] = React.useState("")

  const add = () => {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) onValueChange([...value, tag])
    setDraft("")
  }

  return (
    <div
      data-slot="tags-input"
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1.5 text-sm transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className
      )}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-muted py-0.5 pr-1 pl-2 text-xs font-medium">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onValueChange(value.filter((t) => t !== tag))}
            className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <input
        aria-label={ariaLabel}
        value={draft}
        placeholder={value.length ? undefined : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            add()
          } else if (e.key === "Backspace" && !draft && value.length) {
            onValueChange(value.slice(0, -1))
          }
        }}
        className="min-w-20 flex-1 bg-transparent outline-none placeholder:text-placeholder"
      />
    </div>
  )
}

export { TagsInput }
