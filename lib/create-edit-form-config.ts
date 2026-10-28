export type FormMode = "create" | "edit"
export type RecordType = "Customer" | "Prospect" | "Partner"
export type RecordStatus = "Active" | "Inactive" | "Pending"
export type RecordPriority = "Low" | "Normal" | "High"
export type ContactMethod = "Email" | "Phone"

export type ContactRecordValues = {
  fullName: string
  email: string
  phone: string
  recordType: RecordType
  description: string
  company: string
  owner: string
  status: RecordStatus
  priority: RecordPriority
  source: string
  preferredContactMethod: ContactMethod
  tags: string[]
  followUpDate: string
  customerSegment: string
  leadSourceDetails: string
}

export type ContactRecord = {
  id: string
  values: ContactRecordValues
}

export type SelectOption = {
  value: string
  label: string
}

export const createEditFormSections = [
  {
    id: "basic-information",
    title: "Basic Information",
    description: "Add the contact details people use to identify and reach this record.",
  },
  {
    id: "assignment-relationship",
    title: "Assignment & Relationship",
    description: "Connect this record to a company, owner, and current business state.",
  },
  {
    id: "additional-information",
    title: "Additional Information",
    description: "Capture how this record was introduced and how they prefer to connect.",
  },
] as const

export const recordTypeOptions: SelectOption[] = [
  { value: "Customer", label: "Customer" },
  { value: "Prospect", label: "Prospect" },
  { value: "Partner", label: "Partner" },
]

export const customerSegmentOptions: SelectOption[] = [
  { value: "Small business", label: "Small business" },
  { value: "Mid-market", label: "Mid-market" },
  { value: "Enterprise", label: "Enterprise" },
]

export const statusOptions: SelectOption[] = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Pending", label: "Pending" },
]

export const priorityOptions: SelectOption[] = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "High", label: "High" },
]

export const sourceOptions: SelectOption[] = [
  { value: "Manual", label: "Manual" },
  { value: "Website", label: "Website" },
  { value: "Referral", label: "Referral" },
  { value: "Campaign", label: "Campaign" },
]

export const companyOptions: SelectOption[] = [
  { value: "Northstar Labs", label: "Northstar Labs" },
  { value: "Horizon Group", label: "Horizon Group" },
  { value: "Meridian Works", label: "Meridian Works" },
  { value: "Aperture Studio", label: "Aperture Studio" },
  { value: "Saffron Digital", label: "Saffron Digital" },
]

export const ownerOptions: SelectOption[] = [
  { value: "Alya Pratama", label: "Alya Pratama" },
  { value: "Rafael Putra", label: "Rafael Putra" },
  { value: "Mei Tan", label: "Mei Tan" },
  { value: "Chandra Wijaya", label: "Chandra Wijaya" },
]

export const tagOptions: SelectOption[] = [
  { value: "strategic", label: "Strategic" },
  { value: "renewal", label: "Renewal" },
  { value: "inbound", label: "Inbound" },
  { value: "at-risk", label: "At risk" },
  { value: "enterprise", label: "Enterprise" },
]
