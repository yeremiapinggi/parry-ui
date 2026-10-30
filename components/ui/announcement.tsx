import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "cn"

// Pill for "what's new" links; use asChild to render it as a Link.
function Announcement({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="announcement"
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border bg-background py-0.5 pr-3 pl-0.5 text-sm shadow-xs transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function AnnouncementTag({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="announcement-tag"
      className={cn("shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground", className)}
      {...props}
    />
  )
}

function AnnouncementTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="announcement-title" className={cn("flex min-w-0 items-center gap-1 truncate", className)} {...props} />
}

export { Announcement, AnnouncementTag, AnnouncementTitle }
