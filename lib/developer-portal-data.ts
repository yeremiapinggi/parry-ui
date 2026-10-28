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

export type ApiKey = {
  id: string
  name: string
  last4: string
  scopes: Scope[]
  createdAt: string
  lastUsed: string | null
  expiresAt: string | null
  revoked: boolean
}

export type PortalApp = {
  id: string
  name: string
  description: string
  environment: AppEnvironment
  authMethod: AuthMethod
  scopes: Scope[]
  createdAt: string
  clientId: string
  secretLast4: string
  redirectUris: string[]
  keys: ApiKey[]
}

export type AppDraft = Pick<PortalApp, "name" | "description" | "environment" | "authMethod" | "scopes">

export const SEED_APPS: PortalApp[] = [
  {
    id: "33283010",
    name: "sociomile-demo",
    description: "Syncs Sociomile tickets into the internal helpdesk.",
    environment: "Production",
    authMethod: "oauth",
    scopes: [{ product: "sociomile", access: "write" }, { product: "cognivo", access: "read" }],
    createdAt: "2026-06-14",
    clientId: "ivc_3f8a1c92d04b",
    secretLast4: "9xQe",
    redirectUris: ["https://helpdesk.example.com/oauth/callback", "http://localhost:3000/callback"],
    keys: [],
  },
  {
    id: "29507667",
    name: "IvoDevJNE",
    description: "Pulls Ripple10 mentions for the JNE listening report.",
    environment: "Development",
    authMethod: "api-key",
    scopes: [{ product: "ripple10", access: "read" }],
    createdAt: "2026-08-02",
    clientId: "ivc_7b20e6f14a3d",
    secretLast4: "Lk2m",
    redirectUris: [],
    keys: [
      { id: "key-1", name: "Report job", last4: "a1b2", scopes: [{ product: "ripple10", access: "read" }], createdAt: "2026-08-02", lastUsed: "2026-10-27", expiresAt: null, revoked: false },
    ],
  },
  {
    id: "30417937",
    name: "IvosightsDev",
    description: "Sandbox for testing Agentics automations.",
    environment: "Development",
    authMethod: "api-key",
    scopes: [{ product: "agentics", access: "write" }, { product: "sociomile", access: "read" }],
    createdAt: "2026-09-21",
    clientId: "ivc_c51d9e0a8f27",
    secretLast4: "Tz7w",
    redirectUris: [],
    keys: [
      { id: "key-2", name: "Automation runner", last4: "f9c3", scopes: [{ product: "agentics", access: "write" }], createdAt: "2026-09-21", lastUsed: "2026-10-26", expiresAt: "2026-12-20", revoked: false },
      { id: "key-3", name: "Ticket reader", last4: "07de", scopes: [{ product: "sociomile", access: "read" }], createdAt: "2026-09-30", lastUsed: null, expiresAt: null, revoked: false },
    ],
  },
]

export function hasScope(scopes: Scope[], product: ProductKey, access: ScopeAccess) {
  const scope = scopes.find((item) => item.product === product)
  return Boolean(scope) && (access === "read" || scope?.access === "write")
}

// One entry per product; write implies read, so unchecking read removes the product entirely.
export function toggleScope(scopes: Scope[], product: ProductKey, access: ScopeAccess, checked: boolean): Scope[] {
  const others = scopes.filter((item) => item.product !== product)
  const current = scopes.find((item) => item.product === product)
  let next: ScopeAccess | null
  if (checked) next = access === "write" ? "write" : current?.access ?? "read"
  else next = access === "write" && current ? "read" : null
  const ordered = next ? [...others, { product, access: next }] : others
  return PRODUCTS.flatMap(({ key }) => ordered.filter((item) => item.product === key))
}

export function formatScope({ product, access }: Scope) {
  return `${product}:${access}`
}

export type AppDraftErrors = Partial<Record<"name" | "scopes", string>>

export function validateAppDraft(draft: AppDraft, apps: PortalApp[], editingId: string | null): AppDraftErrors {
  const errors: AppDraftErrors = {}
  const name = draft.name.trim()
  if (!name) errors.name = "Enter an app name."
  else if (apps.some((app) => app.id !== editingId && app.name.toLowerCase() === name.toLowerCase())) errors.name = "An app with this name already exists."
  if (!draft.scopes.length) errors.scopes = "Select at least one scope."
  return errors
}

// Runs only from event handlers (never during render), so randomness is safe here.
export function randomToken(length: number) {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), (byte) => alphabet[byte % alphabet.length]).join("")
}

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
