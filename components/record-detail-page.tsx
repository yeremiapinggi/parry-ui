"use client"

import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  Building2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDotIcon,
  CopyIcon,
  HistoryIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { companyOptions, ownerOptions, recordTypeOptions, statusOptions, type ContactRecordValues } from "@/lib/create-edit-form-config"
import {
  initialContactActivity,
  initialDetailContacts,
  initialRelatedRecords,
  type ContactActivity,
  type DemoContact,
  type RelatedDemoRecord,
} from "@/lib/record-detail-page-data"

export type RecordDetailPreviewState = "default" | "loading" | "not-found" | "empty"

type RecordDetailPageProps = {
  previewState?: RecordDetailPreviewState
  onPreviewStateChange?: (state: RecordDetailPreviewState) => void
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00.000Z`))
}

function statusClass(status: string) {
  if (status === "Active") return "border-success/30 bg-success-soft text-success"
  if (status === "Pending") return "border-warning/30 bg-warning-soft text-warning"
  if (status === "Archived") return "border-border bg-secondary text-secondary-foreground"
  return "border-muted-foreground/30 bg-muted text-muted-foreground"
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm leading-relaxed">{children}</dd>
    </div>
  )
}

function createCompanyRecord(contact: DemoContact, values: ContactRecordValues = contact.values): RelatedDemoRecord {
  const companyId = values.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  return {
    id: `company-${companyId}`,
    type: "Company",
    title: values.company,
    summary: `${values.recordType} account · Contact relationship`,
    details: [
      { label: "Account owner", value: values.owner || "Unassigned" },
      { label: "Relationship", value: values.recordType },
      { label: "Customer segment", value: values.customerSegment || "Not specified" },
    ],
  }
}

function SectionTitle({ id, icon, children }: { id?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="text-muted-foreground">{icon}</span>
      <h3 id={id} className="text-sm font-semibold">{children}</h3>
    </div>
  )
}

function LoadingState() {
  return (
    <section aria-label="Loading contact record" aria-busy="true" className="mx-auto flex w-full max-w-5xl flex-col gap-5 font-data">
      <div className="flex items-center gap-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-28" /></div>
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4"><Skeleton className="size-14 rounded-full" /><div className="flex flex-col gap-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-52" /></div></div>
          <div className="flex gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-28" /></div>
        </div>
        <Separator className="my-6" />
        <div className="grid gap-8 sm:grid-cols-2"><div className="flex flex-col gap-5"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div><div className="flex flex-col gap-5"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div></div>
      </div>
      <p className="sr-only" role="status">Loading contact details</p>
    </section>
  )
}

export function RecordDetailPage({ previewState = "default", onPreviewStateChange }: RecordDetailPageProps) {
  const [records, setRecords] = useState<DemoContact[]>(() => initialDetailContacts.map((record) => ({ ...record, values: { ...record.values, tags: [...record.values.tags] } })))
  const [selectedId, setSelectedId] = useState<string | null>(initialDetailContacts[0]?.id ?? null)
  const [listOpen, setListOpen] = useState(false)
  const [transitionLoading, setTransitionLoading] = useState(false)
  const [activities, setActivities] = useState<Record<string, ContactActivity[]>>(() => Object.fromEntries(Object.entries(initialContactActivity).map(([id, items]) => [id, [...items]])))
  const [relatedRecords, setRelatedRecords] = useState<Record<string, RelatedDemoRecord[]>>(() => Object.fromEntries(Object.entries(initialRelatedRecords).map(([id, items]) => [id, [...items]])))
  const [globalActivity, setGlobalActivity] = useState<ContactActivity[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [draft, setDraft] = useState<ContactRecordValues | null>(null)
  const [baseline, setBaseline] = useState<ContactRecordValues | null>(null)
  const [relatedTarget, setRelatedTarget] = useState<RelatedDemoRecord | null>(null)

  const contact = records.find((record) => record.id === selectedId) ?? null
  const related = contact ? relatedRecords[contact.id] ?? [] : []
  const contactIndex = records.findIndex((record) => record.id === contact?.id)
  const hasUnsavedChanges = Boolean(draft && baseline && JSON.stringify(draft) !== JSON.stringify(baseline))
  const canSave = Boolean(draft && hasUnsavedChanges && draft.fullName.trim() && /^\S+@\S+\.\S+$/.test(draft.email.trim()))
  const currentStatus = contact ? contact.archived ? "Archived" : contact.values.status : ""
  const activityItems = contact ? activities[contact.id] ?? [] : []

  const directorySummary = useMemo(() => `${records.length} ${records.length === 1 ? "contact" : "contacts"}`, [records.length])

  function addActivity(recordId: string, title: string, description: string) {
    setActivities((current) => ({
      ...current,
      [recordId]: [{ id: `${recordId}-${title}-${(current[recordId]?.length ?? 0) + 1}`, title, description, time: "Just now" }, ...(current[recordId] ?? [])],
    }))
  }

  function startEdit() {
    if (!contact) return
    const values = { ...contact.values, tags: [...contact.values.tags] }
    setDraft(values)
    setBaseline(values)
    setEditOpen(true)
  }

  function requestCloseEdit() {
    if (hasUnsavedChanges) {
      setDiscardOpen(true)
      return
    }
    setEditOpen(false)
    setDraft(null)
    setBaseline(null)
  }

  function discardDraft() {
    setDiscardOpen(false)
    setEditOpen(false)
    setDraft(null)
    setBaseline(null)
  }

  function updateDraft<Key extends keyof ContactRecordValues>(key: Key, value: ContactRecordValues[Key]) {
    setDraft((current) => current ? { ...current, [key]: value } : current)
  }

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contact || !draft || !canSave) return
    setRecords((current) => current.map((record) => record.id === contact.id ? { ...record, values: { ...draft, tags: [...draft.tags] } } : record))
    setRelatedRecords((current) => ({ ...current, [contact.id]: [createCompanyRecord(contact, draft), ...(current[contact.id] ?? []).filter((item) => item.type !== "Company")] }))
    addActivity(contact.id, "Contact updated", "Contact information was edited.")
    setEditOpen(false)
    setDraft(null)
    setBaseline(null)
    toast.success("Contact details saved in this preview.", { position: "bottom-right" })
  }

  function openContact(recordId: string) {
    setSelectedId(recordId)
    setListOpen(false)
    setTransitionLoading(true)
    window.setTimeout(() => setTransitionLoading(false), 240)
  }

  function openDirectory() {
    setListOpen(true)
    setTransitionLoading(false)
  }

  function navigateContact(offset: -1 | 1) {
    const next = records[contactIndex + offset]
    if (next) openContact(next.id)
  }

  function duplicateRecord() {
    if (!contact) return
    const nextNumber = Math.max(0, ...records.map((record) => Number(record.id.match(/(\d+)$/)?.[1] ?? 0))) + 1
    const id = `contact-${String(nextNumber).padStart(3, "0")}`
    const duplicate: DemoContact = {
      ...contact,
      id,
      createdAt: "2026-10-27",
      archived: false,
      values: {
        ...contact.values,
        fullName: `${contact.values.fullName} (Copy)`,
        email: contact.values.email.replace("@", `.copy${nextNumber}@`),
        status: "Active",
        tags: [...contact.values.tags],
      },
    }
    setRecords((current) => [duplicate, ...current])
    setActivities((current) => ({ ...current, [id]: [{ id: `${id}-created`, title: "Contact duplicated", description: `Created from ${contact.values.fullName}.`, time: "Just now" }] }))
    setRelatedRecords((current) => ({ ...current, [id]: [...(current[contact.id] ?? [])] }))
    setSelectedId(id)
    setListOpen(false)
    toast.success("Contact duplicated.", { description: `${duplicate.values.fullName} is now open.`, position: "bottom-right" })
  }

  function archiveRecord() {
    if (!contact) return
    setRecords((current) => current.map((record) => record.id === contact.id ? { ...record, archived: true } : record))
    addActivity(contact.id, "Contact archived", "The record was moved to the archived state.")
    toast.success("Contact archived.", { position: "bottom-right" })
  }

  function restoreRecord() {
    if (!contact) return
    setRecords((current) => current.map((record) => record.id === contact.id ? { ...record, archived: false } : record))
    addActivity(contact.id, "Contact restored", "The record was returned to the active directory.")
    toast.success("Contact restored.", { position: "bottom-right" })
  }

  function deleteRecord() {
    if (!contact) return
    const deleted = contact
    const event = { id: `${deleted.id}-deleted`, title: "Contact deleted", description: `${deleted.values.fullName} was removed from the demo directory.`, time: "Just now" }
    const remaining = records.filter((record) => record.id !== deleted.id)
    setRecords(remaining)
    setSelectedId(remaining[0]?.id ?? null)
    setActivities((current) => { const next = { ...current }; delete next[deleted.id]; return next })
    setRelatedRecords((current) => { const next = { ...current }; delete next[deleted.id]; return next })
    setGlobalActivity((current) => [event, ...current])
    setDeleteOpen(false)
    setListOpen(true)
    toast.success("Contact deleted from this preview.", { position: "bottom-right" })
  }

  function restoreDemoRecords() {
    setRecords(initialDetailContacts.map((record) => ({ ...record, values: { ...record.values, tags: [...record.values.tags] } })))
    setActivities(Object.fromEntries(Object.entries(initialContactActivity).map(([id, items]) => [id, [...items]])))
    setRelatedRecords(Object.fromEntries(Object.entries(initialRelatedRecords).map(([id, items]) => [id, [...items]])))
    setSelectedId(initialDetailContacts[0]?.id ?? null)
    setGlobalActivity([])
    setListOpen(true)
    toast.success("Sample contacts restored.", { position: "bottom-right" })
  }

  if (previewState === "loading") return <LoadingState />

  if (previewState === "not-found") {
    return (
      <section aria-labelledby="record-not-found-heading" className="mx-auto flex min-h-80 w-full max-w-5xl flex-col items-center justify-center gap-4 rounded-xl border bg-card px-5 py-12 text-center font-data">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><UserRoundIcon aria-hidden="true" /></div>
        <div className="flex max-w-md flex-col gap-2"><h2 id="record-not-found-heading" className="text-lg font-semibold">Record not found</h2><p className="text-sm leading-relaxed text-muted-foreground">This contact may have been deleted or the link may be out of date.</p></div>
        {onPreviewStateChange && <Button type="button" variant="outline" onClick={() => onPreviewStateChange("default")}><ArrowLeftIcon data-icon="inline-start" />Return to the demo</Button>}
      </section>
    )
  }

  if (previewState === "empty") {
    return (
      <section aria-labelledby="empty-records-heading" className="mx-auto flex min-h-80 w-full max-w-5xl flex-col items-center justify-center gap-4 rounded-xl border bg-card px-5 py-12 text-center font-data">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><UserRoundIcon aria-hidden="true" /></div>
        <div className="flex max-w-md flex-col gap-2"><h2 id="empty-records-heading" className="text-lg font-semibold">No contacts yet</h2><p className="text-sm leading-relaxed text-muted-foreground">The contact directory is empty. Restore the fictional demo records to explore the detail page.</p></div>
        {onPreviewStateChange && <Button type="button" variant="outline" onClick={() => onPreviewStateChange("default")}><RotateCcwIcon data-icon="inline-start" />Show the default demo</Button>}
      </section>
    )
  }

  if (transitionLoading) return <LoadingState />

  if (listOpen) {
    return (
      <section aria-labelledby="contact-list-heading" className="mx-auto flex w-full max-w-5xl flex-col gap-5 font-data">
        <header className="flex flex-col gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground"><span>Contacts</span></nav>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div className="flex flex-col gap-1"><h2 id="contact-list-heading" className="text-2xl font-semibold tracking-tight">Contacts</h2><p className="text-sm leading-relaxed text-muted-foreground">A fictional directory for exploring record details.</p></div><Badge variant="secondary">{directorySummary}</Badge></div>
        </header>
        {globalActivity.length > 0 && <div aria-live="polite" className="rounded-lg border bg-muted/40 px-4 py-3"><div className="flex items-start gap-3"><HistoryIcon aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" /><div className="flex flex-col gap-1"><p className="text-sm font-medium">{globalActivity[0].title}</p><p className="text-sm leading-relaxed text-muted-foreground">{globalActivity[0].description}</p></div></div></div>}
        {records.length ? (
          <ul className="flex flex-col overflow-hidden rounded-xl border bg-card" aria-label="Contact records">
            {records.map((record, index) => (
              <li key={record.id} className={index > 0 ? "border-t" : ""}>
                <button type="button" onClick={() => openContact(record.id)} className="flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <span className="flex min-w-0 items-center gap-3"><Avatar aria-hidden="true" className="size-10"><AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials(record.values.fullName)}</AvatarFallback></Avatar><span className="flex min-w-0 flex-col gap-1"><span className="truncate text-sm font-semibold">{record.values.fullName}</span><span className="truncate text-sm text-muted-foreground">{record.values.email} · {record.values.company}</span></span></span>
                  <span className="flex items-center gap-3 pl-13 sm:pl-0"><Badge variant="outline" className={statusClass(record.archived ? "Archived" : record.values.status)}>{record.archived ? "Archived" : record.values.status}</Badge><ChevronRightIcon aria-hidden="true" className="size-4 text-muted-foreground" /></span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border bg-card px-5 py-10 text-center"><div className="flex flex-col gap-2"><h3 className="font-semibold">No contacts in this directory</h3><p className="max-w-md text-sm leading-relaxed text-muted-foreground">The demo records were deleted. Restore them to continue exploring this template.</p></div><Button type="button" variant="outline" onClick={restoreDemoRecords}><RotateCcwIcon data-icon="inline-start" />Restore sample contacts</Button></div>
        )}
      </section>
    )
  }

  if (!contact) {
    return (
      <section aria-labelledby="record-not-found-heading" className="mx-auto flex min-h-80 w-full max-w-5xl flex-col items-center justify-center gap-4 rounded-xl border bg-card px-5 py-12 text-center font-data">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><UserRoundIcon aria-hidden="true" /></div>
        <div className="flex max-w-md flex-col gap-2"><h2 id="record-not-found-heading" className="text-lg font-semibold">Record not found</h2><p className="text-sm leading-relaxed text-muted-foreground">This contact is no longer available in the demo directory.</p></div>
        <Button type="button" variant="outline" onClick={openDirectory}><ArrowLeftIcon data-icon="inline-start" />Return to contacts</Button>
      </section>
    )
  }

  return (
    <section aria-label={`Contact details for ${contact.values.fullName}`} className="mx-auto flex w-full max-w-5xl flex-col gap-5 font-data">
      <header className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <button type="button" onClick={openDirectory} className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">Contacts</button>
          <span aria-hidden="true">/</span><span aria-current="page" className="truncate text-foreground">{contact.values.fullName}</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact record</p><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Contact Details</h2><Badge variant="outline" className={statusClass(currentStatus)}>{currentStatus}</Badge></div></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-1">
              <Button type="button" variant="outline" size="icon-sm" aria-label="Previous contact" onClick={() => navigateContact(-1)} disabled={contactIndex <= 0}><ChevronLeftIcon /></Button>
              <span className="min-w-14 text-center text-xs tabular-nums text-muted-foreground">{contactIndex + 1} of {records.length}</span>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Next contact" onClick={() => navigateContact(1)} disabled={contactIndex < 0 || contactIndex >= records.length - 1}><ChevronRightIcon /></Button>
            </div>
            <Button type="button" variant="outline" aria-label="Edit Record" onClick={startEdit}><span className="hidden sm:inline">Edit Record</span><span className="sm:hidden">Edit</span></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button type="button" variant="outline" aria-label="More record actions"><MoreHorizontalIcon data-icon="inline-start" /><span className="hidden sm:inline">More Actions</span></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" data-parry-theme>
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={duplicateRecord}><CopyIcon />Duplicate</DropdownMenuItem>
                  {contact.archived ? <DropdownMenuItem onSelect={restoreRecord}><RotateCcwIcon />Restore</DropdownMenuItem> : <DropdownMenuItem onSelect={archiveRecord}><ArchiveIcon />Archive</DropdownMenuItem>}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup><DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}><Trash2Icon />Delete</DropdownMenuItem></DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border bg-card">
        <section aria-labelledby="record-overview-heading" className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar aria-hidden="true" className="size-14"><AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">{initials(contact.values.fullName)}</AvatarFallback></Avatar>
              <div className="flex min-w-0 flex-col gap-1"><h3 id="record-overview-heading" className="truncate text-lg font-semibold">{contact.values.fullName}</h3><a className="truncate text-sm text-link hover:underline" href={`mailto:${contact.values.email}`}>{contact.values.email}</a></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end"><Badge variant="outline" className={statusClass(currentStatus)}><CircleDotIcon data-icon="inline-start" />{currentStatus}</Badge><Badge variant="secondary">{contact.values.recordType}</Badge>{contact.values.priority !== "Normal" && <Badge variant="outline">{contact.values.priority} priority</Badge>}</div>
          </div>
          <Separator />
          <div className="flex flex-col gap-3"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key details</h3><dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailField label="Company"><button type="button" onClick={() => { const company = related.find((item) => item.type === "Company"); if (company) setRelatedTarget(company) }} className="text-left text-link hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{contact.values.company}</button></DetailField>
            <DetailField label="Owner">{contact.values.owner}</DetailField>
            <DetailField label="Phone"><a className="text-link hover:underline" href={`tel:${contact.values.phone.replace(/[^\d+]/g, "")}`}>{contact.values.phone || "Not provided"}</a></DetailField>
            <DetailField label="Created date">{formattedDate(contact.createdAt)}</DetailField>
          </dl></div>
        </section>

        <Separator />
        <div className="grid gap-0 md:grid-cols-2">
          <section aria-labelledby="contact-information-heading" className="flex flex-col gap-4 p-5 sm:p-6 md:border-r">
            <SectionTitle id="contact-information-heading" icon={<UserRoundIcon className="size-4" />}>Contact Information</SectionTitle>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2"><DetailField label="Full name">{contact.values.fullName}</DetailField><DetailField label="Email"><a className="text-link hover:underline" href={`mailto:${contact.values.email}`}>{contact.values.email}</a></DetailField><DetailField label="Phone">{contact.values.phone || "Not provided"}</DetailField><DetailField label="Preferred contact">{contact.values.preferredContactMethod}</DetailField></dl>
          </section>
          <section aria-labelledby="additional-details-heading" className="flex flex-col gap-4 border-t p-5 sm:p-6 md:border-t-0">
            <SectionTitle id="additional-details-heading" icon={<CircleDotIcon className="size-4" />}>Additional Details</SectionTitle>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2"><DetailField label="Record type">{contact.values.recordType}</DetailField><DetailField label="Source">{contact.values.source}</DetailField><DetailField label="Customer segment">{contact.values.customerSegment || "Not specified"}</DetailField><DetailField label="Follow-up date">{contact.values.followUpDate ? formattedDate(contact.values.followUpDate) : "Not scheduled"}</DetailField><div className="sm:col-span-2"><DetailField label="Description">{contact.values.description || "No description added."}</DetailField></div></dl>
            {contact.values.tags.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Contact tags">{contact.values.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>}
          </section>
        </div>

        <Separator />
        <div className="grid gap-0 md:grid-cols-2">
          <section aria-labelledby="related-records-heading" className="flex flex-col gap-4 p-5 sm:p-6 md:border-r">
            <SectionTitle id="related-records-heading" icon={<Building2Icon className="size-4" />}>Related Records</SectionTitle>
            {related.length ? <ul className="flex flex-col gap-1">{related.map((item) => <li key={item.id}><button type="button" onClick={() => setRelatedTarget(item)} className="flex w-full items-start justify-between gap-4 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><span className="flex min-w-0 flex-col gap-1"><span className="text-sm font-medium">{item.title}</span><span className="text-xs leading-relaxed text-muted-foreground">{item.summary}</span></span><Badge variant="outline" className="shrink-0">{item.type}</Badge></button></li>)}</ul> : <p className="text-sm text-muted-foreground">No related records are linked to this contact.</p>}
          </section>
          <section aria-labelledby="recent-activity-heading" className="flex flex-col gap-4 border-t p-5 sm:p-6 md:border-t-0">
            <SectionTitle id="recent-activity-heading" icon={<HistoryIcon className="size-4" />}>Recent Activity</SectionTitle>
            {activityItems.length ? <ol className="flex flex-col gap-4">{activityItems.slice(0, 4).map((item) => <li key={item.id} className="flex gap-3"><span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary/70" /><div className="flex min-w-0 flex-col gap-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><span className="text-sm font-medium">{item.title}</span><time className="text-xs text-muted-foreground">{item.time}</time></div><p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p></div></li>)}</ol> : <p className="text-sm text-muted-foreground">No activity has been recorded.</p>}
          </section>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(open) => { if (open) setEditOpen(true); else requestCloseEdit() }}>
        <DialogContent data-parry-theme className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Edit contact</DialogTitle><DialogDescription>Update this contact record. Changes remain in this local preview.</DialogDescription></DialogHeader>
          {draft && <form onSubmit={saveRecord} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-name">Full name</Label><Input id="detail-edit-name" value={draft.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} required /></div>
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-email">Email</Label><Input id="detail-edit-email" type="email" value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} required /></div>
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-phone">Phone</Label><Input id="detail-edit-phone" type="tel" value={draft.phone} onChange={(event) => updateDraft("phone", event.target.value)} /></div>
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-company">Company</Label><Select value={draft.company} onValueChange={(value) => updateDraft("company", value)}><SelectTrigger id="detail-edit-company" className="w-full"><SelectValue /></SelectTrigger><SelectContent data-parry-theme position="popper"><SelectGroup>{companyOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-owner">Owner</Label><Select value={draft.owner} onValueChange={(value) => updateDraft("owner", value)}><SelectTrigger id="detail-edit-owner" className="w-full"><SelectValue /></SelectTrigger><SelectContent data-parry-theme position="popper"><SelectGroup>{ownerOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-type">Record type</Label><Select value={draft.recordType} onValueChange={(value) => updateDraft("recordType", value as ContactRecordValues["recordType"])}><SelectTrigger id="detail-edit-type" className="w-full"><SelectValue /></SelectTrigger><SelectContent data-parry-theme position="popper"><SelectGroup>{recordTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-status">Status</Label><Select value={draft.status} onValueChange={(value) => updateDraft("status", value as ContactRecordValues["status"])}><SelectTrigger id="detail-edit-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent data-parry-theme position="popper"><SelectGroup>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
              <div className="flex flex-col gap-2"><Label htmlFor="detail-edit-segment">Customer segment</Label><Input id="detail-edit-segment" value={draft.customerSegment} onChange={(event) => updateDraft("customerSegment", event.target.value)} /></div>
              <div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="detail-edit-description">Description</Label><Textarea id="detail-edit-description" value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} rows={3} /></div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row"><Button type="button" variant="outline" onClick={requestCloseEdit}>Cancel</Button><Button type="submit" disabled={!canSave}><CheckIcon data-icon="inline-start" />Save changes</Button></DialogFooter>
          </form>}
        </DialogContent>
      </Dialog>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent data-parry-theme>
          <DialogHeader><DialogTitle>Discard unsaved changes?</DialogTitle><DialogDescription>Your edits will be lost if you close this form now.</DialogDescription></DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row"><Button type="button" variant="outline" onClick={() => setDiscardOpen(false)}>Keep editing</Button><Button type="button" variant="destructive" onClick={discardDraft}>Discard changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent data-parry-theme>
          <DialogHeader><DialogTitle>Delete this contact?</DialogTitle><DialogDescription>{contact.values.fullName} will be removed from this local demo directory. This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row"><Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button type="button" variant="destructive" onClick={deleteRecord}><Trash2Icon data-icon="inline-start" />Delete contact</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(relatedTarget)} onOpenChange={(open) => { if (!open) setRelatedTarget(null) }}>
        <DialogContent data-parry-theme>
          {relatedTarget && <><DialogHeader><div className="flex items-center gap-2"><Badge variant="secondary">{relatedTarget.type}</Badge></div><DialogTitle>{relatedTarget.title}</DialogTitle><DialogDescription>{relatedTarget.summary}</DialogDescription></DialogHeader><Separator /><dl className="grid gap-4 sm:grid-cols-2">{relatedTarget.details.map((item) => <DetailField key={item.label} label={item.label}>{item.value}</DetailField>)}</dl><DialogFooter><Button type="button" variant="outline" onClick={() => setRelatedTarget(null)}>Close</Button></DialogFooter></>}
        </DialogContent>
      </Dialog>
    </section>
  )
}
