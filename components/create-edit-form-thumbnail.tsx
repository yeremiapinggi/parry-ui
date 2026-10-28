import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function CreateEditFormThumbnail() {
  return (
    <div aria-hidden="true" className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-heading text-xs font-semibold sm:text-sm">Create Record</span>
          <span className="truncate text-[9px] text-muted-foreground sm:text-[10px]">Add contact details and assign an owner.</span>
        </div>
        <Badge variant="outline" className="shrink-0 text-[8px] sm:text-[9px]">Create</Badge>
      </div>
      <form className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3 sm:gap-3.5 sm:px-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-semibold sm:text-[10px]">Basic Information</span>
            <span className="text-[8px] text-muted-foreground sm:text-[9px]">Contact details for this record.</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex min-w-0 flex-col gap-1 text-[8px] text-muted-foreground sm:text-[9px]">Full Name <Input tabIndex={-1} readOnly value="" placeholder="e.g. Jordan Lee" className="h-6 px-2 text-[9px] sm:h-7 sm:text-[10px]" /></label>
            <label className="flex min-w-0 flex-col gap-1 text-[8px] text-muted-foreground sm:text-[9px]">Email Address <Input tabIndex={-1} readOnly value="" placeholder="name@example.com" className="h-6 px-2 text-[9px] sm:h-7 sm:text-[10px]" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex min-w-0 flex-col gap-1 text-[8px] text-muted-foreground sm:text-[9px]">Phone Number <Input tabIndex={-1} readOnly value="" placeholder="Optional" className="h-6 px-2 text-[9px] sm:h-7 sm:text-[10px]" /></label>
            <label className="flex min-w-0 flex-col gap-1 text-[8px] text-muted-foreground sm:text-[9px]">Record Type
              <Select value="Prospect" disabled><SelectTrigger tabIndex={-1} className="h-6 w-full px-2 text-[9px] sm:h-7 sm:text-[10px]"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup><SelectItem value="Prospect">Prospect</SelectItem></SelectGroup></SelectContent></Select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-[8px] text-muted-foreground sm:text-[9px]">Description <Textarea tabIndex={-1} readOnly value="" placeholder="Add context for this contact..." className="min-h-8 px-2 py-1 text-[8px] sm:text-[9px]" /></label>
        </div>
        <div className="flex flex-col gap-2 border-t pt-2">
          <div className="flex flex-col gap-1"><span className="text-[9px] font-semibold sm:text-[10px]">Assignment &amp; Relationship</span><span className="text-[8px] text-muted-foreground sm:text-[9px]">Connect the record to your team.</span></div>
          <div className="grid grid-cols-2 gap-2 text-[8px] sm:text-[9px]">
            <span className="flex h-6 items-center justify-between rounded-md border bg-card px-2 sm:h-7">Company <span className="text-muted-foreground">⌄</span></span>
            <span className="flex h-6 items-center justify-between rounded-md border bg-card px-2 sm:h-7">Owner <span className="text-muted-foreground">⌄</span></span>
          </div>
        </div>
        <div className="mt-auto flex justify-end gap-1.5 border-t pt-2">
          <span className="rounded border px-2 py-1 text-[8px] text-muted-foreground sm:text-[9px]">Reset Changes</span>
          <span className="rounded bg-primary px-2 py-1 text-[8px] text-primary-foreground sm:text-[9px]">Create Record</span>
        </div>
      </form>
    </div>
  )
}
