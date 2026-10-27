export const OPERATIONAL_CHANNELS = [
  { key: "chat", label: "Chat" },
  { key: "email", label: "Email" },
  { key: "voice", label: "Voice" },
  { key: "web", label: "Web" },
] as const

export type OperationalChannel = (typeof OPERATIONAL_CHANNELS)[number]["key"]
export type WorkStatus = "pending" | "active" | "completed"
export type WorkPriority = "normal" | "high" | "critical"
export type IssueSeverity = "normal" | "warning" | "critical"
export type IssueState = "open" | "acknowledged" | "resolved"
export type ServiceState = "connected" | "degraded" | "disconnected"

export type WorkItem = {
  id: string
  title: string
  requester: string
  channel: OperationalChannel
  status: WorkStatus
  priority: WorkPriority
  ageMinutes: number
  slaRemainingMinutes: number
  assignee: string
}

export type OperationalIssue = {
  id: string
  title: string
  severity: IssueSeverity
  channel: OperationalChannel
  workItemId: string
  detectedMinutesAgo: number
  description: string
  recommendedAction: string
}

export type OperationalAgent = {
  id: string
  name: string
  available: boolean
  channels: OperationalChannel[]
}

export type ServiceHealth = {
  channel: OperationalChannel
  state: ServiceState
  detail: string
  checkedAt: string
}

const initialWorkItems: WorkItem[] = [
  { id: "WK-2401", title: "Refund request needs review", requester: "Maya Chen", channel: "chat", status: "active", priority: "high", ageMinutes: 18, slaRemainingMinutes: 7, assignee: "Avery Morgan" },
  { id: "WK-2402", title: "Delivery status follow-up", requester: "Noah Patel", channel: "chat", status: "pending", priority: "normal", ageMinutes: 6, slaRemainingMinutes: 24, assignee: "Unassigned" },
  { id: "WK-2403", title: "Account access recovery", requester: "Isabel Ruiz", channel: "email", status: "active", priority: "normal", ageMinutes: 42, slaRemainingMinutes: 48, assignee: "Jordan Lee" },
  { id: "WK-2404", title: "Invoice correction", requester: "Elliot Brooks", channel: "voice", status: "completed", priority: "normal", ageMinutes: 31, slaRemainingMinutes: 0, assignee: "Riley Shah" },
  { id: "WK-2405", title: "Callback request: billing", requester: "Samira Khan", channel: "voice", status: "pending", priority: "critical", ageMinutes: 29, slaRemainingMinutes: -8, assignee: "Unassigned" },
  { id: "WK-2406", title: "Workspace invite not received", requester: "Theo Martin", channel: "web", status: "active", priority: "normal", ageMinutes: 11, slaRemainingMinutes: 36, assignee: "Casey Kim" },
  { id: "WK-2407", title: "Plan change confirmation", requester: "Zoe Williams", channel: "email", status: "pending", priority: "high", ageMinutes: 16, slaRemainingMinutes: 12, assignee: "Unassigned" },
  { id: "WK-2408", title: "Duplicate charge investigation", requester: "Omar Hassan", channel: "chat", status: "active", priority: "critical", ageMinutes: 54, slaRemainingMinutes: -3, assignee: "Avery Morgan" },
  { id: "WK-2409", title: "Product setup question", requester: "Leah Thompson", channel: "web", status: "completed", priority: "normal", ageMinutes: 24, slaRemainingMinutes: 0, assignee: "Jordan Lee" },
  { id: "WK-2410", title: "Unable to verify account", requester: "Lucas Nguyen", channel: "voice", status: "active", priority: "high", ageMinutes: 37, slaRemainingMinutes: 9, assignee: "Riley Shah" },
  { id: "WK-2411", title: "Data export is incomplete", requester: "Amina Okafor", channel: "email", status: "pending", priority: "normal", ageMinutes: 9, slaRemainingMinutes: 67, assignee: "Unassigned" },
  { id: "WK-2412", title: "Change primary contact", requester: "Ben Carter", channel: "chat", status: "completed", priority: "normal", ageMinutes: 14, slaRemainingMinutes: 0, assignee: "Casey Kim" },
  { id: "WK-2413", title: "Service availability question", requester: "Sofia Garcia", channel: "web", status: "active", priority: "high", ageMinutes: 23, slaRemainingMinutes: 14, assignee: "Jordan Lee" },
  { id: "WK-2414", title: "Return label request", requester: "Henry Adams", channel: "email", status: "completed", priority: "normal", ageMinutes: 48, slaRemainingMinutes: 0, assignee: "Avery Morgan" },
  { id: "WK-2415", title: "Subscription renewal failed", requester: "Priya Desai", channel: "chat", status: "pending", priority: "critical", ageMinutes: 21, slaRemainingMinutes: 5, assignee: "Unassigned" },
  { id: "WK-2416", title: "Voice menu routed incorrectly", requester: "Daniel Park", channel: "voice", status: "active", priority: "normal", ageMinutes: 7, slaRemainingMinutes: 52, assignee: "Riley Shah" },
  { id: "WK-2417", title: "Tax ID update request", requester: "Nina Wilson", channel: "web", status: "pending", priority: "normal", ageMinutes: 12, slaRemainingMinutes: 41, assignee: "Unassigned" },
  { id: "WK-2418", title: "Missing order confirmation", requester: "Mateo Silva", channel: "email", status: "active", priority: "high", ageMinutes: 33, slaRemainingMinutes: 6, assignee: "Casey Kim" },
  { id: "WK-2419", title: "Close duplicate workspace", requester: "Grace Liu", channel: "chat", status: "completed", priority: "normal", ageMinutes: 19, slaRemainingMinutes: 0, assignee: "Avery Morgan" },
  { id: "WK-2420", title: "Payment method declined", requester: "Ethan Foster", channel: "web", status: "active", priority: "critical", ageMinutes: 26, slaRemainingMinutes: -11, assignee: "Jordan Lee" },
]

export const OPERATIONAL_ISSUES: OperationalIssue[] = [
  {
    id: "AL-903",
    title: "Voice queue exceeded the wait target",
    severity: "critical",
    channel: "voice",
    workItemId: "WK-2405",
    detectedMinutesAgo: 6,
    description: "The oldest pending voice request has exceeded its target wait time. This is a fictional alert in the dashboard demo.",
    recommendedAction: "Review the callback request and assign an available voice agent.",
  },
  {
    id: "AL-902",
    title: "SLA deadline approaching",
    severity: "warning",
    channel: "chat",
    workItemId: "WK-2401",
    detectedMinutesAgo: 11,
    description: "An active chat work item has less than fifteen minutes remaining in its response window.",
    recommendedAction: "Review the conversation and send the next response before the deadline.",
  },
  {
    id: "AL-901",
    title: "Web channel is disconnected",
    severity: "critical",
    channel: "web",
    workItemId: "WK-2413",
    detectedMinutesAgo: 18,
    description: "The web intake channel is marked disconnected in this demo snapshot. Existing work items remain visible for triage.",
    recommendedAction: "Inspect the web intake configuration and verify the demo connection state.",
  },
  {
    id: "AL-900",
    title: "Email response window at risk",
    severity: "warning",
    channel: "email",
    workItemId: "WK-2418",
    detectedMinutesAgo: 24,
    description: "An email work item is approaching its response target and has not been completed yet.",
    recommendedAction: "Confirm the assigned agent can respond within the remaining SLA window.",
  },
  {
    id: "AL-899",
    title: "Email queue operating within target",
    severity: "normal",
    channel: "email",
    workItemId: "WK-2403",
    detectedMinutesAgo: 41,
    description: "The email queue is within its normal response range in this fictional snapshot.",
    recommendedAction: "No immediate action is required. Continue routine monitoring.",
  },
]

export const OPERATIONAL_AGENTS: OperationalAgent[] = [
  { id: "AG-01", name: "Avery Morgan", available: true, channels: ["chat", "email"] },
  { id: "AG-02", name: "Jordan Lee", available: true, channels: ["email", "web"] },
  { id: "AG-03", name: "Riley Shah", available: true, channels: ["voice"] },
  { id: "AG-04", name: "Casey Kim", available: true, channels: ["chat", "web"] },
  { id: "AG-05", name: "Morgan Diaz", available: true, channels: ["voice", "chat"] },
  { id: "AG-06", name: "Taylor Brooks", available: false, channels: ["email", "web"] },
  { id: "AG-07", name: "Quinn Patel", available: true, channels: ["email", "voice"] },
  { id: "AG-08", name: "Jamie Park", available: false, channels: ["chat", "web"] },
]

const snapshotTransitions: Record<number, Partial<Record<string, WorkStatus>>> = {
  1: { "WK-2402": "active", "WK-2403": "completed", "WK-2411": "active", "WK-2417": "active" },
  2: { "WK-2401": "completed", "WK-2406": "pending", "WK-2413": "completed", "WK-2416": "pending" },
}

export function createOperationalSnapshot(snapshotIndex: number) {
  const snapshot = snapshotIndex % 3
  const transitions = snapshotTransitions[snapshot] ?? {}
  const slaAdjustment = snapshot === 1 ? -4 : snapshot === 2 ? 3 : 0

  return initialWorkItems.map((item) => {
    const status = transitions[item.id] ?? item.status
    return {
      ...item,
      status,
      slaRemainingMinutes: status === "completed" ? 0 : item.slaRemainingMinutes + slaAdjustment,
    }
  })
}

const serviceSnapshots: ServiceState[][] = [
  ["connected", "connected", "degraded", "disconnected"],
  ["connected", "degraded", "connected", "degraded"],
  ["degraded", "connected", "connected", "disconnected"],
]

const serviceDetails: Record<ServiceState, string> = {
  connected: "Operating normally",
  degraded: "Elevated response time",
  disconnected: "No recent connection",
}

export function createServiceHealth(snapshotIndex: number): ServiceHealth[] {
  const states = serviceSnapshots[snapshotIndex % serviceSnapshots.length]
  return OPERATIONAL_CHANNELS.map((channel, index) => ({
    channel: channel.key,
    state: states[index],
    detail: serviceDetails[states[index]],
    checkedAt: "09:41 AM",
  }))
}
