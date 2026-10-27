import { BookmarkIcon, MailIcon, MessageCircleMoreIcon, MessagesSquareIcon } from "lucide-react"

const rows = [
  { initials: "AO", name: "Amara Okafor", id: "CNV-2048", channel: "WhatsApp", status: "Open", priority: "Urgent", sla: "Breached", icon: MessagesSquareIcon },
  { initials: "MC", name: "Maya Chen", id: "CNV-2047", channel: "Email", status: "In Progress", priority: "High", sla: "At Risk", icon: MailIcon },
  { initials: "TM", name: "Theo Martin", id: "CNV-2046", channel: "Web Chat", status: "Pending", priority: "Medium", sla: "Normal", icon: MessageCircleMoreIcon },
]

export function ConversationTableThumbnail() {
  return <div aria-hidden="true" className="flex h-full flex-col bg-card text-left">
    <div className="flex items-center justify-between border-b px-3 py-2.5">
      <div className="flex flex-col gap-0.5"><span className="text-[11px] font-semibold">Conversations</span><span className="text-[8px] text-muted-foreground">Monitor customer conversations across channels</span></div>
      <span className="rounded-md bg-primary px-2 py-1 text-[8px] font-medium text-primary-foreground">+ New conversation</span>
    </div>
    <div className="flex items-center gap-1.5 border-b px-3 py-2">
      <span className="rounded border bg-background px-1.5 py-1 text-[8px] text-muted-foreground">⌕ Search conversations</span>
      <span className="rounded border bg-background px-1.5 py-1 text-[8px] text-muted-foreground">Channel</span>
      <span className="rounded border bg-background px-1.5 py-1 text-[8px] text-muted-foreground">Priority</span>
    </div>
    <div className="flex items-center gap-1 border-b px-3 py-1.5 text-[8px] text-muted-foreground"><span className="rounded bg-muted px-2 py-1 text-foreground">All</span><span className="px-1.5 py-1">Open</span><span className="px-1.5 py-1">In Progress</span><span className="px-1.5 py-1">Pending</span><span className="px-1.5 py-1">Closed</span></div>
    <div className="grid grid-cols-[1fr_1.7fr_0.85fr_0.75fr_0.7fr] gap-2 border-b bg-muted/50 px-3 py-1.5 text-[7px] font-medium uppercase tracking-wide text-muted-foreground"><span>Conversation</span><span>Customer</span><span>Channel</span><span>Status</span><span>SLA</span></div>
    {rows.map((row) => {
      const Icon = row.icon
      return <div key={row.id} className="grid grid-cols-[1fr_1.7fr_0.85fr_0.75fr_0.7fr] items-center gap-2 border-b px-3 py-2 last:border-0">
        <span className="flex items-center gap-1 font-mono text-[7px] text-muted-foreground">{row.id}{row.id === "CNV-2048" && <BookmarkIcon className="size-2.5 fill-current text-primary" />}</span>
        <span className="flex min-w-0 items-center gap-1.5"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[7px]">{row.initials}</span><span className="min-w-0 truncate text-[8px] font-medium">{row.name}</span></span>
        <span className="flex items-center gap-1 text-[7px] text-muted-foreground"><Icon className="size-2.5" />{row.channel}</span>
        <span className={`w-fit rounded-full border px-1.5 py-0.5 text-[7px] ${row.status === "Open" ? "border-border bg-secondary text-secondary-foreground" : row.status === "In Progress" ? "border-info/30 bg-info-soft text-info" : "border-warning/30 bg-warning-soft text-warning"}`}>{row.status}</span>
        <span className={`flex items-center gap-1 text-[7px] ${row.sla === "Breached" ? "text-destructive" : row.sla === "At Risk" ? "text-warning" : "text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${row.sla === "Breached" ? "bg-destructive" : row.sla === "At Risk" ? "bg-warning" : "bg-success"}`} />{row.sla}</span>
      </div>
    })}
    <div className="mt-auto flex items-center justify-between border-t px-3 py-2 text-[7px] text-muted-foreground"><span>12 conversations</span><span>Page 1 of 3　 ›</span></div>
  </div>
}
