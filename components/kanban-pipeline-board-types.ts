export type OpportunityPriority = "High" | "Medium" | "Low"
export type OpportunityStatus = "Open" | "Won" | "Lost"

export type PipelineStage = {
  id: string
  name: string
  terminal?: "won" | "lost"
}

export type Opportunity = {
  id: string
  name: string
  company: string
  value: number
  owner: string
  ownerInitials: string
  priority: OpportunityPriority
  closeDate: string
  stageId: string
  status: OpportunityStatus
  archived: boolean
  notes: string
}

export type OpportunityInput = Omit<Opportunity, "id" | "status" | "archived">
