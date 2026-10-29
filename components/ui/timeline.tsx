import * as React from "react"

import { cn } from "cn"

// Vertical activity feed; each item gets a dot (or icon) on a connecting line.
function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="timeline" className={cn("flex flex-col", className)} {...props} />
}

function TimelineItem({
  title,
  time,
  icon,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"li">, "title"> & {
  title: React.ReactNode
  time?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <li data-slot="timeline-item" className={cn("group/timeline relative flex gap-3 pb-5 last:pb-0", className)} {...props}>
      <span aria-hidden className="absolute top-6 bottom-0 left-3 w-px -translate-x-1/2 bg-border group-last/timeline:hidden" />
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground [&_svg]:size-3.5">
        {icon ?? <span className="size-2 rounded-full bg-primary" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="font-medium">{title}</span>
          {time && <span className="text-xs text-muted-foreground">{time}</span>}
        </div>
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </li>
  )
}

export { Timeline, TimelineItem }
