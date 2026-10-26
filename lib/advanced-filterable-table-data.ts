export type RecordStatus = "Open" | "In review" | "Resolved" | "On hold"
export type RecordPriority = "Urgent" | "High" | "Normal" | "Low"
export type RecordChannel = "Email" | "Web" | "Phone" | "Partner" | "API"
export type GroupByKey = "status" | "priority" | "channel" | "owner"
export type ColumnKey = "id" | "name" | "company" | "channel" | "status" | "priority" | "owner" | "createdAt" | "updatedAt"
export type FilterField = Exclude<ColumnKey, "id">
export type FilterOperator = "contains" | "not_contains" | "equals" | "not_equals" | "is" | "is_not" | "is_any_of" | "before" | "after" | "between"
export type FilterLogic = "AND" | "OR"

export type EnterpriseRecord = {
  id: string
  name: string
  company: string
  channel: RecordChannel
  status: RecordStatus
  priority: RecordPriority
  owner: string
  createdAt: string
  updatedAt: string
}

export type FilterCondition = {
  id: string
  field: FilterField
  operator: FilterOperator
  value: string
  secondValue?: string
  values?: string[]
}

export type FilterGroup = {
  id: string
  logic: FilterLogic
  conditions: FilterCondition[]
  groups: FilterGroup[]
}

export type SortConfiguration = {
  key: ColumnKey | null
  direction: "asc" | "desc"
}

export type TableDensity = "compact" | "default" | "comfortable"
export type StickyColumnCount = 0 | 1 | 2

export type ViewConfiguration = {
  search: string
  filters: FilterGroup
  sort: SortConfiguration
  visibleColumns: ColumnKey[]
  columnOrder: ColumnKey[]
  density: TableDensity
  stickyFirst: StickyColumnCount
  stickyLast: StickyColumnCount
  groupBy: GroupByKey | "none"
  pageSize: number
}

export type SavedView = {
  id: string
  name: string
  builtIn: boolean
  configuration: ViewConfiguration
}

export const recordStatuses: RecordStatus[] = ["Open", "In review", "Resolved", "On hold"]
export const recordPriorities: RecordPriority[] = ["Urgent", "High", "Normal", "Low"]
export const recordChannels: RecordChannel[] = ["Email", "Web", "Phone", "Partner", "API"]
export const recordOwners = ["Asha Nair", "Marco Silva", "Jin Park", "Elena Rossi", "Omar Haddad", "Lena Weber"]

export const filterFields: { key: FilterField; label: string; type: "text" | "enum" | "date" }[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "company", label: "Company", type: "text" },
  { key: "channel", label: "Channel", type: "enum" },
  { key: "status", label: "Status", type: "enum" },
  { key: "priority", label: "Priority", type: "enum" },
  { key: "owner", label: "Owner", type: "enum" },
  { key: "createdAt", label: "Created date", type: "date" },
  { key: "updatedAt", label: "Updated date", type: "date" },
]

export const tableColumns: { key: ColumnKey; label: string; required?: boolean }[] = [
  { key: "id", label: "Record ID", required: true },
  { key: "name", label: "Name", required: true },
  { key: "company", label: "Company" },
  { key: "channel", label: "Channel" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "owner", label: "Owner" },
  { key: "createdAt", label: "Created date" },
  { key: "updatedAt", label: "Updated date" },
]

export const defaultVisibleColumns: ColumnKey[] = ["id", "name", "company", "channel", "status", "priority", "owner", "createdAt"]

const recordSeeds: [string, string, RecordChannel, RecordStatus, RecordPriority, string, string][] = [
  ["Maya Chen", "Northstar Analytics", "Web", "In review", "High", "Asha Nair", "2025-11-04"],
  ["Theo Martin", "Fieldstone Health", "Email", "Open", "Normal", "Marco Silva", "2025-11-12"],
  ["Amara Okafor", "Juniper Financial", "Partner", "On hold", "Urgent", "Jin Park", "2025-11-19"],
  ["Luca Moretti", "Clearwater Systems", "API", "Resolved", "Low", "Elena Rossi", "2025-12-02"],
  ["Priya Shah", "Cedar & Stone", "Phone", "Open", "High", "Omar Haddad", "2025-12-09"],
  ["Elias Berg", "Lumen Freight", "Web", "In review", "Normal", "Lena Weber", "2025-12-18"],
  ["Nora Williams", "Meridian Research", "Email", "Resolved", "Low", "Asha Nair", "2026-01-06"],
  ["Kenji Sato", "Bluebird Commerce", "Partner", "Open", "Urgent", "Marco Silva", "2026-01-13"],
  ["Sofia Alvarez", "Evergreen Energy", "Phone", "On hold", "High", "Jin Park", "2026-01-21"],
  ["Noah Patel", "Atlas Learning", "API", "In review", "Normal", "Elena Rossi", "2026-02-03"],
  ["Iris Laurent", "Silverline Media", "Web", "Open", "Low", "Omar Haddad", "2026-02-11"],
  ["Gabriel Costa", "Redwood Mobility", "Email", "Resolved", "High", "Lena Weber", "2026-02-20"],
  ["Zara Ibrahim", "Summit Robotics", "Partner", "In review", "Urgent", "Asha Nair", "2026-03-02"],
  ["Felix Bauer", "Harborlight Hotels", "Phone", "Open", "Normal", "Marco Silva", "2026-03-10"],
  ["Ava Thompson", "Brightpath Legal", "API", "On hold", "High", "Jin Park", "2026-03-17"],
  ["Mateo Rivera", "Willow Foods", "Web", "Resolved", "Low", "Elena Rossi", "2026-03-26"],
  ["Yuna Kim", "Pioneer Labs", "Email", "In review", "High", "Omar Haddad", "2026-04-04"],
  ["Oliver James", "Cobalt Networks", "Partner", "Open", "Normal", "Lena Weber", "2026-04-12"],
  ["Leila Hassan", "Mosaic Health", "Phone", "Resolved", "Urgent", "Asha Nair", "2026-04-20"],
  ["Arthur Nguyen", "Granite Supply", "API", "On hold", "Low", "Marco Silva", "2026-05-01"],
  ["Camila Santos", "Cloudberry Studio", "Web", "Open", "High", "Jin Park", "2026-05-09"],
  ["Hugo Fischer", "Eastwind Logistics", "Email", "In review", "Normal", "Elena Rossi", "2026-05-18"],
  ["Mina Park", "Golden Hour Retail", "Partner", "Resolved", "Low", "Omar Haddad", "2026-05-26"],
  ["Isaac Cohen", "Openwater Security", "Phone", "Open", "Urgent", "Lena Weber", "2026-06-04"],
  ["Freya Olsen", "Redfern Consulting", "API", "On hold", "High", "Asha Nair", "2026-06-13"],
  ["Ravi Desai", "Kite & Harbor", "Web", "In review", "Normal", "Marco Silva", "2026-06-21"],
  ["Elena Petrova", "Crownpeak Manufacturing", "Email", "Open", "Low", "Jin Park", "2026-07-01"],
  ["Samir Haddad", "Daybreak Telecom", "Partner", "Resolved", "High", "Elena Rossi", "2026-07-10"],
  ["Chloe Dubois", "Ironwood Design", "Phone", "In review", "Urgent", "Omar Haddad", "2026-07-18"],
  ["David Kimani", "Maple Leaf Travel", "API", "Open", "Normal", "Lena Weber", "2026-07-27"],
  ["Anika Bose", "Wildflower Systems", "Web", "Resolved", "Low", "Asha Nair", "2026-08-05"],
  ["Jonas Lind", "Westbridge Capital", "Email", "On hold", "High", "Marco Silva", "2026-08-14"],
  ["Lucia Romano", "Saffron Digital", "Partner", "Open", "Urgent", "Jin Park", "2026-08-23"],
  ["Ethan Brooks", "Copperline Energy", "Phone", "In review", "Normal", "Elena Rossi", "2026-09-02"],
  ["Farah Ali", "Orchard Point", "API", "Resolved", "High", "Omar Haddad", "2026-09-12"],
  ["Milo Fischer", "Seabright Software", "Web", "Open", "Low", "Lena Weber", "2026-09-22"],
]

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export const demoRecords: EnterpriseRecord[] = recordSeeds.map(([name, company, channel, status, priority, owner, createdAt], index) => ({
  id: `REC-${2401 + index}`,
  name,
  company,
  channel,
  status,
  priority,
  owner,
  createdAt,
  updatedAt: addDays(createdAt, (index * 5) % 18 + 1),
}))

function savedFilter(id: string, field: FilterField, operator: FilterOperator, value: string, values?: string[]): FilterGroup {
  return {
    id: `root-${id}`,
    logic: "AND",
    conditions: [{ id: `condition-${id}`, field, operator, value, values }],
    groups: [],
  }
}

export const defaultConfiguration: ViewConfiguration = {
  search: "",
  filters: { id: "root-default", logic: "AND", conditions: [], groups: [] },
  sort: { key: "createdAt", direction: "desc" },
  visibleColumns: [...defaultVisibleColumns],
  columnOrder: tableColumns.map(({ key }) => key),
  density: "default",
  stickyFirst: 0,
  stickyLast: 0,
  groupBy: "none",
  pageSize: 10,
}

export const demoSavedViews: SavedView[] = [
  { id: "all-records", name: "All Records", builtIn: true, configuration: defaultConfiguration },
  {
    id: "priority-queue",
    name: "Priority Queue",
    builtIn: true,
    configuration: {
      ...defaultConfiguration,
      filters: savedFilter("priority", "priority", "is_any_of", "", ["Urgent", "High"]),
      sort: { key: "priority", direction: "asc" },
      groupBy: "status",
    },
  },
  {
    id: "review-by-owner",
    name: "Review by Owner",
    builtIn: true,
    configuration: {
      ...defaultConfiguration,
      filters: savedFilter("review", "status", "is", "In review"),
      sort: { key: "owner", direction: "asc" },
      groupBy: "owner",
      visibleColumns: ["id", "name", "company", "status", "priority", "owner", "updatedAt"],
    },
  },
]
