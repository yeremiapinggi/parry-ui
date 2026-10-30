import * as React from "react"

import { cn } from "cn"
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"

// AvatarGroup that caps the visible avatars at `max` (the rest become a +N count) and can fan out on hover.
function AvatarStack({
  max,
  spreadOnHover = false,
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  max?: number
  spreadOnHover?: boolean
  label?: React.ReactNode
}) {
  const avatars = React.Children.toArray(children)
  const shown = max ? avatars.slice(0, max) : avatars
  const hidden = avatars.length - shown.length

  return (
    <div data-slot="avatar-stack" className={cn("inline-flex items-center gap-2", className)} {...props}>
      <AvatarGroup
        className={cn(
          spreadOnHover && "*:transition-[margin] motion-safe:hover:space-x-1"
        )}
      >
        {shown}
        {hidden > 0 && <AvatarGroupCount aria-label={`${hidden} more`}>+{hidden}</AvatarGroupCount>}
      </AvatarGroup>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

export { AvatarStack }
