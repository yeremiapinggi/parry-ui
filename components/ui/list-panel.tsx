import * as React from "react"

import { cn } from "cn"

// Card-framed list with a header row; items take leading media, title, description, meta and a trailing slot.
function ListPanel({
  title,
  action,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { title?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section data-slot="list-panel" className={cn("overflow-hidden rounded-xl border bg-card text-card-foreground", className)} {...props}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {action}
        </header>
      )}
      <ul className="divide-y">{children}</ul>
    </section>
  )
}

function ListPanelItem({
  leading,
  title,
  description,
  meta,
  trailing,
  className,
  ...props
}: Omit<React.ComponentProps<"li">, "title"> & {
  leading?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  meta?: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <li data-slot="list-panel-item" className={cn("flex items-center gap-3 px-4 py-3 text-sm", className)} {...props}>
      {leading && <span className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-4">{leading}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{title}</span>
        {description && <span className="truncate text-muted-foreground">{description}</span>}
      </span>
      {meta && <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{meta}</span>}
      {trailing}
    </li>
  )
}

export { ListPanel, ListPanelItem }
