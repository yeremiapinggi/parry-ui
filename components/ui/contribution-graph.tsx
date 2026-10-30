import * as React from "react"

import { cn } from "cn"

type ContributionDay = { date: string; count: number }

const DAY = 86_400_000
// The chart ramp runs light → dark, so dark mode reverses it to keep "more" the highest-contrast shade.
const levelClass = [
  "bg-muted",
  "bg-chart-1 dark:bg-chart-4",
  "bg-chart-2 dark:bg-chart-3",
  "bg-chart-3 dark:bg-chart-2",
  "bg-chart-4 dark:bg-chart-1",
]

// GitHub-style activity grid: one column per week (Sunday first), cell shade by count.
// Dates are "YYYY-MM-DD" and handled in UTC so the grid doesn't shift with the viewer's time zone.
function ContributionGraph({
  data,
  cellSize = 12,
  showLegend = true,
  label = "activities",
  className,
}: {
  data: ContributionDay[]
  cellSize?: number
  showLegend?: boolean
  label?: string
  className?: string
}) {
  if (data.length === 0) return null
  const counts = new Map(data.map((d) => [d.date, d.count]))
  const times = data.map((d) => Date.parse(`${d.date}T00:00:00Z`))
  const first = Math.min(...times)
  const last = Math.max(...times)
  const start = first - new Date(first).getUTCDay() * DAY
  const weeks = Math.ceil((last - start + DAY) / (7 * DAY))
  const max = Math.max(...data.map((d) => d.count), 1)
  const level = (count: number) => (count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4)))
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <figure data-slot="contribution-graph" className={cn("flex flex-col gap-2", className)}>
      <div
        role="img"
        aria-label={`${total} ${label} from ${new Date(first).toISOString().slice(0, 10)} to ${new Date(last).toISOString().slice(0, 10)}`}
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateRows: `repeat(7, ${cellSize}px)`, gridAutoColumns: `${cellSize}px` }}
      >
        {Array.from({ length: weeks * 7 }, (_, i) => {
          const time = start + i * DAY
          if (time < first || time > last) return <span key={i} />
          const date = new Date(time).toISOString().slice(0, 10)
          const count = counts.get(date) ?? 0
          return <span key={i} title={`${count} ${label} on ${date}`} className={cn("rounded-[3px]", levelClass[level(count)])} />
        })}
      </div>
      {showLegend && (
        <figcaption className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
          Less
          {levelClass.map((cls) => (
            <span key={cls} aria-hidden className={cn("rounded-[3px]", cls)} style={{ width: cellSize, height: cellSize }} />
          ))}
          More
        </figcaption>
      )}
    </figure>
  )
}

export { ContributionGraph, type ContributionDay }
