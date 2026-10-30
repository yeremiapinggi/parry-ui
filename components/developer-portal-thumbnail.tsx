import { AppWindowIcon, ChevronRightIcon } from "lucide-react"

export function DeveloperPortalThumbnail() {
  const bars = [38, 52, 44, 61, 57, 70, 66, 78, 72, 85]

  return (
    <div aria-hidden="true" data-parry-theme className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      <div className="flex w-1/4 shrink-0 flex-col gap-1.5 bg-sidebar p-2.5 text-[7px] text-sidebar-foreground sm:text-[8px]">
        <span className="mb-1 font-semibold text-sidebar-accent-foreground">Developer Portal</span>
        <span className="rounded border-l-2 border-sidebar-primary bg-sidebar-accent px-1.5 py-1 text-sidebar-accent-foreground">Overview</span>
        {["Apps", "Webhooks", "Usage", "Logs"].map((label) => <span key={label} className="px-1.5 py-0.5">{label}</span>)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-data text-[9px] font-semibold sm:text-xs">Hello, Ivosights Dev</span>
          <span className="shrink-0 rounded bg-primary px-1.5 py-0.5 text-[7px] text-primary-foreground sm:text-[8px]">+ Create app</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[["Requests", "254,310"], ["Error rate", "1.84%"], ["Apps", "3"]].map(([label, value]) => (
            <span key={label} className="flex flex-col rounded border bg-card p-1.5">
              <span className="text-[6px] text-muted-foreground sm:text-[7px]">{label}</span>
              <span className="font-data text-[9px] font-semibold sm:text-[11px]">{value}</span>
            </span>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 gap-1.5">
          <span className="flex flex-1 items-end gap-0.5 rounded border bg-card p-1.5">
            {bars.map((height, index) => <span key={index} className="flex-1 rounded-sm bg-chart-2/70" style={{ height: `${height}%` }} />)}
          </span>
          <span className="hidden w-2/5 flex-col gap-1 rounded border bg-card p-1.5 sm:flex">
            {["sociomile-demo", "IvoDevJNE", "IvosightsDev"].map((name) => (
              <span key={name} className="flex items-center gap-1 text-[7px]">
                <AppWindowIcon className="size-2.5 shrink-0 text-muted-foreground" /><span className="flex-1 truncate">{name}</span><ChevronRightIcon className="size-2.5 text-muted-foreground" />
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}
