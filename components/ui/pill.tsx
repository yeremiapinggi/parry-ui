import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react"

import { cn } from "cn"

// Rounded label that composes an avatar, status dot, icon, delta or small action.
function Pill({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pill"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border bg-background px-2.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function PillAvatar({ className, alt = "", ...props }: React.ComponentProps<"img">) {
  // eslint-disable-next-line @next/next/no-img-element -- registry component, must work outside Next.js
  return <img data-slot="pill-avatar" alt={alt} className={cn("-ml-1.5 size-5 rounded-full object-cover", className)} {...props} />
}

const pillIndicatorVariants = cva("relative flex size-2 shrink-0 rounded-full", {
  variants: {
    variant: {
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-destructive",
      info: "bg-info",
    },
  },
  defaultVariants: { variant: "success" },
})

function PillIndicator({
  variant,
  pulse = false,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof pillIndicatorVariants> & { pulse?: boolean }) {
  return (
    <span data-slot="pill-indicator" aria-hidden className={cn(pillIndicatorVariants({ variant }), className)} {...props}>
      {pulse && <span className={cn("absolute inset-0 rounded-full opacity-75 motion-safe:animate-ping", pillIndicatorVariants({ variant }))} />}
    </span>
  )
}

// Up/down/flat arrow for a change value; the sign of `delta` picks the icon and color.
function PillDelta({ delta, className }: { delta: number; className?: string }) {
  const Icon = delta > 0 ? ArrowUpRightIcon : delta < 0 ? ArrowDownRightIcon : MinusIcon
  return (
    <Icon
      data-slot="pill-delta"
      aria-label={delta > 0 ? "up" : delta < 0 ? "down" : "no change"}
      className={cn(delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground", className)}
    />
  )
}

function PillButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="pill-button"
      type="button"
      className={cn(
        "-mr-1 inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

export { Pill, PillAvatar, PillButton, PillDelta, PillIndicator }
