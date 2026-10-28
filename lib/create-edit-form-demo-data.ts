import type { ContactRecord, ContactRecordValues } from "@/lib/create-edit-form-config"

export function createEmptyContactValues(): ContactRecordValues {
  return {
    fullName: "",
    email: "",
    phone: "",
    recordType: "Prospect",
    description: "",
    company: "",
    owner: "",
    status: "Active",
    priority: "Normal",
    source: "Manual",
    preferredContactMethod: "Email",
    tags: [],
    followUpDate: "",
    customerSegment: "",
    leadSourceDetails: "",
  }
}

export function copyContactValues(values: ContactRecordValues): ContactRecordValues {
  return { ...values, tags: [...values.tags] }
}

export const initialContactRecords: ContactRecord[] = [
  {
    id: "contact-001",
    values: {
      fullName: "Alya Pratama",
      email: "alya.pratama@example.com",
      phone: "+62 812-555-0192",
      recordType: "Customer",
      description: "Coordinates the Northstar Labs operations team.",
      company: "Northstar Labs",
      owner: "Mei Tan",
      status: "Active",
      priority: "High",
      source: "Referral",
      preferredContactMethod: "Email",
      tags: ["strategic", "renewal", "enterprise"],
      followUpDate: "2026-11-12",
      customerSegment: "Enterprise",
      leadSourceDetails: "",
    },
  },
  {
    id: "contact-002",
    values: {
      fullName: "Rafael Putra",
      email: "rafael.putra@example.com",
      phone: "+62 811-555-0246",
      recordType: "Prospect",
      description: "Exploring a regional rollout for the Horizon Group team.",
      company: "Horizon Group",
      owner: "Alya Pratama",
      status: "Pending",
      priority: "Normal",
      source: "Website",
      preferredContactMethod: "Phone",
      tags: ["inbound"],
      followUpDate: "2026-11-18",
      customerSegment: "",
      leadSourceDetails: "Requested a product walkthrough through the website.",
    },
  },
]
