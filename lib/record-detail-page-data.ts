import type { ContactRecord } from "@/lib/create-edit-form-config"
import { copyContactValues, initialContactRecords } from "@/lib/create-edit-form-demo-data"

export type DemoContact = ContactRecord & {
  createdAt: string
  role: string
  archived: boolean
}

export type ContactActivity = {
  id: string
  title: string
  description: string
  time: string
}

export type RelatedDemoRecord = {
  id: string
  type: "Company" | "Opportunity"
  title: string
  summary: string
  details: { label: string; value: string }[]
}

export const initialDetailContacts: DemoContact[] = initialContactRecords.map((record, index) => ({
  ...record,
  values: copyContactValues(record.values),
  createdAt: index === 0 ? "2026-03-18" : "2026-05-06",
  role: index === 0 ? "Operations Lead" : "Regional Partnerships",
  archived: false,
}))

export const initialContactActivity: Record<string, ContactActivity[]> = {
  "contact-001": [
    { id: "activity-001-1", title: "Contact created", description: "Alya Pratama was added to the directory.", time: "Mar 18, 2026" },
    { id: "activity-001-2", title: "Relationship updated", description: "Northstar Labs was linked to this contact.", time: "Mar 19, 2026" },
    { id: "activity-001-3", title: "Note added", description: "Coordinates the Northstar Labs operations team.", time: "Apr 02, 2026" },
  ],
  "contact-002": [
    { id: "activity-002-1", title: "Contact created", description: "Rafael Putra was added to the directory.", time: "May 06, 2026" },
    { id: "activity-002-2", title: "Follow-up scheduled", description: "Product walkthrough requested for the Horizon Group team.", time: "May 09, 2026" },
  ],
}

export const initialRelatedRecords: Record<string, RelatedDemoRecord[]> = {
  "contact-001": [
    {
      id: "company-northstar",
      type: "Company",
      title: "Northstar Labs",
      summary: "Enterprise customer · Jakarta, Indonesia",
      details: [
        { label: "Account owner", value: "Mei Tan" },
        { label: "Relationship", value: "Strategic customer" },
        { label: "Employees", value: "240–500" },
      ],
    },
    {
      id: "opportunity-northstar-renewal",
      type: "Opportunity",
      title: "Northstar annual renewal",
      summary: "Renewal · In progress · $84,000 ARR",
      details: [
        { label: "Stage", value: "Proposal" },
        { label: "Expected close", value: "Nov 30, 2026" },
        { label: "Owner", value: "Mei Tan" },
      ],
    },
  ],
  "contact-002": [
    {
      id: "company-horizon",
      type: "Company",
      title: "Horizon Group",
      summary: "Growth account · Singapore",
      details: [
        { label: "Account owner", value: "Alya Pratama" },
        { label: "Relationship", value: "Prospective customer" },
        { label: "Employees", value: "80–150" },
      ],
    },
    {
      id: "opportunity-horizon-rollout",
      type: "Opportunity",
      title: "Horizon regional rollout",
      summary: "New business · Discovery · $42,000 ARR",
      details: [
        { label: "Stage", value: "Discovery" },
        { label: "Expected close", value: "Dec 18, 2026" },
        { label: "Owner", value: "Rafael Putra" },
      ],
    },
  ],
}
