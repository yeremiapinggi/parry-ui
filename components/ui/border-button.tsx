import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "cn"
import { Button } from "@/components/ui/button"

const borderButtonVariants = cva(
  "relative inline-flex overflow-hidden rounded-lg p-px",
  {
    variants: {
      border: {
        // A conic gradient spins behind the button; only the 1px ring shows.
        beam: "before:absolute before:inset-[-200%] before:bg-[conic-gradient(from_0deg,transparent_0_300deg,var(--ring)_340deg,transparent_360deg)] before:motion-safe:animate-[spin_3s_linear_infinite] bg-border",
        gradient: "bg-linear-to-r from-chart-1 via-chart-3 to-chart-5",
        dashed: "border border-dashed border-ring p-0",
      },
    },
    defaultVariants: {
      border: "beam",
    },
  }
)

function BorderButton({
  border,
  className,
  ...props
}: React.ComponentProps<typeof Button> & VariantProps<typeof borderButtonVariants>) {
  return (
    <span data-slot="border-button" className={borderButtonVariants({ border })}>
      <Button
        variant="outline"
        className={cn("relative border-0 bg-background hover:bg-muted", className)}
        {...props}
      />
    </span>
  )
}

export { BorderButton, borderButtonVariants }
