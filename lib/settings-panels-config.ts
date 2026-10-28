import {
  BellRingIcon,
  Building2Icon,
  MonitorCogIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from "lucide-react"

export type SettingsValues = {
  workspaceName: string
  workspaceDescription: string
  workspaceId: string
  language: string
  timezone: string
  emailNotifications: boolean
  notificationFrequency: string
  alertPreferences: string[]
  defaultView: string
  displayDensity: string
  automaticRefresh: boolean
  sessionTimeout: string
  sensitiveConfirmation: boolean
}

export type SettingKey = keyof SettingsValues
export type SectionId = "general" | "notifications" | "preferences" | "security"
type FieldOption = { value: string; label: string; description?: string }
export type SettingField = {
  key: SettingKey
  label: string
  type: "input" | "textarea" | "select" | "switch" | "radio" | "checkbox-group"
  description?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  options?: FieldOption[]
}
export type SettingsSection = {
  id: SectionId
  title: string
  description: string
  icon: LucideIcon
  fields: SettingField[]
}

export function createDefaultSettingsValues(): SettingsValues {
  return {
    workspaceName: "Northstar Workspace",
    workspaceDescription: "A shared space for the Northstar team.",
    workspaceId: "ws_northstar_01",
    language: "en",
    timezone: "america-los-angeles",
    emailNotifications: true,
    notificationFrequency: "immediately",
    alertPreferences: ["security", "mentions"],
    defaultView: "overview",
    displayDensity: "comfortable",
    automaticRefresh: true,
    sessionTimeout: "8-hours",
    sensitiveConfirmation: true,
  }
}

export const settingsPanelSections: SettingsSection[] = [
  {
    id: "general",
    title: "General",
    description: "Manage your workspace identity and regional defaults.",
    icon: Building2Icon,
    fields: [
      { key: "workspaceName", label: "Workspace Name", type: "input", required: true, placeholder: "Enter a workspace name" },
      { key: "workspaceDescription", label: "Workspace Description", type: "textarea", description: "A short description to help your team identify this workspace.", placeholder: "Describe this workspace" },
      { key: "workspaceId", label: "Workspace ID", type: "input", disabled: true, description: "This read-only identifier is assigned automatically." },
      { key: "language", label: "Default Language", type: "select", options: [{ value: "en", label: "English" }, { value: "id", label: "Bahasa Indonesia" }, { value: "ja", label: "Japanese" }, { value: "fr", label: "French" }] },
      { key: "timezone", label: "Timezone", type: "select", options: [{ value: "america-los-angeles", label: "Pacific Time (US & Canada)" }, { value: "america-new-york", label: "Eastern Time (US & Canada)" }, { value: "europe-london", label: "London" }, { value: "asia-jakarta", label: "Jakarta" }, { value: "asia-tokyo", label: "Tokyo" }] },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Choose which updates reach your inbox and when they arrive.",
    icon: BellRingIcon,
    fields: [
      { key: "emailNotifications", label: "Enable Email Notifications", type: "switch", description: "Receive workspace updates and activity summaries by email." },
      { key: "notificationFrequency", label: "Notification Frequency", type: "radio", options: [{ value: "immediately", label: "Immediately", description: "Send an email as soon as an update occurs." }, { value: "daily", label: "Daily summary", description: "Collect updates into one daily email." }, { value: "weekly", label: "Weekly summary", description: "Receive a weekly overview of activity." }] },
      { key: "alertPreferences", label: "Alert Preferences", type: "checkbox-group", description: "Choose the updates you want to hear about.", options: [{ value: "security", label: "Security alerts", description: "Sign-ins and security-related changes." }, { value: "mentions", label: "Mentions and replies", description: "When someone mentions or replies to you." }, { value: "product", label: "Product updates", description: "New features and workspace improvements." }] },
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Adjust the default workspace experience for your team.",
    icon: MonitorCogIcon,
    fields: [
      { key: "defaultView", label: "Default View", type: "select", options: [{ value: "overview", label: "Overview" }, { value: "activity", label: "Activity" }, { value: "projects", label: "Projects" }] },
      { key: "displayDensity", label: "Display Density", type: "radio", options: [{ value: "comfortable", label: "Comfortable", description: "More breathing room between items." }, { value: "compact", label: "Compact", description: "Show more information at a glance." }] },
      { key: "automaticRefresh", label: "Automatic Refresh", type: "switch", description: "Keep workspace information up to date automatically." },
    ],
  },
  {
    id: "security",
    title: "Security",
    description: "Set session behavior and protect sensitive workspace actions.",
    icon: ShieldCheckIcon,
    fields: [
      { key: "sessionTimeout", label: "Session Timeout", type: "select", options: [{ value: "30-minutes", label: "30 minutes" }, { value: "1-hour", label: "1 hour" }, { value: "8-hours", label: "8 hours" }, { value: "24-hours", label: "24 hours" }] },
      { key: "sensitiveConfirmation", label: "Require Confirmation for Sensitive Actions", type: "switch", description: "Ask for an extra confirmation before sensitive changes." },
    ],
  },
]

export const settingsPanelSectionById = Object.fromEntries(
  settingsPanelSections.map((section) => [section.id, section]),
) as Record<SectionId, SettingsSection>
