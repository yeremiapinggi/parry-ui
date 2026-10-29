export const activityTypes = [
  "record-created",
  "field-updated",
  "status-changed",
  "assigned",
  "comment-added",
  "file-attached",
  "activity-completed",
  "system-event",
] as const

export type ActivityType = (typeof activityTypes)[number]
export type TimelineVariant = "full" | "compact" | "embedded"
export type ActivityActor = {
  id: string
  name: string
  initials: string
  role: string
  kind: "person" | "system"
}
export type ActivityChange = { field: string; previousValue: string; newValue: string }
export type ActivityEvent = {
  id: string
  type: ActivityType
  title: string
  description: string
  actor: ActivityActor
  entity: string
  occurredAt: string
  changes?: ActivityChange[]
  note?: string
}

export const activityTypeLabels: Record<ActivityType, string> = {
  "record-created": "Record Created",
  "field-updated": "Field Updated",
  "status-changed": "Status Changed",
  assigned: "Assigned / Reassigned",
  "comment-added": "Comment Added",
  "file-attached": "File Attached",
  "activity-completed": "Activity Completed",
  "system-event": "System Event",
}

export const activityActors: ActivityActor[] = [
  { id: "alex-morgan", name: "Alex Morgan", initials: "AM", role: "Account executive", kind: "person" },
  { id: "maya-chen", name: "Maya Chen", initials: "MC", role: "Customer success", kind: "person" },
  { id: "jordan-lee", name: "Jordan Lee", initials: "JL", role: "Sales manager", kind: "person" },
  { id: "system", name: "Parry system", initials: "", role: "Automated activity", kind: "system" },
]

const alex = activityActors[0]
const maya = activityActors[1]
const jordan = activityActors[2]
const system = activityActors[3]
const customer = "Northstar Health · Enterprise renewal"
const minute = 60_000
const day = 24 * 60 * minute
export const ACTIVITY_DEMO_REFERENCE_TIME = Date.UTC(2026, 9, 29, 12, 0)

function atRelativeTime(referenceTime: number, millisecondsAgo: number) {
  return new Date(referenceTime - millisecondsAgo).toISOString()
}

function atUtcDay(referenceTime: number, daysAgo: number, hour: number, minuteOfHour: number) {
  const date = new Date(referenceTime)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  date.setUTCHours(hour, minuteOfHour, 0, 0)
  return date.toISOString()
}

export function createInitialActivityEvents(referenceTime = ACTIVITY_DEMO_REFERENCE_TIME): ActivityEvent[] {
  return [
    {
      id: "activity-status-negotiation",
      type: "status-changed",
      title: "Opportunity moved to Negotiation",
      description: "Northstar Health is ready for final commercial review.",
      actor: maya,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 12 * minute),
      changes: [{ field: "Stage", previousValue: "Proposal", newValue: "Negotiation" }],
    },
    {
      id: "activity-value-updated",
      type: "field-updated",
      title: "Annual contract value updated",
      description: "The revised seat count was reflected in the renewal forecast.",
      actor: alex,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 48 * minute),
      changes: [{ field: "Annual contract value", previousValue: "$82,000", newValue: "$96,000" }],
      note: "Pricing reflects the expanded clinical team and two additional locations.",
    },
    {
      id: "activity-comment-security",
      type: "comment-added",
      title: "Comment added to the renewal record",
      description: "A note was added for the account team.",
      actor: alex,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 2 * 60 * minute),
      note: "The updated security questionnaire is with procurement. Maya will confirm the review date after Thursday’s call.",
    },
    {
      id: "activity-assignment-maya",
      type: "assigned",
      title: "Customer success owner reassigned",
      description: "The renewal handoff is now owned by Maya Chen.",
      actor: system,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 4 * 60 * minute),
      changes: [{ field: "Customer success owner", previousValue: "Jordan Lee", newValue: "Maya Chen" }],
    },
    {
      id: "activity-file-attached",
      type: "file-attached",
      title: "Renewal proposal attached",
      description: "A revised proposal was added to the customer record.",
      actor: maya,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 6 * 60 * minute),
      note: "Northstar_Health_Renewal_Proposal_v3.pdf · 2.4 MB",
    },
    {
      id: "activity-call-completed",
      type: "activity-completed",
      title: "Renewal planning call completed",
      description: "The discovery call and next steps were recorded.",
      actor: jordan,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 9 * 60 * minute),
      note: "Next step: send the updated service schedule before the procurement review.",
    },
    {
      id: "activity-field-contact",
      type: "field-updated",
      title: "Primary contact details updated",
      description: "The renewal contact information was refreshed.",
      actor: alex,
      entity: customer,
      occurredAt: atUtcDay(referenceTime, 1, 16, 18),
      changes: [{ field: "Primary contact", previousValue: "Riley Brooks", newValue: "Taylor Nguyen" }],
    },
    {
      id: "activity-system-reminder",
      type: "system-event",
      title: "Renewal reminder scheduled",
      description: "A reminder was added ahead of the contract review date.",
      actor: system,
      entity: customer,
      occurredAt: atUtcDay(referenceTime, 1, 13, 42),
      note: "Reminder date: November 12 · Owner: Maya Chen",
    },
    {
      id: "activity-assignment-jordan",
      type: "assigned",
      title: "Account owner assigned",
      description: "Jordan Lee became the primary account owner.",
      actor: alex,
      entity: customer,
      occurredAt: atUtcDay(referenceTime, 2, 10, 5),
      changes: [{ field: "Account owner", previousValue: "Unassigned", newValue: "Jordan Lee" }],
    },
    {
      id: "activity-record-created",
      type: "record-created",
      title: "Customer record created",
      description: "Northstar Health was added from the enterprise pipeline.",
      actor: alex,
      entity: customer,
      occurredAt: atUtcDay(referenceTime, 5, 9, 22),
      note: "Source: Enterprise pipeline · Segment: Healthcare",
    },
  ]
}

export function createHistoricalActivityEvents(referenceTime = ACTIVITY_DEMO_REFERENCE_TIME): ActivityEvent[] {
  return [
    {
      id: "activity-history-plan",
      type: "field-updated",
      title: "Service plan updated",
      description: "The account plan was updated after the quarterly review.",
      actor: jordan,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 18 * day),
      changes: [{ field: "Service plan", previousValue: "Standard", newValue: "Enterprise Plus" }],
    },
    {
      id: "activity-history-created",
      type: "record-created",
      title: "Renewal opportunity created",
      description: "A renewal opportunity was opened for the upcoming contract term.",
      actor: system,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 26 * day),
      note: "Opportunity source: Renewal workflow",
    },
    {
      id: "activity-history-owner",
      type: "assigned",
      title: "Record imported and assigned",
      description: "The customer record was imported from the previous CRM.",
      actor: system,
      entity: customer,
      occurredAt: atRelativeTime(referenceTime, 34 * day),
      changes: [{ field: "Account owner", previousValue: "Legacy CRM", newValue: "Alex Morgan" }],
    },
  ]
}
