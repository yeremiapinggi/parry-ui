"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, CheckIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { SearchableRecordSelect, RecordTagsSelect } from "@/components/searchable-record-select"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  companyOptions,
  createEditFormSections,
  customerSegmentOptions,
  ownerOptions,
  priorityOptions,
  recordTypeOptions,
  sourceOptions,
  statusOptions,
  tagOptions,
  type ContactRecord,
  type ContactRecordValues,
  type FormMode,
  type SelectOption,
} from "@/lib/create-edit-form-config"
import { copyContactValues, createEmptyContactValues, initialContactRecords } from "@/lib/create-edit-form-demo-data"
import { validateContactRecord, type ContactRecordErrors } from "@/lib/create-edit-form-validation"

type PendingIntent =
  | { kind: "mode"; value: FormMode }
  | { kind: "record"; value: string }
  | { kind: "cancel" }
  | { kind: "navigation"; href: string }

type SelectFieldProps = {
  id: string
  label: string
  value: string
  options: SelectOption[]
  onValueChange: (value: string) => void
  helper?: string
  error?: string
  required?: boolean
}

function SelectField({ id, label, value, options, onValueChange, helper, error, required }: SelectFieldProps) {
  const messageId = `${id}-message`
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{label}{required && <span aria-hidden="true" className="ml-1 text-destructive">*</span>}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)} aria-describedby={error || helper ? messageId : undefined}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent data-parry-theme position="popper">
          <SelectGroup>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup>
        </SelectContent>
      </Select>
      {(error || helper) && <p id={messageId} aria-live={error ? "polite" : undefined} className={error ? "text-sm text-destructive" : "text-sm leading-relaxed text-muted-foreground"}>{error ?? helper}</p>}
    </div>
  )
}

export function CreateEditForm({ onDirtyChange, onRequestBack }: { onDirtyChange?: (dirty: boolean) => void; onRequestBack?: () => void }) {
  const router = useRouter()
  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<FormMode>("create")
  const [records, setRecords] = useState<ContactRecord[]>(() => initialContactRecords.map((record) => ({ ...record, values: copyContactValues(record.values) })))
  const [selectedRecordId, setSelectedRecordId] = useState(initialContactRecords[0].id)
  const [values, setValues] = useState<ContactRecordValues>(createEmptyContactValues)
  const [baseline, setBaseline] = useState<ContactRecordValues>(createEmptyContactValues)
  const [fieldErrors, setFieldErrors] = useState<ContactRecordErrors>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState("Demo data stays in this preview session; nothing is sent to a backend.")
  const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null)

  const hasUnsavedChanges = JSON.stringify(values) !== JSON.stringify(baseline)
  const editingRecordId = mode === "edit" ? selectedRecordId : undefined
  const currentErrors = validateContactRecord(values, records, editingRecordId)
  const canSave = hasUnsavedChanges && Object.keys(currentErrors).length === 0 && !isSaving

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange])

  useEffect(() => {
    if (!hasUnsavedChanges || isSaving) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    function handleInternalNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!(event.target instanceof Element)) return
      const anchor = event.target.closest("a[href]") as HTMLAnchorElement | null
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return

      const destination = new URL(anchor.href, window.location.href)
      if (destination.origin !== window.location.origin) return
      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash === window.location.hash) return

      event.preventDefault()
      setPendingIntent({ kind: "navigation", href: `${destination.pathname}${destination.search}${destination.hash}` })
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("click", handleInternalNavigation, true)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("click", handleInternalNavigation, true)
    }
  }, [hasUnsavedChanges, isSaving])

  function validateCurrent(nextValues: ContactRecordValues, submitted = hasSubmitted) {
    if (submitted) setFieldErrors(validateContactRecord(nextValues, records, editingRecordId))
  }

  function updateValue<Key extends keyof ContactRecordValues>(key: Key, value: ContactRecordValues[Key]) {
    const nextValues = { ...values, [key]: value }
    setValues(nextValues)
    onDirtyChange?.(JSON.stringify(nextValues) !== JSON.stringify(baseline))
    validateCurrent(nextValues)
    setFeedback("Demo data stays in this preview session; nothing is sent to a backend.")
  }

  function loadRecord(recordId: string) {
    const record = records.find((item) => item.id === recordId)
    if (!record) return
    const nextValues = copyContactValues(record.values)
    setSelectedRecordId(recordId)
    setValues(nextValues)
    setBaseline(copyContactValues(nextValues))
    onDirtyChange?.(false)
    setFieldErrors({})
    setHasSubmitted(false)
    setFeedback(`Editing ${nextValues.fullName}. Changes are local to this preview.`)
  }

  function applyIntent(intent: PendingIntent) {
    if (intent.kind === "mode") {
      onDirtyChange?.(false)
      setMode(intent.value)
      setFieldErrors({})
      setHasSubmitted(false)
      if (intent.value === "create") {
        setFeedback("Start a new fictional contact record.")
        const emptyValues = createEmptyContactValues()
        setValues(emptyValues)
        setBaseline(createEmptyContactValues())
      } else {
        const record = records.find((item) => item.id === selectedRecordId) ?? records[0]
        if (record) {
          setSelectedRecordId(record.id)
          setValues(copyContactValues(record.values))
          setBaseline(copyContactValues(record.values))
          setFeedback(`Editing ${record.values.fullName}. Changes are local to this preview.`)
        }
      }
    } else if (intent.kind === "record") {
      loadRecord(intent.value)
    } else if (intent.kind === "cancel") {
      onDirtyChange?.(false)
      setValues(copyContactValues(baseline))
      setFieldErrors({})
      setHasSubmitted(false)
      setFeedback("Changes were discarded. The current record is back to its saved demo values.")
    } else {
      onDirtyChange?.(false)
      setValues(copyContactValues(baseline))
      setFieldErrors({})
      router.push(intent.href)
    }
  }

  function requestIntent(intent: PendingIntent) {
    if (isSaving) return
    if (hasUnsavedChanges) {
      setPendingIntent(intent)
      return
    }
    applyIntent(intent)
  }

  function discardAndContinue() {
    if (!pendingIntent) return
    const intent = pendingIntent
    setPendingIntent(null)
    applyIntent(intent)
  }

  function resetChanges() {
    onDirtyChange?.(false)
    setValues(copyContactValues(baseline))
    setFieldErrors({})
    setHasSubmitted(false)
    setFeedback("The form has been restored to its current baseline.")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    setHasSubmitted(true)
    const nextErrors = validateContactRecord(values, records, editingRecordId)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setFeedback("Review the highlighted fields before continuing.")
      const firstError = Object.keys(nextErrors)[0] as keyof ContactRecordValues
      const fieldRefs = { fullName: fullNameRef, email: emailRef, phone: phoneRef }
      fieldRefs[firstError as keyof typeof fieldRefs]?.current?.focus()
      return
    }

    const normalizedValues = { ...values, fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim(), description: values.description.trim(), leadSourceDetails: values.leadSourceDetails.trim() }
    setIsSaving(true)
    setFeedback(mode === "create" ? "Creating this record in the local preview…" : "Saving changes in the local preview…")

    window.setTimeout(() => {
      if (mode === "create") {
        const nextRecord: ContactRecord = { id: `contact-${String(records.length + 1).padStart(3, "0")}`, values: copyContactValues(normalizedValues) }
        setRecords((current) => [...current, nextRecord])
        const emptyValues = createEmptyContactValues()
        setValues(emptyValues)
        setBaseline(createEmptyContactValues())
        onDirtyChange?.(false)
        setFieldErrors({})
        setHasSubmitted(false)
        setFeedback(`${normalizedValues.fullName} was created in this preview and is available in Edit mode.`)
        toast.success("Record created in this preview", { description: `${normalizedValues.fullName} is available in Edit mode.`, position: "bottom-right" })
      } else {
        setRecords((current) => current.map((record) => record.id === selectedRecordId ? { ...record, values: copyContactValues(normalizedValues) } : record))
        setValues(copyContactValues(normalizedValues))
        setBaseline(copyContactValues(normalizedValues))
        onDirtyChange?.(false)
        setFieldErrors({})
        setHasSubmitted(false)
        setFeedback("Changes saved to the local demo record.")
        toast.success("Changes saved in this preview", { description: `${normalizedValues.fullName} was updated locally.`, position: "bottom-right" })
      }
      setIsSaving(false)
    }, 450)
  }

  const firstNameError = fieldErrors.fullName
  const emailError = fieldErrors.email
  const phoneError = fieldErrors.phone
  const disabled = isSaving

  return (
    <section data-parry-theme aria-label="Create / Edit Form preview" className="mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
          {onRequestBack ? (
            <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={onRequestBack}><ArrowLeftIcon data-icon="inline-start" />Templates</Button>
          ) : (
            <Button asChild type="button" variant="ghost" size="sm" className="-ml-2">
              <a href="/templates"><ArrowLeftIcon data-icon="inline-start" />Templates</a>
            </Button>
          )}
          <span aria-hidden="true">/</span>
          <span>Forms</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{mode === "create" ? "Create Record" : "Edit Record"}</h2>
              {hasUnsavedChanges && <Badge variant="outline" className="border-warning/40 bg-warning-soft text-warning">Unsaved Changes</Badge>}
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{mode === "create" ? "Add a contact and connect it to the right company and owner." : "Update a saved demo contact and review the changes before saving."}</p>
          </div>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value) => { if (value && value !== mode) requestIntent({ kind: "mode", value: value as FormMode }) }}
            variant="outline"
            size="sm"
            aria-label="Form mode"
            className="shrink-0 self-start"
          >
            <ToggleGroupItem value="create" disabled={disabled}>Create</ToggleGroupItem>
            <ToggleGroupItem value="edit" disabled={disabled}>Edit</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {mode === "edit" && (
          <div className="grid gap-2 sm:max-w-sm">
            <Label htmlFor="create-edit-record-selector">Demo record</Label>
            <Select value={selectedRecordId} onValueChange={(value) => requestIntent({ kind: "record", value })} disabled={disabled}>
              <SelectTrigger id="create-edit-record-selector" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme position="popper"><SelectGroup>
                {records.map((record) => <SelectItem key={record.id} value={record.id}>{record.values.fullName} · {record.values.company || "No company"}</SelectItem>)}
              </SelectGroup></SelectContent>
            </Select>
          </div>
        )}
      </header>

      <form noValidate onSubmit={handleSubmit} className="flex min-w-0 flex-col">
        <div className="pb-32">
        <section aria-labelledby="create-edit-basic-heading" className="flex flex-col gap-6 py-6 first:pt-0">
          <SectionHeading id="create-edit-basic-heading" title={createEditFormSections[0].title} description={createEditFormSections[0].description} />
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="create-edit-full-name">Full Name <span aria-hidden="true" className="text-destructive">*</span></Label>
              <Input
                ref={fullNameRef}
                id="create-edit-full-name"
                value={values.fullName}
                onChange={(event) => updateValue("fullName", event.target.value)}
                onBlur={() => { if (hasSubmitted) validateCurrent(values) }}
                disabled={disabled}
                required
                autoComplete="name"
                aria-invalid={Boolean(firstNameError)}
                aria-describedby={firstNameError ? "create-edit-full-name-error" : "create-edit-full-name-help"}
              />
              <FieldMessage id={firstNameError ? "create-edit-full-name-error" : "create-edit-full-name-help"} error={firstNameError} helper="Use the person’s name as it should appear on the record." />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="create-edit-email">Email Address <span aria-hidden="true" className="text-destructive">*</span></Label>
              <Input
                ref={emailRef}
                id="create-edit-email"
                type="email"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                onBlur={() => { if (hasSubmitted) validateCurrent(values) }}
                disabled={disabled}
                required
                autoComplete="email"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "create-edit-email-error" : "create-edit-email-help"}
              />
              <FieldMessage id={emailError ? "create-edit-email-error" : "create-edit-email-help"} error={emailError} helper="Email addresses must be unique among the local demo records." />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="create-edit-phone">Phone Number</Label>
              <Input
                ref={phoneRef}
                id="create-edit-phone"
                type="tel"
                value={values.phone}
                onChange={(event) => updateValue("phone", event.target.value)}
                onBlur={() => { if (hasSubmitted) validateCurrent(values) }}
                disabled={disabled}
                autoComplete="tel"
                aria-invalid={Boolean(phoneError)}
                aria-describedby={phoneError ? "create-edit-phone-error" : "create-edit-phone-help"}
              />
              <FieldMessage id={phoneError ? "create-edit-phone-error" : "create-edit-phone-help"} error={phoneError} helper="Optional. Include a country code when you have one." />
            </div>
            <SelectField
              id="create-edit-record-type"
              label="Record Type"
              value={values.recordType}
              options={recordTypeOptions}
              onValueChange={(value) => updateValue("recordType", value as ContactRecordValues["recordType"])}
            />
            <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
              <Label htmlFor="create-edit-description">Description</Label>
              <Textarea id="create-edit-description" value={values.description} onChange={(event) => updateValue("description", event.target.value)} disabled={disabled} rows={3} aria-describedby="create-edit-description-help" />
              <p id="create-edit-description-help" className="text-sm leading-relaxed text-muted-foreground">Add useful context for teammates reviewing this contact.</p>
            </div>
            {values.recordType === "Customer" && (
              <SelectField
                id="create-edit-customer-segment"
                label="Customer Segment"
                value={values.customerSegment}
                options={customerSegmentOptions}
                onValueChange={(value) => updateValue("customerSegment", value)}
                helper="Shown only for customer records."
              />
            )}
            {values.recordType === "Prospect" && (
              <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
                <Label htmlFor="create-edit-lead-source-details">Lead Source Details</Label>
                <Textarea id="create-edit-lead-source-details" value={values.leadSourceDetails} onChange={(event) => updateValue("leadSourceDetails", event.target.value)} disabled={disabled} rows={2} aria-describedby="create-edit-lead-source-help" />
                <p id="create-edit-lead-source-help" className="text-sm leading-relaxed text-muted-foreground">Shown only for prospect records. Add a short note about how the lead arrived.</p>
              </div>
            )}
          </div>
        </section>

        <Separator />

        <section aria-labelledby="create-edit-assignment-heading" className="flex flex-col gap-6 py-6">
          <SectionHeading id="create-edit-assignment-heading" title={createEditFormSections[1].title} description={createEditFormSections[1].description} />
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="create-edit-company">Company</Label>
              <SearchableRecordSelect id="create-edit-company" label="Company" value={values.company} options={companyOptions} placeholder="Search companies" disabled={disabled} onValueChange={(value) => updateValue("company", value)} />
              <p className="text-sm leading-relaxed text-muted-foreground">Search the fictional company directory or leave unassigned.</p>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="create-edit-owner">Owner</Label>
              <SearchableRecordSelect id="create-edit-owner" label="Owner" value={values.owner} options={ownerOptions} placeholder="Search owners" disabled={disabled} onValueChange={(value) => updateValue("owner", value)} />
            </div>
            <SelectField id="create-edit-status" label="Status" value={values.status} options={statusOptions} onValueChange={(value) => updateValue("status", value as ContactRecordValues["status"])} />
            <SelectField id="create-edit-priority" label="Priority" value={values.priority} options={priorityOptions} onValueChange={(value) => updateValue("priority", value as ContactRecordValues["priority"])} helper="Use priority to guide the next team action." />
          </div>
        </section>

        <Separator />

        <section aria-labelledby="create-edit-additional-heading" className="flex flex-col gap-6 py-6">
          <SectionHeading id="create-edit-additional-heading" title={createEditFormSections[2].title} description={createEditFormSections[2].description} />
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <SelectField id="create-edit-source" label="Source" value={values.source} options={sourceOptions} onValueChange={(value) => updateValue("source", value)} />
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="create-edit-follow-up">Follow-up Date</Label>
              <Input id="create-edit-follow-up" type="date" value={values.followUpDate} onChange={(event) => updateValue("followUpDate", event.target.value)} disabled={disabled} />
              <p className="text-sm leading-relaxed text-muted-foreground">Optional reminder date for this record.</p>
            </div>
            <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
              <fieldset className="flex flex-col gap-3" disabled={disabled}>
                <legend className="text-sm font-medium">Preferred Contact Method</legend>
                <p id="create-edit-contact-method-help" className="text-sm leading-relaxed text-muted-foreground">Email contact requires a valid email address.</p>
                <RadioGroup value={values.preferredContactMethod} onValueChange={(value) => updateValue("preferredContactMethod", value as ContactRecordValues["preferredContactMethod"])} aria-label="Preferred Contact Method" aria-describedby="create-edit-contact-method-help" className="flex flex-wrap gap-x-6 gap-y-3">
                  {["Email", "Phone"].map((method) => {
                    const id = `create-edit-contact-${method.toLowerCase()}`
                    return <div key={method} className="flex items-center gap-2"><RadioGroupItem id={id} value={method} /><Label htmlFor={id} className="font-normal">{method}</Label></div>
                  })}
                </RadioGroup>
              </fieldset>
            </div>
            <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
              <Label htmlFor="create-edit-tags">Tags</Label>
              <RecordTagsSelect id="create-edit-tags" values={values.tags} options={tagOptions} disabled={disabled} onValuesChange={(tags) => updateValue("tags", tags)} />
              <p className="text-sm leading-relaxed text-muted-foreground">Add one or more labels to make records easier to group.</p>
            </div>
          </div>
        </section>
        </div>

        <footer className="sticky bottom-5 z-10 mx-3 flex min-w-0 flex-col gap-4 rounded-xl border bg-background p-4 shadow-md sm:mx-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-10 min-w-0 flex-col justify-center gap-1.5">
            <p aria-live="polite" className="min-w-0 break-words text-sm text-muted-foreground">{isSaving ? <><LoaderCircleIcon aria-hidden="true" className="mr-1 inline size-4 animate-spin align-[-3px]" />{mode === "create" ? "Creating local demo record…" : "Saving local demo changes…"}</> : feedback}</p>
            {hasUnsavedChanges && <Badge variant="outline" className="w-fit border-warning/40 bg-warning-soft text-warning">You have unsaved changes.</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button type="button" variant="outline" size="lg" onClick={() => requestIntent({ kind: "cancel" })} disabled={!hasUnsavedChanges || disabled}>Cancel</Button>
            <Button type="button" variant="outline" size="lg" onClick={resetChanges} disabled={!hasUnsavedChanges || disabled}>Reset Changes</Button>
            <Button type="submit" size="lg" className="col-span-2 sm:col-span-1" disabled={disabled || (mode === "edit" && !canSave)}>
              {isSaving ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : mode === "edit" ? <CheckIcon data-icon="inline-start" /> : null}
              {isSaving ? "Saving…" : mode === "create" ? "Create Record" : "Save Changes"}
            </Button>
          </div>
        </footer>
      </form>

      <Dialog open={pendingIntent !== null} onOpenChange={(open) => { if (!open) setPendingIntent(null) }}>
        <DialogContent data-parry-theme>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>Your current edits have not been saved. Keep working or discard them before continuing.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setPendingIntent(null)}>Keep Editing</Button>
            <Button type="button" variant="destructive" onClick={discardAndContinue}>Discard Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 id={id} className="font-heading text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function FieldMessage({ id, error, helper }: { id: string; error?: string; helper: string }) {
  return <p id={id} aria-live={error ? "polite" : undefined} className={error ? "text-sm text-destructive" : "text-sm leading-relaxed text-muted-foreground"}>{error ?? helper}</p>
}
