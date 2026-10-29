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
    id: "app_sociomile_demo",
    name: "sociomile-demo",
    environment: "Production",
    clientId: "demo_client_sociomile_8f31a2",
    clientSecret: "demo_secret_sociomile_5c1d9e7a",
    redirectUris: ["https://demo.sociomile.ivosights.com/oauth/callback", "https://app.sociomile.ivosights.com/oauth/return"],
    createdAt: "2026-04-12",
  },
  {
    id: "app_ivodevjne",
    name: "IvoDevJNE",
    environment: "Development",
    clientId: "demo_client_ivodevjne_41bc09",
    clientSecret: "demo_secret_ivodevjne_7b4f12c8",
    redirectUris: ["http://localhost:3000/oauth/callback"],
    createdAt: "2026-06-28",
  },
  {
    id: "app_ivosightsdev",
    name: "IvosightsDev",
    environment: "Development",
    clientId: "demo_client_ivosightsdev_763d10",
    clientSecret: "demo_secret_ivosightsdev_2a8e51f3",
    redirectUris: ["https://developer.ivosights.com/oauth/callback"],
    createdAt: "2026-09-03",
  },
]

export const availableWebhookEvents = [
  "ticket.created",
  "ticket.updated",
  "mention.received",
  "insight.generated",
  "agent.run.completed",
  "agent.run.failed",
  "app.key_rotated",
]

export const initialWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_2048a",
    appId: "app_sociomile_demo",
    url: "https://demo.sociomile.ivosights.com/webhooks/events",
    events: ["ticket.created", "ticket.updated", "agent.run.completed"],
    enabled: true,
    lastDeliveryAt: "2026-10-29T09:42:00.000Z",
    lastDeliveryStatus: "Success",
  },
  {
    id: "wh_87bc1",
    appId: "app_ivodevjne",
    url: "https://hooks.dev.ivosights.com/ripple10",
    events: ["mention.received", "insight.generated"],
    enabled: false,
    lastDeliveryAt: "2026-10-28T15:18:00.000Z",
    lastDeliveryStatus: "Failed",
    lastDeliveryError: "Endpoint returned HTTP 503. Retry scheduled in 60 seconds.",
  },
]

export const endpointNames = [
  "/v1/sociomile/tickets",
  "/v1/ripple10/mentions",
  "/v1/cognivo/insights",
  "/v1/agentics/runs",
]

const appRequestBases = [
  [3120, 2480, 1680, 760],
  [1520, 1160, 720, 440],
  [960, 720, 520, 320],
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
  { id: "log_001", timestamp: "2026-10-29T10:24:18.442Z", appId: "app_sociomile_demo", method: "GET", endpoint: "/v1/sociomile/tickets", status: 200, responseTimeMs: 84, requestId: "req_7f8a2c19", requestBody: { query: { status: "open", limit: 25, cursor: "[REDACTED]" } }, responseBody: { data: [{ id: "tkt_demo_2a91", priority: "high" }], has_more: true } },
  { id: "log_002", timestamp: "2026-10-29T10:23:51.108Z", appId: "app_ivodevjne", method: "GET", endpoint: "/v1/ripple10/mentions", status: 200, responseTimeMs: 212, requestId: "req_1c6b5e03", requestBody: { query: { source: "instagram", limit: 50 } }, responseBody: { data: [{ id: "mnt_demo_204", sentiment: "positive" }], has_more: true } },
  { id: "log_003", timestamp: "2026-10-29T10:21:06.900Z", appId: "app_ivosightsdev", method: "POST", endpoint: "/v1/cognivo/insights", status: 200, responseTimeMs: 131, requestId: "req_829a41d0", requestBody: { query: { workspace: "ivosights-demo", window: "7d" } }, responseBody: { data: [{ id: "ins_demo_18", status: "ready" }] } },
  { id: "log_004", timestamp: "2026-10-29T10:18:42.012Z", appId: "app_sociomile_demo", method: "GET", endpoint: "/v1/sociomile/tickets", status: 200, responseTimeMs: 96, requestId: "req_91c87f2a", requestBody: { query: { assignee: "team_support", limit: 20 } }, responseBody: { data: [{ id: "tkt_demo_91c8", updated: true }], has_more: false } },
  { id: "log_005", timestamp: "2026-10-29T10:16:03.553Z", appId: "app_ivodevjne", method: "POST", endpoint: "/v1/cognivo/insights", status: 400, responseTimeMs: 47, requestId: "req_0f5e2a64", requestBody: { query: { workspace: "ivosights-demo", window: "invalid" } }, responseBody: { error: { type: "validation_error", code: "window_invalid" } } },
  { id: "log_006", timestamp: "2026-10-29T10:12:29.034Z", appId: "app_sociomile_demo", method: "GET", endpoint: "/v1/sociomile/tickets", status: 200, responseTimeMs: 63, requestId: "req_aa4d7b83", requestBody: { query: { queue: "priority", environment: "production" } }, responseBody: { data: [{ id: "tkt_demo_77aa", queue: "priority" }] } },
  { id: "log_007", timestamp: "2026-10-29T10:08:11.607Z", appId: "app_ivosightsdev", method: "POST", endpoint: "/v1/agentics/runs", status: 202, responseTimeMs: 109, requestId: "req_6db72810", requestBody: { agent_id: "agt_demo_18", input: { task: "summarize_mentions" } }, responseBody: { run_id: "run_demo_18", status: "queued" } },
  { id: "log_008", timestamp: "2026-10-29T10:02:49.440Z", appId: "app_ivodevjne", method: "POST", endpoint: "/v1/agentics/runs", status: 429, responseTimeMs: 23, requestId: "req_b3fc1907", requestBody: { agent_id: "agt_demo_03", input: { task: "classify_tickets" } }, responseBody: { error: { type: "rate_limit_error", retry_after: 30 } } },
  { id: "log_009", timestamp: "2026-10-29T09:58:30.224Z", appId: "app_sociomile_demo", method: "POST", endpoint: "/v1/agentics/runs", status: 500, responseTimeMs: 1502, requestId: "req_72a1d46c", requestBody: { agent_id: "agt_demo_09", input: { task: "ticket_triage" } }, responseBody: { error: { type: "api_error", message: "Temporary processing error" } } },
  { id: "log_010", timestamp: "2026-10-29T09:50:02.930Z", appId: "app_ivosightsdev", method: "GET", endpoint: "/v1/ripple10/mentions", status: 200, responseTimeMs: 118, requestId: "req_3e8019af", requestBody: { query: { source: "x", created_after: "2026-10-01" } }, responseBody: { data: [{ id: "mnt_demo_194", sentiment: "neutral" }], has_more: false } },
  { id: "log_011", timestamp: "2026-10-28T18:41:10.001Z", appId: "app_sociomile_demo", method: "GET", endpoint: "/v1/sociomile/tickets", status: 200, responseTimeMs: 177, requestId: "req_7bd890ae", requestBody: { query: { queue: "customer-care", limit: 25 } }, responseBody: { data: [{ id: "tkt_demo_29", status: "resolved" }], has_more: true } },
  { id: "log_012", timestamp: "2026-10-28T16:20:45.200Z", appId: "app_ivodevjne", method: "GET", endpoint: "/v1/ripple10/mentions", status: 200, responseTimeMs: 140, requestId: "req_288b1d46", requestBody: { query: { topic: "brand-health", limit: 20 } }, responseBody: { data: [], has_more: false } },
]

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function createDemoSecret() {
  const randomPart = Math.random().toString(36).slice(2, 14).padEnd(12, "0")
  return `demo_secret_${randomPart}`
}
