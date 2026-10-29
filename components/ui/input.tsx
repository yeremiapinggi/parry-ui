import * as React from "react"
import { cn } from "cn"
import { controlSizeClasses, type ControlSize } from "@/components/ui/control-size"

type InputProps = React.ComponentProps<"input"> & {
  controlSize?: ControlSize
}

function Input({ className, type, controlSize = "md", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-control-size={controlSize}
      className={cn(
        "w-full min-w-0 border border-input bg-card py-1 text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-placeholder focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        controlSizeClasses[controlSize],
        className
      )}
      {...props}
    />
  )
}

export { Input }
