export const PORTAL_END_DATE = "2026-10-27"
export const PORTAL_DAY_COUNT = 90

export const PRODUCTS = [
  { key: "cognivo", name: "Cognivo" },
  { key: "sociomile", name: "Sociomile" },
  { key: "ripple10", name: "Ripple10" },
  { key: "agentics", name: "Agentics" },
] as const

export type ProductKey = (typeof PRODUCTS)[number]["key"]
export type ScopeAccess = "read" | "write"
export type Scope = { product: ProductKey; access: ScopeAccess }
export type AuthMethod = "oauth" | "api-key"
export type AppEnvironment = "Development" | "Production"

export type PortalApp = {
  id: string
  name: string
  description: string
  environment: AppEnvironment
  authMethod: AuthMethod
  scopes: Scope[]
  createdAt: string
}

export const SEED_APPS: PortalApp[] = [
  {
    id: "33283010",
    name: "sociomile-demo",
    description: "Syncs Sociomile tickets into the internal helpdesk.",
    environment: "Production",
    authMethod: "oauth",
    scopes: [{ product: "sociomile", access: "write" }, { product: "cognivo", access: "read" }],
    createdAt: "2026-06-14",
  },
  {
    id: "29507667",
    name: "IvoDevJNE",
    description: "Pulls Ripple10 mentions for the JNE listening report.",
    environment: "Development",
    authMethod: "api-key",
    scopes: [{ product: "ripple10", access: "read" }],
    createdAt: "2026-08-02",
  },
  {
    id: "30417937",
    name: "IvosightsDev",
    description: "Sandbox for testing Agentics automations.",
    environment: "Development",
    authMethod: "api-key",
    scopes: [{ product: "agentics", access: "write" }, { product: "sociomile", access: "read" }],
    createdAt: "2026-09-21",
  },
]

export type UsageDay = {
  date: string
  label: string
  success: number
  errors: number
  p95Ms: number
}

function addDays(iso: string, amount: number) {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

// Deterministic so server and client renders match.
export const USAGE_DAYS: UsageDay[] = Array.from({ length: PORTAL_DAY_COUNT }, (_, index) => {
  const date = addDays(PORTAL_END_DATE, index - (PORTAL_DAY_COUNT - 1))
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  const weekend = weekday === 0 || weekday === 6
  const requests = Math.round((weekend ? 5200 : 8400) + index * 38 + Math.sin(index / 6) * 900)
  const errors = Math.round(requests * (0.012 + Math.max(0, Math.sin(index / 9)) * 0.018))
  return {
    date,
    label: dayLabel.format(new Date(`${date}T00:00:00Z`)),
    success: requests - errors,
    errors,
    p95Ms: Math.round(210 + Math.cos(index / 7) * 35),
  }
})

export function summarizeUsage(days: UsageDay[]) {
  const errors = days.reduce((sum, day) => sum + day.errors, 0)
  const requests = days.reduce((sum, day) => sum + day.success + day.errors, 0)
  return { requests, errors, errorRate: requests ? errors / requests : 0 }
}
