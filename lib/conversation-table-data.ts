export type ConversationStatus = "Open" | "In Progress" | "Pending" | "Closed"
export type ConversationPriority = "Low" | "Medium" | "High" | "Urgent"
export type ConversationChannel = "WhatsApp" | "Email" | "Web Chat"
export type SlaStatus = "Normal" | "At Risk" | "Breached"

export type ConversationAttachment = {
  name: string
  type: string
  size: number
  sizeLabel?: string
  url?: string
}

export type ConversationMessage = {
  id?: string
  from: "customer" | "agent" | "note"
  body: string
  time: string
  date?: string
  delivery?: "sending" | "sent" | "failed"
  attachments?: ConversationAttachment[]
}

export type Conversation = {
  id: string
  customer: string
  initials: string
  email: string
  company: string
  channel: ConversationChannel
  status: ConversationStatus
  priority: ConversationPriority
  assignee: string | null
  preview: string
  lastMessage: string
  lastMessageAt: string
  sla: SlaStatus
  bookmarked: boolean
  messages: ConversationMessage[]
  unreadCount?: number
  phone?: string
  tags?: string[]
  category?: string
}

export const conversationStatuses: ConversationStatus[] = ["Open", "In Progress", "Pending", "Closed"]
export const conversationPriorities: ConversationPriority[] = ["Low", "Medium", "High", "Urgent"]
export const conversationChannels: ConversationChannel[] = ["WhatsApp", "Email", "Web Chat"]
export const conversationAssignees = ["Naomi Reed", "Asha Nair", "Marco Silva", "Jin Park", "Elena Rossi"]

const messages = (
  customer: string,
  first: string,
  second: string,
  third: string,
): ConversationMessage[] => [
  { from: "customer", body: first.trim() || `Message from ${customer}`, time: "10:14 AM", date: "2026-10-27" },
  { from: "agent", body: second, time: "10:18 AM", date: "2026-10-27", delivery: "sent" },
  { from: "customer", body: third, time: "10:22 AM", date: "2026-10-27" },
]

export const demoConversations: Conversation[] = [
  { id: "CNV-2048", customer: "Amara Okafor", initials: "AO", email: "amara.okafor@example.com", phone: "+1 (415) 555-0198", company: "Juniper Financial", channel: "WhatsApp", status: "Open", priority: "Urgent", assignee: "Asha Nair", preview: "I still can’t access my account after the reset…", lastMessage: "3 min ago", lastMessageAt: "2026-10-27T10:22:00", sla: "Breached", bookmarked: true, unreadCount: 0, tags: ["Account access", "Priority customer"], category: "Account support", messages: messages("Amara Okafor", "I still can’t access my account after the reset.", "I’m checking the sign-in logs now. Could you confirm the email on the account?", "It’s the one ending in .com. I have a payment due today.") },

  { id: "CNV-2047", customer: "Maya Chen", initials: "MC", email: "maya.chen@example.com", phone: "+1 (212) 555-0124", company: "Northstar Analytics", channel: "Email", status: "In Progress", priority: "High", assignee: "Marco Silva", preview: "Could you share the updated invoice for October?", lastMessage: "12 min ago", lastMessageAt: "2026-10-27T10:13:00", sla: "At Risk", bookmarked: false, unreadCount: 2, tags: ["Billing", "Invoice"], category: "Billing inquiry", messages: messages("Maya Chen", "Could you share the updated invoice for October?", "I’ve found the revised invoice and will send it over shortly.", "Thanks. Please make sure the billing address is updated too.") },

  { id: "CNV-2046", customer: "Theo Martin", initials: "TM", email: "theo.martin@example.com", phone: "+1 (617) 555-0138", company: "Fieldstone Health", channel: "Web Chat", status: "Pending", priority: "Medium", assignee: "Jin Park", preview: "We’re waiting on the security review from your team.", lastMessage: "28 min ago", lastMessageAt: "2026-10-27T09:57:00", sla: "Normal", bookmarked: false, unreadCount: 1, tags: ["Security", "Review"], category: "Technical support", messages: messages("Theo Martin", "We’re waiting on the security review from your team.", "I’ve asked our security team for an update and will follow up here.", "Appreciate it. We need the review before Friday.") },

  { id: "CNV-2045", customer: "Priya Shah", initials: "PS", email: "priya.shah@example.com", phone: "+1 (503) 555-0177", company: "Cedar & Stone", channel: "WhatsApp", status: "Open", priority: "High", assignee: null, preview: "The delivery arrived, but two items are missing.", lastMessage: "41 min ago", lastMessageAt: "2026-10-27T09:44:00", sla: "At Risk", bookmarked: false, unreadCount: 1, tags: ["Order 78422", "Missing items"], category: "Order issue", messages: messages("Priya Shah", "The delivery arrived, but two items are missing.", "I’m sorry about that. Could you send the order number so I can investigate?", "Order 78422. The lamp and the small tray are missing.").map((message, index) => index === 0 ? { ...message, attachments: [{ name: "delivery-photo.png", type: "image/png", size: 184320, sizeLabel: "180 KB", url: "/images/conversation-package-demo.png" }] } : message) },

  { id: "CNV-2044", customer: "Luca Moretti", initials: "LM", email: "luca.moretti@example.com", company: "Clearwater Systems", channel: "Email", status: "Closed", priority: "Low", assignee: "Elena Rossi", preview: "That fixed it, thank you for the quick help.", lastMessage: "1 hr ago", lastMessageAt: "2026-10-27T09:01:00", sla: "Normal", bookmarked: false, messages: messages("Luca Moretti", "The dashboard export is missing the date column.", "The export setting is updated. Please try downloading it again.", "That fixed it, thank you for the quick help.") },
  { id: "CNV-2043", customer: "Zara Ibrahim", initials: "ZI", email: "zara.ibrahim@example.com", company: "Summit Robotics", channel: "Web Chat", status: "In Progress", priority: "Urgent", assignee: "Naomi Reed", preview: "Our workspace is showing duplicate seats on the bill.", lastMessage: "1 hr ago", lastMessageAt: "2026-10-27T08:42:00", sla: "Breached", bookmarked: true, messages: messages("Zara Ibrahim", "Our workspace is showing duplicate seats on the bill.", "I’m reviewing your workspace membership and the latest invoice.", "We removed two users last week, but they are still listed.") },
  { id: "CNV-2042", customer: "Nora Williams", initials: "NW", email: "nora.williams@example.com", company: "Meridian Research", channel: "Email", status: "Pending", priority: "Low", assignee: "Asha Nair", preview: "I’ve attached the signed agreement for your records.", lastMessage: "2 hrs ago", lastMessageAt: "2026-10-27T08:02:00", sla: "Normal", bookmarked: false, messages: messages("Nora Williams", "I’ve attached the signed agreement for your records.", "Received. Our team will countersign and return a copy.", "Perfect, thank you.") },
  { id: "CNV-2041", customer: "Kenji Sato", initials: "KS", email: "kenji.sato@example.com", company: "Bluebird Commerce", channel: "WhatsApp", status: "Open", priority: "Medium", assignee: "Marco Silva", preview: "Can I change the delivery address on my order?", lastMessage: "3 hrs ago", lastMessageAt: "2026-10-27T07:34:00", sla: "Normal", bookmarked: false, messages: messages("Kenji Sato", "Can I change the delivery address on my order?", "I can check whether the package has left our warehouse.", "It hasn’t shipped yet. The new address is in the last message.") },
  { id: "CNV-2040", customer: "Sofia Alvarez", initials: "SA", email: "sofia.alvarez@example.com", company: "Evergreen Energy", channel: "Web Chat", status: "In Progress", priority: "High", assignee: "Jin Park", preview: "The usage report doesn’t match our meter readings.", lastMessage: "4 hrs ago", lastMessageAt: "2026-10-27T06:50:00", sla: "At Risk", bookmarked: false, messages: messages("Sofia Alvarez", "The usage report doesn’t match our meter readings.", "I can help reconcile that. Please share the report date range.", "It covers the first two weeks of October.") },
  { id: "CNV-2039", customer: "Iris Laurent", initials: "IL", email: "iris.laurent@example.com", company: "Silverline Media", channel: "Email", status: "Closed", priority: "Medium", assignee: null, preview: "Confirmed — the new contact has been added.", lastMessage: "Yesterday", lastMessageAt: "2026-10-26T16:12:00", sla: "Normal", bookmarked: false, messages: messages("Iris Laurent", "Please add our new finance contact to the account.", "I’ve sent an invitation to the address provided.", "Confirmed — the new contact has been added.") },
  { id: "CNV-2038", customer: "Gabriel Costa", initials: "GC", email: "gabriel.costa@example.com", company: "Redwood Mobility", channel: "WhatsApp", status: "Pending", priority: "Urgent", assignee: "Elena Rossi", preview: "The replacement part hasn’t arrived yet.", lastMessage: "Yesterday", lastMessageAt: "2026-10-26T14:40:00", sla: "Breached", bookmarked: true, messages: messages("Gabriel Costa", "The replacement part hasn’t arrived yet.", "I’ve opened a shipment trace with our delivery partner.", "Could you let me know when you hear back?") },
  { id: "CNV-2037", customer: "Ava Thompson", initials: "AT", email: "ava.thompson@example.com", company: "Brightpath Legal", channel: "Web Chat", status: "Open", priority: "Low", assignee: "Naomi Reed", preview: "Where can I download a copy of last month’s report?", lastMessage: "Yesterday", lastMessageAt: "2026-10-26T12:05:00", sla: "Normal", bookmarked: false, messages: messages("Ava Thompson", "Where can I download a copy of last month’s report?", "Open Reports, then choose the month from the date picker.", "Found it. Thanks!") },
]
