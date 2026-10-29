export type AppEnvironment = "Development" | "Production"

export type DeveloperApp = {
  id: string
  name: string
  environment: AppEnvironment
  clientId: string
  clientSecret: string
  redirectUris: string[]
  createdAt: string
}

export type WebhookEndpoint = {
  id: string
  appId: string
  url: string
  events: string[]
  enabled: boolean
  lastDeliveryAt: string
  lastDeliveryStatus: "Success" | "Failed" | "Pending"
  lastDeliveryError?: string
}

export type RequestLog = {
  id: string
  timestamp: string
  appId: string
  method: "GET" | "POST" | "PATCH" | "DELETE"
  endpoint: string
  status: number
  responseTimeMs: number
  requestId: string
  requestBody: Record<string, unknown>
  responseBody: Record<string, unknown>
}

export type UsageFact = {
  date: string
  appId: string
  endpoint: string
  requests: number
  success: number
  clientErrors: number
  serverErrors: number
}

export const initialDeveloperApps: DeveloperApp[] = [
  {
    id: "app_8f31a2",
    name: "Northstar Web",
    environment: "Production",
    clientId: "demo_client_northstar_8f31a2",
    clientSecret: "demo_secret_northstar_5c1d9e7a",
    redirectUris: ["https://northstar.example.com/auth/callback", "https://app.northstar.example.com/oauth/return"],
    createdAt: "2026-04-12",
  },
  {
    id: "app_41bc09",
    name: "Mobile SDK",
    environment: "Development",
    clientId: "demo_client_mobile_41bc09",
    clientSecret: "demo_secret_mobile_7b4f12c8",
    redirectUris: ["http://localhost:3000/callback"],
    createdAt: "2026-06-28",
  },
  {
    id: "app_763d10",
    name: "Partner Sandbox",
    environment: "Development",
    clientId: "demo_client_partner_763d10",
    clientSecret: "demo_secret_partner_2a8e51f3",
    redirectUris: ["https://partners.example.dev/oauth/callback"],
    createdAt: "2026-09-03",
  },
]

export const availableWebhookEvents = [
  "user.created",
  "user.updated",
  "payment.succeeded",
  "payment.failed",
  "invoice.created",
  "app.key_rotated",
]

export const initialWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_2048a",
    appId: "app_8f31a2",
    url: "https://northstar.example.com/hooks/events",
    events: ["user.created", "payment.succeeded", "payment.failed"],
    enabled: true,
    lastDeliveryAt: "2026-10-29T09:42:00.000Z",
    lastDeliveryStatus: "Success",
  },
  {
    id: "wh_87bc1",
    appId: "app_41bc09",
    url: "https://api.example.dev/webhooks/platform",
    events: ["user.updated", "invoice.created"],
    enabled: false,
    lastDeliveryAt: "2026-10-28T15:18:00.000Z",
    lastDeliveryStatus: "Failed",
    lastDeliveryError: "Endpoint returned HTTP 503. Retry scheduled in 60 seconds.",
  },
]

export const endpointNames = ["/v1/users", "/v1/payments", "/v1/invoices", "/v1/keys"]

const appRequestBases = [
  [780, 620, 420, 190],
  [380, 290, 180, 110],
  [240, 180, 130, 80],
]
const demoAnchor = new Date("2026-10-29T12:00:00.000Z")

function dateKeyForDayOffset(daysAgo: number) {
  const day = new Date(demoAnchor)
  day.setUTCDate(day.getUTCDate() - daysAgo)
  return day.toISOString().slice(0, 10)
}

export const usageFacts: UsageFact[] = Array.from({ length: 180 }, (_, dayIndex) => {
  const daysAgo = 179 - dayIndex
  const date = dateKeyForDayOffset(daysAgo)
  const weeklyCycle = 1 + Math.sin((dayIndex / 7) * Math.PI * 2) * 0.12
  const longCycle = 1 + Math.sin(dayIndex / 13) * 0.08
  return initialDeveloperApps.flatMap((app, appIndex) => endpointNames.map((endpoint, endpointIndex) => {
    const spike = (dayIndex + appIndex * 5 + endpointIndex * 3) % 23 === 0 ? 1.35 : 1
    const requests = Math.round(appRequestBases[appIndex][endpointIndex] * weeklyCycle * longCycle * spike)
    const clientErrorRate = 0.009 + ((dayIndex + appIndex + endpointIndex) % 5) * 0.002
    const serverErrorRate = 0.002 + ((dayIndex * 2 + appIndex + endpointIndex) % 4) * 0.001
    const clientErrors = Math.round(requests * clientErrorRate)
    const serverErrors = Math.round(requests * serverErrorRate)
    return {
      date,
      appId: app.id,
      endpoint,
      requests,
      success: requests - clientErrors - serverErrors,
      clientErrors,
      serverErrors,
    }
  }))
}).flat()

export const initialRequestLogs: RequestLog[] = [
  { id: "log_001", timestamp: "2026-10-29T10:24:18.442Z", appId: "app_8f31a2", method: "GET", endpoint: "/v1/users", status: 200, responseTimeMs: 84, requestId: "req_7f8a2c19", requestBody: { query: { limit: 20, cursor: "[REDACTED]" } }, responseBody: { data: [{ id: "usr_2a91", name: "Jamie Chen" }], has_more: true } },
  { id: "log_002", timestamp: "2026-10-29T10:23:51.108Z", appId: "app_41bc09", method: "POST", endpoint: "/v1/payments", status: 201, responseTimeMs: 212, requestId: "req_1c6b5e03", requestBody: { amount: 6400, currency: "usd", source: "[REDACTED]" }, responseBody: { id: "pay_demo_204", status: "succeeded" } },
  { id: "log_003", timestamp: "2026-10-29T10:21:06.900Z", appId: "app_763d10", method: "GET", endpoint: "/v1/invoices", status: 200, responseTimeMs: 131, requestId: "req_829a41d0", requestBody: { query: { status: "open", limit: 10 } }, responseBody: { data: [{ id: "inv_demo_18", status: "open" }], has_more: false } },
  { id: "log_004", timestamp: "2026-10-29T10:18:42.012Z", appId: "app_8f31a2", method: "PATCH", endpoint: "/v1/users/usr_2a91", status: 200, responseTimeMs: 96, requestId: "req_91c87f2a", requestBody: { email: "jamie@example.test", metadata: { plan: "growth" } }, responseBody: { id: "usr_2a91", updated: true } },
  { id: "log_005", timestamp: "2026-10-29T10:16:03.553Z", appId: "app_41bc09", method: "POST", endpoint: "/v1/payments", status: 400, responseTimeMs: 47, requestId: "req_0f5e2a64", requestBody: { amount: 0, currency: "usd", source: "[REDACTED]" }, responseBody: { error: { type: "validation_error", code: "amount_invalid" } } },
  { id: "log_006", timestamp: "2026-10-29T10:12:29.034Z", appId: "app_8f31a2", method: "GET", endpoint: "/v1/keys", status: 200, responseTimeMs: 63, requestId: "req_aa4d7b83", requestBody: { query: { environment: "production" } }, responseBody: { data: [{ id: "key_demo_1", label: "Primary" }] } },
  { id: "log_007", timestamp: "2026-10-29T10:08:11.607Z", appId: "app_763d10", method: "DELETE", endpoint: "/v1/invoices/inv_demo_18", status: 204, responseTimeMs: 109, requestId: "req_6db72810", requestBody: { headers: { authorization: "Bearer [REDACTED]" } }, responseBody: { deleted: true } },
  { id: "log_008", timestamp: "2026-10-29T10:02:49.440Z", appId: "app_41bc09", method: "GET", endpoint: "/v1/users", status: 429, responseTimeMs: 23, requestId: "req_b3fc1907", requestBody: { query: { limit: 100 } }, responseBody: { error: { type: "rate_limit_error", retry_after: 30 } } },
  { id: "log_009", timestamp: "2026-10-29T09:58:30.224Z", appId: "app_8f31a2", method: "POST", endpoint: "/v1/invoices", status: 500, responseTimeMs: 1502, requestId: "req_72a1d46c", requestBody: { customer_id: "cus_demo_2", amount: 12900, currency: "usd" }, responseBody: { error: { type: "api_error", message: "Temporary processing error" } } },
  { id: "log_010", timestamp: "2026-10-29T09:50:02.930Z", appId: "app_763d10", method: "GET", endpoint: "/v1/payments", status: 200, responseTimeMs: 118, requestId: "req_3e8019af", requestBody: { query: { created_after: "2026-10-01" } }, responseBody: { data: [{ id: "pay_demo_194", status: "succeeded" }], has_more: false } },
  { id: "log_011", timestamp: "2026-10-28T18:41:10.001Z", appId: "app_8f31a2", method: "POST", endpoint: "/v1/users", status: 201, responseTimeMs: 177, requestId: "req_7bd890ae", requestBody: { name: "Morgan Lee", email: "morgan@example.test", password: "[REDACTED]" }, responseBody: { id: "usr_demo_29", created: true } },
  { id: "log_012", timestamp: "2026-10-28T16:20:45.200Z", appId: "app_41bc09", method: "GET", endpoint: "/v1/invoices", status: 200, responseTimeMs: 140, requestId: "req_288b1d46", requestBody: { query: { limit: 20 } }, responseBody: { data: [], has_more: false } },
]

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function createDemoSecret() {
  const randomPart = Math.random().toString(36).slice(2, 14).padEnd(12, "0")
  return `demo_secret_${randomPart}`
}
