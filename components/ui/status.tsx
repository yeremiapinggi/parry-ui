import * as React from "react"

import { cn } from "cn"

const statuses = {
  online: { label: "Online", dot: "bg-success" },
  degraded: { label: "Degraded", dot: "bg-warning" },
  maintenance: { label: "Maintenance", dot: "bg-info" },
  offline: { label: "Offline", dot: "bg-destructive" },
} as const

type StatusValue = keyof typeof statuses

function Status({
  status,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { status: StatusValue }) {
  const { label, dot } = statuses[status]

  return (
    <span
      data-slot="status"
      data-status={status}
      className={cn("inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium", className)}
      {...props}
    >
      <span className="relative flex size-2">
        {status === "online" && <span className={cn("absolute inset-0 rounded-full opacity-75 motion-safe:animate-ping", dot)} />}
        <span className={cn("relative size-2 rounded-full", dot)} />
      </span>
      {children ?? label}
    </span>
  )
}

export { Status, type StatusValue }
