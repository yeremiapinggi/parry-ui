"use client"

import * as React from "react"

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
]

function formatRelative(date: Date, now: number, locale: string) {
  const seconds = Math.round((date.getTime() - now) / 1000)
  const [unit, size] = units.find(([, s]) => Math.abs(seconds) >= s) ?? ["second", 1]
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(seconds / size), unit)
}

// "3 minutes ago", refreshed every minute. The current time is read after mount (it can't be read while
// prerendering), so the first paint shows the absolute date. Pass `now` to pin it, e.g. in demos and tests.
function RelativeTime({
  date,
  now: nowProp,
  locale = "en",
  className,
}: {
  date: Date | string
  now?: Date
  locale?: string
  className?: string
}) {
  const value = typeof date === "string" ? new Date(date) : date
  const [clock, setClock] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (nowProp) return
    const tick = () => setClock(Date.now())
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [nowProp])

  const now = nowProp?.getTime() ?? clock
  const absolute = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(value)

  return (
    <time data-slot="relative-time" dateTime={value.toISOString()} title={absolute} className={className}>
      {now === null ? absolute : formatRelative(value, now, locale)}
    </time>
  )
}

export { RelativeTime, formatRelative }
