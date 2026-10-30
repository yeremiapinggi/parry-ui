"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"

const bannerVariants = cva(
  "flex w-full items-center gap-3 px-4 py-2 text-sm [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        info: "bg-info-soft text-info",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        destructive: "bg-destructive-soft text-destructive",
      },
      inset: {
        true: "rounded-lg",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      inset: false,
    },
  }
)

// Page-level message strip. Pass `open` + `onOpenChange` to control dismissal, or leave both out.
function Banner({
  variant,
  inset,
  open: openProp,
  onOpenChange,
  dismissible = true,
  action,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    dismissible?: boolean
    action?: React.ReactNode
  }) {
  const [openState, setOpenState] = React.useState(true)
  const open = openProp ?? openState

  if (!open) return null

  return (
    <div data-slot="banner" role="status" className={cn(bannerVariants({ variant, inset }), className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">{children}</div>
      {action}
      {dismissible && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Dismiss"
          className="text-current hover:bg-current/10 hover:text-current"
          onClick={() => {
            setOpenState(false)
            onOpenChange?.(false)
          }}
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}

export { Banner, bannerVariants }
