import { ArrowRightIcon, CheckIcon, FileSpreadsheetIcon, UploadIcon } from "lucide-react"
import { cn } from "cn"

export function BulkImportWizardThumbnail() {
  return (
    <div aria-hidden="true" className="flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-heading text-sm font-semibold sm:text-base">Import contacts</span>
          <span className="truncate text-[10px] text-muted-foreground sm:text-xs">Bring structured records into your workspace.</span>
        </div>
        <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-[9px] font-medium text-secondary-foreground sm:text-[10px]">Demo import</span>
      </header>
      <div className="grid grid-cols-4 gap-1.5 border-b px-4 py-2.5 sm:gap-2 sm:px-5">
        {["Upload", "Map", "Review", "Results"].map((step, index) => (
          <div key={step} className={cn("flex min-w-0 items-center gap-1 rounded border px-1.5 py-1 text-[8px] sm:gap-1.5 sm:px-2 sm:text-[9px]", index === 0 ? "border-primary bg-secondary text-secondary-foreground" : "text-muted-foreground")}>
            <span className={cn("flex size-3.5 shrink-0 items-center justify-center rounded-full text-[8px]", index === 0 ? "bg-primary text-primary-foreground" : "bg-muted")}>{index === 0 ? <CheckIcon className="size-2.5" /> : index + 1}</span>
            <span className="truncate">{step}</span>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5"><span className="text-xs font-semibold">Upload a file</span><span className="text-[9px] text-muted-foreground sm:text-[10px]">Choose a CSV or XLSX spreadsheet.</span></div>
          <FileSpreadsheetIcon className="size-5 shrink-0 text-muted-foreground" />
        </div>
        <div className="flex min-h-20 flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/20 p-3 text-center sm:min-h-24">
          <span className="flex size-7 items-center justify-center rounded-md border bg-background"><UploadIcon className="size-3.5 text-muted-foreground" /></span>
          <span className="text-[9px] font-medium sm:text-[10px]">Drop your file here</span>
          <span className="text-[8px] text-muted-foreground sm:text-[9px]">or browse files · up to 10 MB</span>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-2">
          <span className="flex min-w-0 items-center gap-2"><FileSpreadsheetIcon className="size-3.5 shrink-0 text-muted-foreground" /><span className="truncate text-[9px] font-medium sm:text-[10px]">contacts-q2.csv</span></span>
          <span className="shrink-0 text-[8px] text-muted-foreground sm:text-[9px]">4 rows · 1.2 KB</span>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 rounded-lg border bg-background p-2 shadow-md sm:p-2.5">
        <span className="text-[8px] text-muted-foreground sm:text-[9px]">Step 1 of 4 · File ready</span>
        <span className="flex items-center gap-1 rounded bg-primary px-1.5 py-1 text-[7px] text-primary-foreground sm:px-2 sm:text-[8px]">Continue <ArrowRightIcon className="size-2.5" /></span>
      </div>
    </div>
  )
}
