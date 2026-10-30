// Time helpers for the sample data. "Now" is pinned so relative labels stay deterministic (and match on server and
// client); everything renders in Asia/Jakarta.
export const DEMO_NOW = new Date("2026-09-24T17:15:00+07:00")
const TZ = "Asia/Jakarta"
const loadedAt = Date.now()

// Demo clock that starts at DEMO_NOW and runs from page load, for messages sent during the session.
export const demoNowIso = () => new Date(DEMO_NOW.getTime() + (Date.now() - loadedAt)).toISOString()

// Sort comparator for items with an ISO `at`; parses instead of comparing strings, since offsets differ (Z vs +07:00).
export const byTime = (a: { at: string }, b: { at: string }) => Date.parse(a.at) - Date.parse(b.at)

const minutesAgo = (iso: string) => Math.max(0, Math.floor((DEMO_NOW.getTime() - new Date(iso).getTime()) / 60000))

export function relativeTime(iso: string) {
  const m = minutesAgo(iso)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  if (m < 60 * 24) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

// Elapsed time since `iso`, e.g. "2h 14m" or "1d 7h".
export function age(iso: string) {
  const m = minutesAgo(iso)
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.floor(m / 60)}h ${m % 60}m`
  return `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h`
}

const fmt = (locale: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: TZ, ...options })
const full = fmt("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
const short = fmt("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
const clockFmt = fmt("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
const dayFmt = fmt("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" })
const longDay = fmt("en-GB", { day: "numeric", month: "long", year: "numeric" })

export const fullTime = (iso: string) => full.format(new Date(iso)) // 24 September 2026 at 17:04:46
export const shortDateTime = (iso: string) => short.format(new Date(iso)) // Sep 24, 2026, 17:04
export const clock = (iso: string) => clockFmt.format(new Date(iso)) // 17:04
export const dayKey = (iso: string) => dayFmt.format(new Date(iso)) // 2026-09-24

export function dayLabel(iso: string) {
  const key = dayKey(iso)
  if (key === dayKey(DEMO_NOW.toISOString())) return "Today"
  if (key === dayKey(new Date(DEMO_NOW.getTime() - 86400000).toISOString())) return "Yesterday"
  return longDay.format(new Date(iso))
}
