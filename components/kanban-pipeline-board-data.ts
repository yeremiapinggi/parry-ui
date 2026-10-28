import type { Opportunity, PipelineStage } from "@/components/kanban-pipeline-board-types"

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "new-lead", name: "New Lead" },
  { id: "qualified", name: "Qualified" },
  { id: "proposal", name: "Proposal" },
  { id: "negotiation", name: "Negotiation" },
  { id: "won", name: "Won", terminal: "won" },
  { id: "lost", name: "Lost", terminal: "lost" },
]

export const DEMO_OPPORTUNITIES: Opportunity[] = [
  { id: "opp-101", name: "Customer Data Platform", company: "Northstar Labs", value: 48000, owner: "Ava Chen", ownerInitials: "AC", priority: "High", closeDate: "2026-11-14", stageId: "new-lead", status: "Open", archived: false, notes: "Interested in consolidating three customer data sources before the new year." },
  { id: "opp-102", name: "Service Desk Expansion", company: "Lattice Health", value: 32000, owner: "Noah Williams", ownerInitials: "NW", priority: "Medium", closeDate: "2026-11-21", stageId: "new-lead", status: "Open", archived: false, notes: "Initial discovery booked with the operations director." },
  { id: "opp-103", name: "Regional Analytics Suite", company: "Meridian Works", value: 76500, owner: "Maya Patel", ownerInitials: "MP", priority: "High", closeDate: "2026-11-08", stageId: "qualified", status: "Open", archived: false, notes: "Four regional teams are evaluating a shared reporting workspace." },
  { id: "opp-104", name: "Workflow Automation", company: "Redwood Freight", value: 54000, owner: "Luca Moretti", ownerInitials: "LM", priority: "Low", closeDate: "2026-12-05", stageId: "qualified", status: "Open", archived: false, notes: "Customer wants to automate dispatch handoffs and exception routing." },
  { id: "opp-105", name: "Enterprise Support Plan", company: "Horizon Group", value: 68000, owner: "Ava Chen", ownerInitials: "AC", priority: "Medium", closeDate: "2026-11-18", stageId: "proposal", status: "Open", archived: false, notes: "Proposal includes support coverage for two business units." },
  { id: "opp-106", name: "AI Operations Pilot", company: "Saffron Digital", value: 92500, owner: "Maya Patel", ownerInitials: "MP", priority: "High", closeDate: "2026-12-12", stageId: "proposal", status: "Open", archived: false, notes: "A six-week pilot is under review with the data governance team." },
  { id: "opp-107", name: "Customer Portal Renewal", company: "Ironwood Design", value: 41000, owner: "Noah Williams", ownerInitials: "NW", priority: "Medium", closeDate: "2026-11-29", stageId: "negotiation", status: "Open", archived: false, notes: "Procurement requested updated terms for a two-year renewal." },
  { id: "opp-108", name: "Knowledge Workspace", company: "Bluebird Energy", value: 61500, owner: "Luca Moretti", ownerInitials: "LM", priority: "High", closeDate: "2026-11-10", stageId: "negotiation", status: "Open", archived: false, notes: "Final stakeholder review is complete; legal is reviewing the order form." },
  { id: "opp-109", name: "Data Quality Program", company: "Atlas Bio", value: 57000, owner: "Maya Patel", ownerInitials: "MP", priority: "Low", closeDate: "2026-10-30", stageId: "won", status: "Won", archived: false, notes: "Signed for an initial 12-month program." },
  { id: "opp-110", name: "Contact Center Refresh", company: "Juniper Finance", value: 28500, owner: "Ava Chen", ownerInitials: "AC", priority: "Medium", closeDate: "2026-10-24", stageId: "lost", status: "Lost", archived: false, notes: "The team selected an incumbent provider for this cycle." },
]

export const OPPORTUNITY_OWNERS = ["Ava Chen", "Luca Moretti", "Maya Patel", "Noah Williams"]

export function getOpportunityStatus(stageId: string, stages: PipelineStage[]) {
  const stage = stages.find((candidate) => candidate.id === stageId)
  if (stage?.terminal === "won") return "Won" as const
  if (stage?.terminal === "lost") return "Lost" as const
  return "Open" as const
}

export function formatOpportunityValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCloseDate(value: string) {
  if (!value) return "No close date"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}
