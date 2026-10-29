import * as React from "react"
import { encode } from "uqr"

import { cn } from "cn"

// QR code as an SVG path. Modules are always black on white, whatever the theme, so phones can scan it.
function QRCode({
  value,
  ecc = "M",
  label,
  className,
}: {
  value: string
  // Error correction: L ~7%, M ~15%, Q ~25%, H ~30% of the code can be damaged and still scan.
  ecc?: "L" | "M" | "Q" | "H"
  label?: string
  className?: string
}) {
  const { data } = encode(value, { ecc, border: 2 })
  const size = data.length
  const path = data
    .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : "")))
    .join("")

  return (
    <svg
      data-slot="qr-code"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `QR code for ${value}`}
      shapeRendering="crispEdges"
      className={cn("size-32 rounded-md bg-white", className)}
    >
      <path d={path} fill="#000" />
    </svg>
  )
}

export { QRCode }
