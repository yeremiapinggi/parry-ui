import { CheckCircle2Icon, EllipsisIcon, Globe2Icon, Link2Icon, WebhookIcon } from "lucide-react"

export function IntegrationConnectionThumbnail() {
  const rows = [
    { name: "Northstar CRM", type: "REST API", status: "Connected", Icon: Globe2Icon },
    { name: "Meridian Events", type: "Webhook", status: "Connected", Icon: WebhookIcon },
    { name: "Atlas Identity", type: "OAuth Application", status: "Disconnected", Icon: Link2Icon },
  ]

  return (
    <div aria-hidden="true" data-parry-theme className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-data text-xs font-semibold sm:text-sm">Integrations</span>
          <span className="truncate text-[9px] text-muted-foreground sm:text-[10px]">Manage service connections and authentication.</span>
        </div>
        <span className="shrink-0 rounded-md bg-primary px-2 py-1 text-[8px] font-medium text-primary-foreground sm:px-2.5 sm:text-[9px]">+ Add Connection</span>
      </div>
      <div className="flex items-center gap-2 border-b px-4 py-2 sm:px-5">
        <span className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md border bg-card px-2 text-[8px] text-muted-foreground sm:h-7 sm:text-[9px]">⌕ <span className="truncate">Search connections...</span></span>
        <span className="flex shrink-0 gap-1"><span className="rounded bg-secondary px-1.5 py-1 text-[7px] sm:text-[8px]">All</span><span className="hidden rounded border px-1.5 py-1 text-[7px] text-muted-foreground sm:block sm:text-[8px]">Connected</span></span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3 sm:gap-2.5 sm:p-4">
        {rows.map(({ name, type, status, Icon }) => (
          <div key={name} className="flex min-w-0 items-center gap-2 rounded-md border bg-card p-2 sm:gap-3 sm:p-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded bg-secondary text-secondary-foreground sm:size-7"><Icon className="size-3.5 sm:size-4" /></span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex min-w-0 items-center gap-1.5"><span className="truncate text-[8px] font-medium sm:text-[9px]">{name}</span><span className={`hidden shrink-0 rounded-full px-1.5 py-0.5 text-[7px] sm:block ${status === "Connected" ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}>{status}</span></span>
              <span className="truncate text-[7px] text-muted-foreground sm:text-[8px]">{type} · API Key · Tested 4m ago</span>
            </span>
            <EllipsisIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t px-4 py-2 text-[8px] text-muted-foreground sm:px-5 sm:text-[9px]">
        <CheckCircle2Icon className="size-3 shrink-0 text-success" />Connection tests are simulated in this preview.
      </div>
    </div>
  )
}
