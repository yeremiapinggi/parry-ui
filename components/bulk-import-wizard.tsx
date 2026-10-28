"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"

import { WizardStepper } from "@/components/wizard-stepper"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "cn"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type BulkImportFieldKey = "fullName" | "email" | "phone" | "company" | "status"
type FieldKey = BulkImportFieldKey
type Contact = Record<FieldKey, string>
type SourceRow = { rowNumber: number; values: Record<string, string> }
type ValidationRow = { row: SourceRow; contact: Contact; status: "valid" | "invalid" | "duplicate"; errors: string[]; duplicateAction: string }
type ResultRow = { rowNumber: number; contact: Contact; status: "imported" | "updated" | "skipped" | "failed"; detail: string }
type DuplicatePolicy = "skip" | "update"
type ResultFilter = "all" | "valid" | "invalid" | "duplicate"
export type BulkImportWizardConfig = {
  recordLabel?: string
  requiredFields?: FieldKey[]
  emailField?: FieldKey | null
  statusField?: FieldKey | null
  validStatuses?: string[]
  duplicateField?: FieldKey | null
}

const defaultConfig = {
  recordLabel: "Contacts",
  requiredFields: ["fullName", "email"] as FieldKey[],
  emailField: "email" as FieldKey | null,
  statusField: "status" as FieldKey | null,
  validStatuses: ["Active", "Lead", "Customer", "Inactive"],
  duplicateField: "email" as FieldKey | null,
}

const steps = [
  { title: "Upload File", shortTitle: "Upload", description: "Choose a structured CSV or Excel file to import." },
  { title: "Column Mapping", shortTitle: "Map", description: "Match your source columns to the target record fields." },
  { title: "Validate & Review", shortTitle: "Review", description: "Inspect validation results and choose how to handle duplicates." },
  { title: "Import Results", shortTitle: "Results", description: "Review this local demo import and download its reports." },
]

const fields: { key: FieldKey; label: string }[] = [
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "status", label: "Status" },
]

const maxFileSize = 10 * 1024 * 1024
const sampleCsv = [
  "Full Name,Email,Phone,Company,Status",
  'Avery Chen,avery.chen@example.com,+1 415 555 0132,Northstar Labs,Active',
  'Morgan Patel,morgan.patel@example.com,+1 415 555 0168,Juniper Works,Lead',
  'Riley James,riley.james@example.com,,Fieldstone,Customer',
  'Taylor Brooks,taylor.brooks@example.com,+1 415 555 0184,Arcway,Inactive',
  ',missing.name@example.com,,Paper Kite,Lead',
  'Jordan Lee,not-an-email,+1 415 555 0190,Meridian,Active',
  'Casey Morgan,casey.morgan@example.com,,Harborlight,Prospect',
  'Jamie Kim,avery.chen@example.com,+1 415 555 0146,Northstar Labs,Active',
].join("\n")

function parseCsv(source: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true
    } else if (character === ",") {
      row.push(cell)
      cell = ""
    } else if (character === "\n" || character === "\r") {
      row.push(cell)
      rows.push(row)
      if (rows.length > 5001) throw new Error("This demo supports up to 5,000 data rows at a time.")
      row = []
      cell = ""
      if (character === "\r" && source[index + 1] === "\n") index += 1
    } else {
      cell += character
    }
  }

  row.push(cell)
  if (row.some((value) => value.trim() !== "") || rows.length === 0) rows.push(row)
  if (rows.length > 5001) throw new Error("This demo supports up to 5,000 data rows at a time.")
  if (quoted) throw new Error("A quoted value is not closed. Check the CSV file and try again.")
  return rows
}

function normalizeHeaders(rawHeaders: string[]) {
  const seen = new Map<string, number>()
  return rawHeaders.map((header, index) => {
    const base = header.trim() || `Column ${index + 1}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base} (${count})`
  })
}

function stringValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text
    if ("richText" in value && Array.isArray(value.richText)) return value.richText.map((part) => stringValue(part)).join("")
    if ("result" in value) return stringValue(value.result)
    return ""
  }
  return String(value).trim()
}

function rowsToSource(headers: string[], values: string[][]): SourceRow[] {
  const columns = normalizeHeaders(headers)
  return values.flatMap((row, rowIndex) => row.some((value) => value.trim() !== "")
    ? [{
        rowNumber: rowIndex + 2,
        values: Object.fromEntries(columns.map((column, columnIndex) => [column, row[columnIndex]?.trim() ?? ""])),
      }]
    : [])
}

function guessMapping(columns: string[]): Record<FieldKey, string> {
  const aliases: Record<FieldKey, string[]> = {
    fullName: ["fullname", "name", "contactname", "person"],
    email: ["email", "emailaddress", "mail"],
    phone: ["phone", "phonenumber", "mobile", "telephone"],
    company: ["company", "organization", "account", "business"],
    status: ["status", "lifecycle", "stage"],
  }
  const normalized = columns.map((column) => ({ column, key: column.toLowerCase().replace(/[^a-z0-9]/g, "") }))
  const result = {} as Record<FieldKey, string>
  for (const field of fields) {
    result[field.key] = normalized.find(({ key }) => aliases[field.key].includes(key))?.column ?? ""
  }
  return result
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function contactFromRow(row: SourceRow, mapping: Record<FieldKey, string>): Contact {
  return Object.fromEntries(fields.map(({ key }) => [key, mapping[key] ? row.values[mapping[key]] ?? "" : ""])) as Contact
}

function downloadFile(filename: string, contents: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF", contents], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function recordsCsv(rows: ResultRow[]) {
  const header = ["Source Row", "Full Name", "Email", "Phone", "Company", "Status", "Result", "Details"]
  return [header, ...rows.map((row) => [String(row.rowNumber), row.contact.fullName, row.contact.email, row.contact.phone, row.contact.company, row.contact.status, row.status, row.detail])]
    .map((row) => row.map(csvCell).join(","))
    .join("\n")
}

function validationMessage(row: ValidationRow, mapping: Record<FieldKey, string>, duplicateField: FieldKey | null) {
  if (row.status === "invalid") return `Row ${row.row.rowNumber} · ${row.errors.join(" ")}`
  if (row.status === "duplicate") {
    const field = duplicateField ?? "email"
    const label = mapping[field] || fields.find((item) => item.key === field)?.label || field
    return `Row ${row.row.rowNumber} · ${label}: duplicate value. ${row.duplicateAction}`
  }
  return `Row ${row.row.rowNumber} · Ready to import.`
}

export function BulkImportWizard({ onDirtyChange, config, stickyFooter = false }: { onDirtyChange?: (isDirty: boolean) => void; config?: BulkImportWizardConfig; stickyFooter?: boolean }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [sourceColumns, setSourceColumns] = useState<string[]>([])
  const [sourceRows, setSourceRows] = useState<SourceRow[]>([])
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({ fullName: "", email: "", phone: "", company: "", status: "" })
  const [isSample, setIsSample] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [duplicatePolicy, setDuplicatePolicy] = useState<DuplicatePolicy>("skip")
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all")
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [results, setResults] = useState<ResultRow[]>([])
  const [showImportedRecords, setShowImportedRecords] = useState(false)
  const [confirmExclusionOpen, setConfirmExclusionOpen] = useState(false)
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)
  const rules = useMemo(() => ({ ...defaultConfig, ...config, requiredFields: config?.requiredFields ?? defaultConfig.requiredFields, validStatuses: config?.validStatuses ?? defaultConfig.validStatuses }), [config])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const parseRequestRef = useRef(0)
  const timersRef = useRef<number[]>([])

  const mappingComplete = rules.requiredFields.every((field) => Boolean(mapping[field]))
  const hasWork = Boolean(fileName || sourceRows.length || currentStep > 0 || results.length)
  const validationRows = useMemo(() => {
    const seenEmails = new Set<string>()
    return sourceRows.map((row): ValidationRow => {
      const contact = contactFromRow(row, mapping)
      const errors: string[] = []
      for (const field of rules.requiredFields) {
        if (!contact[field].trim()) errors.push(`${mapping[field] || fields.find((item) => item.key === field)?.label || field}: required.`)
      }
      const email = rules.emailField ? contact[rules.emailField].trim().toLowerCase() : ""
      const emailIsValid = !rules.emailField || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      if (rules.emailField && email && !emailIsValid) errors.push(`${mapping[rules.emailField] || "Email"}: invalid email format.`)
      if (rules.statusField) {
        const status = contact[rules.statusField].trim()
        if (status && !rules.validStatuses.some((allowed) => allowed.toLowerCase() === status.toLowerCase())) {
          errors.push(`${mapping[rules.statusField] || "Status"}: must be ${rules.validStatuses.join(", ")}.`)
        }
      }
      const duplicateValue = rules.duplicateField ? contact[rules.duplicateField].trim().toLowerCase() : ""
      const canCheckDuplicate = !rules.emailField || rules.duplicateField !== rules.emailField || emailIsValid
      const duplicate = Boolean(duplicateValue) && canCheckDuplicate && seenEmails.has(duplicateValue)
      if (duplicateValue && canCheckDuplicate) seenEmails.add(duplicateValue)
      const duplicateAction = duplicate ? (duplicatePolicy === "skip" ? "Will be skipped by the selected policy." : "Will update the matching record by the selected policy.") : ""
      return { row, contact, status: errors.length ? "invalid" : duplicate ? "duplicate" : "valid", errors, duplicateAction }
    })
  }, [sourceRows, mapping, duplicatePolicy, rules])

  const counts = useMemo(() => ({
    total: validationRows.length,
    valid: validationRows.filter((row) => row.status === "valid").length,
    invalid: validationRows.filter((row) => row.status === "invalid").length,
    duplicate: validationRows.filter((row) => row.status === "duplicate").length,
  }), [validationRows])
  const processableCount = counts.valid + counts.duplicate
  const completedSteps = Array.from({ length: currentStep }, (_, index) => index)
  const visibleValidationRows = validationRows.filter((row) => resultFilter === "all" || row.status === resultFilter)

  useEffect(() => {
    onDirtyChange?.(hasWork)
  }, [hasWork, onDirtyChange])

  useEffect(() => () => timersRef.current.forEach((timer) => window.clearTimeout(timer)), [])

  async function loadFile(file: File) {
    const parseRequestId = ++parseRequestRef.current
    setIsParsing(false)
    setFeedback("")
    setFileName(file.name)
    setFileSize(file.size)
    setIsSample(false)
    setSourceColumns([])
    setSourceRows([])
    setMapping({ fullName: "", email: "", phone: "", company: "", status: "" })
    if (file.size === 0) {
      setFeedback("This file is empty. Choose another file or download the sample dataset.")
      return
    }
    if (file.size > maxFileSize) {
      setFeedback("This file is larger than 10 MB. Choose a smaller file or split the data into multiple imports.")
      return
    }
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (extension !== "csv" && extension !== "xlsx") {
      setFeedback("Unsupported file type. Upload a .csv or .xlsx file.")
      return
    }

    setIsParsing(true)
    try {
      let sheetRows: string[][]
      if (extension === "csv") {
        sheetRows = parseCsv(await file.text())
      } else {
        const ExcelJS = await import("exceljs")
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(await file.arrayBuffer())
        const worksheet = workbook.worksheets[0]
        if (!worksheet) throw new Error("No worksheet was found in this workbook.")
        if (worksheet.rowCount > 5001) throw new Error("This demo supports up to 5,000 data rows at a time.")
        sheetRows = []
        worksheet.eachRow({ includeEmpty: true }, (row) => {
          const values = row.values as unknown[]
          sheetRows.push(values.slice(1).map(stringValue))
        })
      }
      if (parseRequestId !== parseRequestRef.current) return
      const headers = sheetRows[0]?.map((value) => value.replace(/^\uFEFF/, "")) ?? []
      const rows = rowsToSource(headers, sheetRows.slice(1))
      if (!headers.some((header) => header.trim()) || rows.length === 0) {
        setFeedback("No data rows were found. Add a header row and at least one record, or load the sample dataset.")
        return
      }
      if (rows.length > 5000) {
        setFeedback("This demo supports up to 5,000 rows at a time. Split the file and upload each part separately.")
        return
      }
      setSourceColumns(normalizeHeaders(headers))
      setSourceRows(rows)
      setMapping(guessMapping(normalizeHeaders(headers)))
      setFeedback(`Parsed ${rows.length.toLocaleString()} data rows from ${file.name}.`)
    } catch (error) {
      if (parseRequestId === parseRequestRef.current) setFeedback(error instanceof Error ? `Could not read this file. ${error.message}` : "Could not read this file. Check its format and try again.")
    } finally {
      if (parseRequestId === parseRequestRef.current) setIsParsing(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void loadFile(file)
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) void loadFile(file)
  }

  function loadSample() {
    parseRequestRef.current += 1
    setIsParsing(false)
    const parsedRows = parseCsv(sampleCsv)
    const headers = normalizeHeaders(parsedRows[0])
    setFileName("sample-contacts.csv")
    setFileSize(new Blob([sampleCsv]).size)
    setSourceColumns(headers)
    setSourceRows(rowsToSource(parsedRows[0], parsedRows.slice(1)))
    setMapping(guessMapping(headers))
    setIsSample(true)
    setFeedback("Sample dataset loaded. It includes a duplicate, an invalid email, a missing name, and an unsupported status for review.")
  }

  function removeFile() {
    parseRequestRef.current += 1
    setIsParsing(false)
    setFileName("")
    setFileSize(0)
    setSourceColumns([])
    setSourceRows([])
    setMapping({ fullName: "", email: "", phone: "", company: "", status: "" })
    setFeedback("")
    setIsSample(false)
    setResults([])
    setCurrentStep(0)
  }

  function updateMapping(field: FieldKey, sourceColumn: string) {
    setMapping((current) => ({ ...current, [field]: sourceColumn }))
    setFeedback("")
  }

  function goToStep(step: number) {
    if (step <= currentStep && !isImporting) {
      setCurrentStep(step)
      setShowImportedRecords(false)
    }
  }

  function canContinue() {
    if (currentStep === 0) return Boolean(sourceRows.length && sourceColumns.length && !isParsing)
    if (currentStep === 1) return mappingComplete
    if (currentStep === 2) return processableCount > 0 && !isImporting
    return false
  }

  function continueStep() {
    if (!canContinue()) return
    if (currentStep < 2) setCurrentStep((step) => step + 1)
    else if (counts.invalid > 0) setConfirmExclusionOpen(true)
    else startImport()
  }

  function startImport() {
    setConfirmExclusionOpen(false)
    setCurrentStep(3)
    setShowImportedRecords(false)
    setIsImporting(true)
    setImportProgress(8)
    const progressTimer = window.setTimeout(() => setImportProgress(58), 350)
    const finishTimer = window.setTimeout(() => {
      let didFailOne = false
      const nextResults = validationRows.map((row): ResultRow => {
        if (row.status === "invalid") return { rowNumber: row.row.rowNumber, contact: row.contact, status: "skipped", detail: row.errors.join(" ") }
        if (row.status === "duplicate" && duplicatePolicy === "skip") return { rowNumber: row.row.rowNumber, contact: row.contact, status: "skipped", detail: `Duplicate ${rules.duplicateField ? mapping[rules.duplicateField] || rules.duplicateField : "value"} skipped by the selected policy.` }
        if (simulateFailure && !didFailOne) {
          didFailOne = true
          return { rowNumber: row.row.rowNumber, contact: row.contact, status: "failed", detail: "Simulated demo failure. No application record was changed." }
        }
        return {
          rowNumber: row.row.rowNumber,
          contact: row.contact,
          status: row.status === "duplicate" ? "updated" : "imported",
          detail: row.status === "duplicate" ? `Updated by matching ${rules.duplicateField ? mapping[rules.duplicateField] || rules.duplicateField : "value"} in this local demo.` : "Added to the local demo result set.",
        }
      })
      setResults(nextResults)
      setImportProgress(100)
      setIsImporting(false)
    }, 1200)
    timersRef.current.push(progressTimer, finishTimer)
  }

  function resetImport() {
    parseRequestRef.current += 1
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    setCurrentStep(0)
    setFileName("")
    setFileSize(0)
    setSourceColumns([])
    setSourceRows([])
    setMapping({ fullName: "", email: "", phone: "", company: "", status: "" })
    setIsSample(false)
    setIsParsing(false)
    setFeedback("")
    setDuplicatePolicy("skip")
    setSimulateFailure(false)
    setResultFilter("all")
    setIsImporting(false)
    setImportProgress(0)
    setResults([])
    setShowImportedRecords(false)
    setConfirmDiscardOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function cancelImport() {
    if (hasWork) setConfirmDiscardOpen(true)
    else resetImport()
  }

  function changeDuplicatePolicy(value: string) {
    if (value === "skip" || value === "update") setDuplicatePolicy(value)
  }

  function downloadSample() {
    downloadFile("sample-contacts.csv", sampleCsv)
  }

  function downloadErrorReport() {
    const failedRows = results.filter((row) => row.status === "failed" || row.status === "skipped")
    downloadFile("bulk-import-error-report.csv", recordsCsv(failedRows))
  }

  function downloadSummary() {
    const countsByStatus = results.reduce<Record<ResultRow["status"], number>>((summary, row) => {
      summary[row.status] += 1
      return summary
    }, { imported: 0, updated: 0, skipped: 0, failed: 0 })
    const rows = [
      ["Metric", "Count"],
      ["Imported", String(countsByStatus.imported)],
      ["Updated", String(countsByStatus.updated)],
      ["Skipped", String(countsByStatus.skipped)],
      ["Failed", String(countsByStatus.failed)],
      ["Total source rows", String(results.length)],
      ["Mode", "Local demo only; no application records were changed"],
    ]
    downloadFile("bulk-import-summary.csv", rows.map((row) => row.map(csvCell).join(",")).join("\n"))
  }

  const resultCounts = useMemo(() => results.reduce<Record<ResultRow["status"], number>>((summary, row) => {
    summary[row.status] += 1
    return summary
  }, { imported: 0, updated: 0, skipped: 0, failed: 0 }), [results])
  const importFailed = results.length > 0 && resultCounts.imported + resultCounts.updated === 0 && resultCounts.failed > 0
  const partialSuccess = results.length > 0 && !importFailed && (resultCounts.failed > 0 || resultCounts.skipped > 0)

  const filteredResults = results.filter((row) => showImportedRecords
    ? row.status === "imported" || row.status === "updated"
    : true)

  return (
    <section data-parry-theme aria-label="Bulk Import Wizard" className={cn("mx-auto flex w-full max-w-5xl flex-col bg-card pb-2 text-card-foreground", stickyFooter ? "h-full min-h-[420px] max-h-full" : "min-h-[660px]")}>
      <div className={cn("flex flex-col gap-6 px-1 pt-2 sm:gap-8 sm:px-2", stickyFooter && "min-h-0 flex-1")}>
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Import {rules.recordLabel}</h2>
            <Badge variant="outline">Demo import</Badge>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">Upload, map, and validate a structured file. The final import is simulated locally and never changes application records.</p>
        </header>

        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          label="Bulk import steps"
          onStepChange={goToStep}
        />

        <div className={cn(stickyFooter && "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pr-1")}>
          <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 border-b pb-4">
            <h3 className="font-heading text-lg font-semibold">{steps[currentStep].title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{steps[currentStep].description}</p>
          </div>

          {currentStep === 0 && (
            <div className="flex flex-col gap-5">
              <div
                onDragEnter={(event) => { event.preventDefault(); setIsDragOver(true) }}
                onDragOver={(event) => { event.preventDefault(); setIsDragOver(true) }}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragOver(false) }}
                onDrop={handleDrop}
                className={`flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors sm:min-h-60 ${isDragOver ? "border-primary bg-secondary/50" : "bg-muted/20"}`}
              >
                <span className="flex size-11 items-center justify-center rounded-lg border bg-background text-muted-foreground"><UploadIcon aria-hidden="true" className="size-5" /></span>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Drop your file here, or browse</p>
                  <p className="text-sm text-muted-foreground">CSV or XLSX · maximum 10 MB · up to 5,000 rows</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} className="sr-only" aria-label="Choose a CSV or XLSX file" />
                <Button type="button" variant="outline" disabled={isParsing} onClick={() => fileInputRef.current?.click()}>
                  {isParsing ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <FileSpreadsheetIcon data-icon="inline-start" />}
                  {isParsing ? "Parsing file…" : "Browse Files"}
                </Button>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button type="button" variant="ghost" size="sm" disabled={isParsing} onClick={loadSample}>Load sample dataset</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={downloadSample}><DownloadIcon data-icon="inline-start" />Download sample CSV</Button>
                </div>
              </div>

              {feedback && (
                <Alert variant={sourceRows.length ? "default" : "destructive"} role={sourceRows.length ? "status" : "alert"}>
                  {sourceRows.length ? <CircleCheckIcon /> : <CircleAlertIcon />}
                  <AlertTitle>{sourceRows.length ? "File ready" : "Could not use this file"}</AlertTitle>
                  <AlertDescription>{feedback}</AlertDescription>
                </Alert>
              )}

              {fileName && (
                <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">{fileName.toLowerCase().endsWith(".csv") ? <FileTextIcon /> : <FileSpreadsheetIcon />}</span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{fileName}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(fileSize)}{sourceRows.length ? ` · ${sourceRows.length.toLocaleString()} data rows · ${sourceColumns.length} columns` : ""}{isSample ? " · sample data" : ""}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" size="sm" variant="outline" disabled={isParsing} onClick={() => fileInputRef.current?.click()}>Replace</Button>
                    <Button type="button" size="icon-sm" variant="ghost" aria-label="Remove uploaded file" onClick={removeFile}><Trash2Icon /></Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1"><h4 className="font-medium">Map source columns</h4><p className="text-sm leading-relaxed text-muted-foreground">We suggest matches using the column names. Required fields are marked and each source column can only be used once.</p></div>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader><TableRow><TableHead>Target field</TableHead><TableHead>Source column</TableHead><TableHead className="hidden md:table-cell">Sample value</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {fields.map((field) => {
                      const usedByAnother = (column: string) => Boolean(column && fields.some((other) => other.key !== field.key && mapping[other.key] === column))
                      return (
                        <TableRow key={field.key}>
                          <TableCell><div className="flex items-center gap-2"><span className="font-medium">{field.label}</span>{rules.requiredFields.includes(field.key) && <Badge variant="outline">Required</Badge>}</div></TableCell>
                          <TableCell>
                            <FieldGroup className="gap-0">
                              <Field>
                                <FieldLabel htmlFor={`mapping-${field.key}`} className="sr-only">Source column for {field.label}</FieldLabel>
                                <Select value={mapping[field.key] || "none"} onValueChange={(value) => updateMapping(field.key, value === "none" ? "" : value)}>
                                  <SelectTrigger id={`mapping-${field.key}`} aria-label={`Map ${field.label} to a source column`} className="w-full min-w-36 sm:max-w-64"><SelectValue placeholder="Choose a column" /></SelectTrigger>
                                  <SelectContent><SelectGroup><SelectItem value="none">Do not import</SelectItem>{sourceColumns.map((column) => <SelectItem key={column} value={column} disabled={usedByAnother(column)}>{column}</SelectItem>)}</SelectGroup></SelectContent>
                                </Select>
                              </Field>
                            </FieldGroup>
                          </TableCell>
                          <TableCell className="hidden max-w-64 truncate text-muted-foreground md:table-cell">{mapping[field.key] ? sourceRows[0]?.values[mapping[field.key]] || "—" : "—"}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {!mappingComplete && <Alert variant="destructive"><CircleAlertIcon /><AlertTitle>Mapping incomplete</AlertTitle><AlertDescription>Map each required field ({rules.requiredFields.map((key) => fields.find((field) => field.key === key)?.label ?? key).join(", ")}) before continuing.</AlertDescription></Alert>}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-end justify-between gap-2"><div><h4 className="font-medium">Sample data preview</h4><p className="text-sm text-muted-foreground">First {Math.min(sourceRows.length, 5)} source rows · fields update with your mappings.</p></div></div>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader><TableRow>{fields.map((field) => <TableHead key={field.key}>{field.label}{rules.requiredFields.includes(field.key) ? " *" : ""}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>{sourceRows.slice(0, 5).map((row) => {
                      const contact = contactFromRow(row, mapping)
                      return <TableRow key={row.rowNumber}>{fields.map((field) => <TableCell key={field.key} className="max-w-48 truncate">{contact[field.key] || <span className="text-muted-foreground">—</span>}</TableCell>)}</TableRow>
                    })}</TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  { label: "Total rows", value: counts.total, tone: "" },
                  { label: "Valid", value: counts.valid, tone: "text-success" },
                  { label: "Invalid", value: counts.invalid, tone: "text-destructive" },
                  { label: "Duplicates", value: counts.duplicate, tone: "text-warning" },
                ].map((item) => <div key={item.label} className="flex flex-col gap-1 rounded-lg border bg-background p-3"><span className="text-xs text-muted-foreground">{item.label}</span><span className={cn("font-heading text-2xl font-semibold", item.tone)}>{item.value.toLocaleString()}</span></div>)}
              </div>

              <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-end sm:justify-between">
                <FieldGroup className="gap-2">
                  <Field>
                    <FieldLabel htmlFor="duplicate-policy">Duplicate handling</FieldLabel>
                    <Select value={duplicatePolicy} onValueChange={changeDuplicatePolicy}>
                      <SelectTrigger id="duplicate-policy" className="w-full sm:w-64"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem value="skip">Skip Duplicates</SelectItem><SelectItem value="update">Update Existing</SelectItem></SelectGroup></SelectContent>
                    </Select>
                    <FieldDescription>Duplicate records are detected by matching email addresses within this file.</FieldDescription>
                  </Field>
                </FieldGroup>
                <FieldGroup className="gap-2">
                  <Field orientation="horizontal">
                    <Checkbox id="simulate-import-failure" checked={simulateFailure} onCheckedChange={(checked) => setSimulateFailure(checked === true)} />
                    <FieldContent><FieldLabel htmlFor="simulate-import-failure" className="font-normal">Simulate one failed record</FieldLabel><FieldDescription>Demo-only control for the partial / failed result state.</FieldDescription></FieldContent>
                  </Field>
                </FieldGroup>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><h4 className="font-medium">Validation results</h4><p className="text-sm text-muted-foreground">Row-level checks use the current field mapping and duplicate policy.</p></div>
                  <ToggleGroup type="single" value={resultFilter} onValueChange={(value) => { if (value) setResultFilter(value as ResultFilter) }} variant="outline" size="sm" aria-label="Filter validation rows" className="max-w-full flex-wrap justify-start">
                    <ToggleGroupItem value="all">All</ToggleGroupItem><ToggleGroupItem value="valid">Valid</ToggleGroupItem><ToggleGroupItem value="invalid">Invalid</ToggleGroupItem><ToggleGroupItem value="duplicate">Duplicate</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Result</TableHead><TableHead>Validation details</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {visibleValidationRows.length ? visibleValidationRows.map((item) => (
                        <TableRow key={item.row.rowNumber}>
                          <TableCell className="font-mono text-muted-foreground">{item.row.rowNumber}</TableCell>
                          <TableCell className="min-w-32">{item.contact.fullName || <span className="text-destructive">Missing name</span>}</TableCell>
                          <TableCell className="min-w-40">{item.contact.email || "—"}</TableCell>
                          <TableCell><Badge variant={item.status === "valid" ? "secondary" : "outline"} className={cn(item.status === "invalid" ? "border-destructive/50 text-destructive" : item.status === "duplicate" ? "border-warning/50 text-warning" : "")}>{item.status}</Badge></TableCell>
                          <TableCell className="min-w-60 text-sm text-muted-foreground">{validationMessage(item, mapping, rules.duplicateField)}</TableCell>
                        </TableRow>
                      )) : <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No rows match this filter.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">Source row numbers include the header row. Invalid rows are excluded from the demo import.</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col gap-5">
              {isImporting ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border bg-muted/20 p-6 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><LoaderCircleIcon className="size-6 animate-spin" /></span>
                  <div className="flex flex-col gap-1"><h4 className="font-medium">Processing demo import</h4><p className="text-sm text-muted-foreground">Preparing local results. No records are being sent to an application.</p></div>
                  <div className="w-full max-w-md"><div role="progressbar" aria-label="Import progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={importProgress} className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${importProgress}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{importProgress}%</p></div>
                </div>
              ) : results.length > 0 ? (
                <>
                  <Alert variant={importFailed ? "destructive" : "default"} role="status">
                    {importFailed ? <CircleAlertIcon /> : partialSuccess ? <AlertTriangleIcon /> : <CircleCheckIcon />}
                    <AlertTitle>{importFailed ? "Import failed" : partialSuccess ? "Partial success" : "Import completed"}</AlertTitle>
                    <AlertDescription>This is a local demo result only. No real application records were imported or changed.</AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {[{ label: "Imported", value: resultCounts.imported, tone: "text-success" }, { label: "Updated", value: resultCounts.updated, tone: "text-info" }, { label: "Skipped", value: resultCounts.skipped, tone: "" }, { label: "Failed", value: resultCounts.failed, tone: "text-destructive" }].map((item) => <div key={item.label} className="flex flex-col gap-1 rounded-lg border bg-background p-3"><span className="text-xs text-muted-foreground">{item.label}</span><span className={cn("font-heading text-2xl font-semibold", item.tone)}>{item.value.toLocaleString()}</span></div>)}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><h4 className="font-medium">{showImportedRecords ? "Imported demo records" : "Import details"}</h4><p className="text-sm text-muted-foreground">{showImportedRecords ? "Only records added or updated by this demo run." : `${results.length.toLocaleString()} source rows · result details are available below.`}</p></div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={downloadErrorReport}><DownloadIcon data-icon="inline-start" />Error Report</Button>
                      <Button type="button" size="sm" variant="outline" onClick={downloadSummary}><DownloadIcon data-icon="inline-start" />Import Summary</Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Result</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredResults.length ? filteredResults.map((row) => <TableRow key={row.rowNumber}><TableCell className="font-mono text-muted-foreground">{row.rowNumber}</TableCell><TableCell className="min-w-32">{row.contact.fullName || "—"}</TableCell><TableCell className="min-w-40">{row.contact.email || "—"}</TableCell><TableCell><Badge variant="outline" className={cn(row.status === "failed" ? "border-destructive/50 text-destructive" : row.status === "imported" ? "border-success/50 text-success" : row.status === "updated" ? "border-info/50 text-info" : "")}>{row.status}</Badge></TableCell><TableCell className="min-w-60 text-sm text-muted-foreground">{row.detail}</TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No imported demo records are available.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={() => setShowImportedRecords((shown) => !shown)}>{showImportedRecords ? "View all results" : "View Imported Records"}<ArrowRightIcon data-icon="inline-end" /></Button>
                    <Button type="button" onClick={resetImport}><RotateCcwIcon data-icon="inline-start" />Start New Import</Button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border p-6 text-sm text-muted-foreground">No import has been started yet.</div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      <footer className={cn("mt-auto flex flex-col gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4", stickyFooter && "sticky bottom-2")}>
        <div className="min-w-0 text-sm">
          <span className="font-medium">Step {currentStep + 1} of 4</span>
          <span className="text-muted-foreground"> · {currentStep === 0 ? (sourceRows.length ? `${sourceRows.length} rows ready` : "No file selected") : currentStep === 1 ? (mappingComplete ? "Required fields mapped" : "Mapping incomplete") : currentStep === 2 ? `${counts.valid} valid · ${counts.invalid} invalid · ${counts.duplicate} duplicates` : isImporting ? "Import in progress" : "Local demo results"}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {currentStep < 3 && <Button type="button" variant="ghost" onClick={cancelImport}>Cancel</Button>}
          {currentStep > 0 && !isImporting && <Button type="button" variant="outline" onClick={() => goToStep(currentStep - 1)}><ArrowLeftIcon data-icon="inline-start" />Back</Button>}
          {currentStep < 3 && <Button type="button" disabled={!canContinue()} onClick={continueStep}>{currentStep === 2 ? "Import Records" : "Continue"}<ArrowRightIcon data-icon="inline-end" /></Button>}
        </div>
      </footer>

      <AlertDialog open={confirmExclusionOpen} onOpenChange={setConfirmExclusionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Exclude invalid rows?</AlertDialogTitle><AlertDialogDescription>{counts.invalid} invalid {counts.invalid === 1 ? "row will" : "rows will"} be excluded from this demo import. Continue with {processableCount} valid or duplicate rows? This action only creates local demo results.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Review rows</AlertDialogCancel><AlertDialogAction onClick={startImport}>Continue with valid rows</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Discard this import?</AlertDialogTitle><AlertDialogDescription>Your file, column mappings, and current demo progress will be cleared from this preview.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep working</AlertDialogCancel><AlertDialogAction onClick={resetImport}>Discard import</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
