import * as React from "react"

import { cn } from "cn"

// Tiny inline trend chart drawn as plain SVG; it takes the text color, so set it with a text-* class.
function Sparkline({
  data,
  variant = "line",
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "children"> & {
  data: number[]
  variant?: "line" | "area" | "bar"
}) {
  const width = 100
  const height = 30
  const min = Math.min(...data)
  const range = Math.max(...data) - min || 1
  const y = (v: number) => height - 2 - ((v - min) / range) * (height - 4)
  const step = data.length > 1 ? width / (data.length - 1) : 0
  const points = data.map((v, i) => `${(i * step).toFixed(2)},${y(v).toFixed(2)}`).join(" ")

  return (
    <svg
      data-slot="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      className={cn("h-8 w-24 overflow-visible", className)}
      {...props}
    >
      {variant === "bar" ? (
        data.map((v, i) => {
          const barWidth = (width / data.length) * 0.7
          const x = (width / data.length) * i + (width / data.length - barWidth) / 2
          return <rect key={i} x={x} y={y(v)} width={barWidth} height={height - y(v)} rx={1} fill="currentColor" />
        })
      ) : (
        <>
          {variant === "area" && <polygon points={`0,${height} ${points} ${width},${height}`} fill="currentColor" opacity={0.15} />}
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  )
}

export { Sparkline }
