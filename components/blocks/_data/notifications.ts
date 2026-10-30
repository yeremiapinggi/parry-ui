export type Notification = { id: string; kind: "assignment" | "escalation"; title: string; ticket: number; time: string; unread: boolean }

export const notifications: Notification[] = [
  { id: "n1", kind: "assignment", title: "Ticket assigned to you by system", ticket: 380, time: "2m ago", unread: true },
  { id: "n2", kind: "escalation", title: "Escalated to Dealer Support", ticket: 377, time: "18m ago", unread: true },
  { id: "n3", kind: "assignment", title: "Dewi Lestari released a ticket to you", ticket: 372, time: "1h ago", unread: true },
  { id: "n4", kind: "escalation", title: "Out SLA: no reply for 2h", ticket: 365, time: "2h ago", unread: false },
]
