const sampleRows = [
  { rank: "01", name: "Studio Nusa", platform: "Instagram", mentions: "12.4k", rate: "13.0%", move: "+2" },
  { rank: "02", name: "Aster Running", platform: "TikTok", mentions: "11.8k", rate: "12.7%", move: "−1" },
  { rank: "03", name: "Morrow Coffee", platform: "Instagram", mentions: "10.9k", rate: "12.1%", move: "—" },
]

export function RankingAnalyticsTableThumbnail() {
  return (
    <div aria-hidden="true" className="font-data flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      <div className="flex items-start justify-between gap-3 border-b px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-heading text-xs font-semibold sm:text-sm">Performance Ranking</span><span className="truncate text-[9px] text-muted-foreground sm:text-[10px]">Social account performance · Last 30 days</span></div>
        <span className="shrink-0 rounded-md border px-2 py-1 text-[9px] text-muted-foreground">Export CSV</span>
      </div>
      <div className="flex items-center gap-1.5 border-b px-3 py-2 sm:px-4">
        <span className="min-w-0 flex-1 truncate rounded border bg-background px-2 py-1 text-[9px] text-muted-foreground">Search accounts</span>
        <span className="rounded border bg-secondary px-2 py-1 text-[9px] text-secondary-foreground">30D</span>
        <span className="hidden rounded border px-2 py-1 text-[9px] text-muted-foreground sm:inline">Platforms</span>
        <span className="hidden rounded border px-2 py-1 text-[9px] text-muted-foreground md:inline">Rank by Engagement</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pt-1 sm:px-3">
        <div className="grid grid-cols-[minmax(48px,.45fr)_minmax(90px,1.3fr)_minmax(48px,.65fr)_minmax(56px,.7fr)] items-center gap-2 border-b px-2 py-2 text-[8px] font-medium text-muted-foreground sm:grid-cols-[minmax(48px,.45fr)_minmax(110px,1.3fr)_minmax(60px,.65fr)_minmax(68px,.7fr)_minmax(58px,.6fr)] sm:text-[9px]">
          <span>RANK</span><span>ACCOUNT</span><span className="text-right">MENTIONS</span><span className="text-right">ENGAGEMENT</span><span className="hidden text-right sm:block">RATE</span>
        </div>
        {sampleRows.map((row) => (
          <div key={row.name} className="grid grid-cols-[minmax(48px,.45fr)_minmax(90px,1.3fr)_minmax(48px,.65fr)_minmax(56px,.7fr)] items-center gap-2 border-b px-2 py-2.5 text-[9px] last:border-0 sm:grid-cols-[minmax(48px,.45fr)_minmax(110px,1.3fr)_minmax(60px,.65fr)_minmax(68px,.7fr)_minmax(58px,.6fr)] sm:text-[10px]">
            <span className="flex items-center gap-1 font-mono tabular-nums"><span>{row.rank}</span><span className={row.move.startsWith("+") ? "text-success" : "text-muted-foreground"}>{row.move}</span></span>
            <span className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-medium">{row.name}</span><span className="truncate text-[8px] text-muted-foreground">{row.platform}</span></span>
            <span className="text-right font-mono tabular-nums">{row.mentions}</span>
            <span className="text-right font-mono tabular-nums">{row.rate}</span>
            <span className="hidden text-right font-mono tabular-nums sm:block">{row.rate}</span>
          </div>
        ))}
        <div className="mt-auto flex items-center justify-between border-t px-2 py-2 text-[8px] text-muted-foreground"><span>20 accounts · fictional demo</span><span>1 / 3&nbsp;&nbsp; ‹ &nbsp; ›</span></div>
      </div>
    </div>
  )
}
