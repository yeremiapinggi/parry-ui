import * as React from "react"

import { cn } from "cn"

// Brand mark + optional wordmark, as a link home. Pass `mark` (an <img> or inline SVG) and/or `name`.
function Logo({
  mark,
  name,
  href = "/",
  className,
  ...props
}: Omit<React.ComponentProps<"a">, "children"> & {
  mark?: React.ReactNode
  name?: React.ReactNode
}) {
  return (
    <a
      data-slot="logo"
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-heading text-lg font-bold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_img]:size-8 [&_svg]:size-8",
        className
      )}
      {...props}
    >
      {mark}
      {name}
    </a>
  )
}

export { Logo }
