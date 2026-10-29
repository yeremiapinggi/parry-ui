import * as React from "react"

import { cn } from "cn"

// Grouped list (e.g. tasks by status): each ListGroup has a ListHeader and a run of ListItems.
function List({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="list" className={cn("flex w-full flex-col gap-4", className)} {...props} />
}

function ListGroup({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="list-group" className={cn("flex flex-col overflow-hidden rounded-lg border", className)} {...props} />
}

function ListHeader({
  title,
  count,
  color,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  title: React.ReactNode
  count?: number
  // Any CSS color for the leading dot, e.g. "var(--success)".
  color?: string
}) {
  return (
    <header data-slot="list-header" className={cn("flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-sm", className)} {...props}>
      {color && <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: color }} />}
      <h3 className="font-medium">{title}</h3>
      {count !== undefined && <span className="text-muted-foreground tabular-nums">{count}</span>}
      {children && <div className="ml-auto flex items-center gap-1">{children}</div>}
    </header>
  )
}

function ListItems({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="list-items" className={cn("flex flex-col divide-y", className)} {...props} />
}

function ListItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="list-item" className={cn("flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40", className)} {...props} />
}

export { List, ListGroup, ListHeader, ListItem, ListItems }
