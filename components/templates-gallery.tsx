"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import { AdvancedFilterableTablePreview } from "@/components/advanced-filterable-table-preview"
import { AnalyticsDashboard, AnalyticsDashboardThumbnail } from "@/components/analytics-dashboard"
import { CreateEditForm } from "@/components/create-edit-form"
import { CreateEditFormThumbnail } from "@/components/create-edit-form-thumbnail"
import { DataManagementListPreview } from "@/components/data-management-list-preview"
import { SettingsPanelsPreview } from "@/components/settings-panels-preview"
import { SettingsFormPreview } from "@/components/settings-form-preview"
import { SettingsDialogPreview } from "@/components/settings-dialog-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type TemplateCategory = "Table" | "Dashboard" | "Forms" | "Settings" | "Conversation" | "AI"
type CategoryFilter = "All" | TemplateCategory

type Template = {
  slug: string
  name: string
  description: string
  category: TemplateCategory
  reference: string
}

const templates: Template[] = [
  {
    slug: "data-management-list",
    name: "Data Management List",
    description: "A reusable record management template for creating, organizing, updating, and deleting structured business data.",
    category: "Table",
    reference: "Parry UI · Data management",
  },
  {
    slug: "analytics-dashboard",
    name: "Analytics Dashboard",
    description: "A data-driven dashboard for monitoring KPIs, trends, and performance breakdowns.",
    category: "Dashboard",
    reference: "Parry UI · Product analytics",
  },
  {
    slug: "create-edit-form",
    name: "Create / Edit Form",
    description: "A reusable form for creating and editing structured business records.",
    category: "Forms",
    reference: "Parry UI · Record management",
  },
  {
    slug: "settings-panels",
    name: "Settings Panels",
    description: "A section-based settings workspace for managing complex application configurations.",
    category: "Settings",
    reference: "Parry UI · Workspace settings",
  },
  {
    slug: "settings-form",
    name: "Settings Form",
    description: "A single-page settings form for managing preferences and configuration.",
    category: "Settings",
    reference: "Parry UI · Workspace settings",
  },
  {
    slug: "settings-dialog",
    name: "Settings Dialog",
    description: "A contextual settings dialog for managing preferences without leaving the current page.",
    category: "Settings",
    reference: "Parry UI · Notification preferences",
  },
  {
    slug: "advanced-filterable-table",
    name: "Advanced Filterable Table",
    description: "Explore complex datasets with advanced filtering, saved views, column customization, grouping, and record inspection.",
    category: "Table",
    reference: "Parry UI · Data exploration",
  },
]

const availableCategories = Array.from(new Set(templates.map(({ category }) => category)))

const thumbnailRows = [
  { name: "Alya Pratama", email: "alya.pratama@northstar.co", company: "Northstar Labs", status: "Active" },
  { name: "Rafael Putra", email: "rafael.putra@horizon.id", company: "Horizon Group", status: "Active" },
  { name: "Mei Tan", email: "mei.tan@meridian.co", company: "Meridian Works", status: "Invited" },
]

function AdvancedFilterableTableThumbnail() {
  const rows = [
    { id: "REC-2437", name: "Lucia Romano", company: "Saffron Digital", status: "Open", priority: "Urgent" },
    { id: "REC-2430", name: "Chloe Dubois", company: "Ironwood Design", status: "In review", priority: "Urgent" },
  ]
  return (
    <div aria-hidden="true" className="font-data flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="flex flex-col gap-1"><span className="font-heading text-sm font-semibold">Records Explorer</span><span className="text-[11px] text-muted-foreground">36 matching records</span></div>
        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-secondary-foreground">Priority Queue</span>
      </div>
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <span className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 text-[10px] text-muted-foreground"><SearchIcon className="size-3" />Search records</span>
        <span className="rounded-md border px-2 py-1 text-[10px]">Filters · 2</span>
        <span className="hidden rounded-md border px-2 py-1 text-[10px] text-muted-foreground md:inline">Columns</span>
        <span className="hidden rounded-md border px-2 py-1 text-[10px] text-muted-foreground md:inline">Group by</span>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b px-4 py-2">
        <span className="rounded border bg-background px-2 py-1 text-[9px]">Priority is any of Urgent, High</span>
        <span className="rounded border bg-background px-2 py-1 text-[9px]">Status is Open</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-hidden px-2 pt-1">
          <div className="grid grid-cols-[minmax(58px,.8fr)_minmax(80px,1.2fr)_minmax(80px,1fr)_60px] gap-2 border-b px-2 py-2 text-[9px] font-medium text-muted-foreground"><span>Record ID</span><span>Name</span><span>Company</span><span>Priority</span></div>
          {rows.map((row) => <div key={row.id} className="grid grid-cols-[minmax(58px,.8fr)_minmax(80px,1.2fr)_minmax(80px,1fr)_60px] items-center gap-2 border-b px-2 py-2.5 text-[9px] last:border-0"><span className="truncate font-mono text-muted-foreground">{row.id}</span><span className="truncate font-medium">{row.name}</span><span className="truncate">{row.company}</span><span className="truncate rounded bg-warning-soft px-1 py-0.5 text-center text-warning">{row.priority}</span></div>)}
        </div>
        <div className="hidden w-[28%] min-w-24 flex-col gap-2 border-l bg-muted/20 p-3 sm:flex"><span className="font-medium text-[10px]">{rows[0].name}</span><span className="font-mono text-[9px] text-muted-foreground">{rows[0].id}</span><span className="text-[9px]">{rows[0].company}</span><span className="mt-auto text-[8px] text-muted-foreground">Record details</span></div>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-2 text-[9px] text-muted-foreground"><span>Showing 1–10 of 36</span><span>Rows 10&nbsp;&nbsp; ‹ &nbsp; ›</span></div>
    </div>
  )
}

function SettingsFormThumbnail() {
  return (
    <div aria-hidden="true" className="flex h-full min-h-0 flex-col overflow-hidden bg-background px-5 py-4 text-foreground sm:px-7 sm:py-5">
      <div className="mb-3 flex flex-col gap-1 border-b pb-3">
        <span className="font-heading text-sm font-semibold sm:text-base">General Settings</span>
        <span className="text-[10px] text-muted-foreground sm:text-xs">Manage workspace information and preferences.</span>
      </div>
      <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold sm:text-xs">Workspace Information</span>
          <div className="flex flex-col gap-1"><span className="text-[8px] text-muted-foreground sm:text-[10px]">Workspace Name</span><span className="flex h-6 items-center rounded-md border bg-card px-2 text-[9px] sm:h-7 sm:text-[10px]">Northstar Operations</span></div>
          <div className="flex flex-col gap-1"><span className="text-[8px] text-muted-foreground sm:text-[10px]">Workspace Description</span><span className="flex h-8 items-start rounded-md border bg-card px-2 py-1 text-[8px] text-muted-foreground sm:text-[10px]">A shared workspace for coordinating regional operations.</span></div>
        </div>
        <div className="flex flex-col gap-2 border-t pt-3">
          <span className="text-[10px] font-semibold sm:text-xs">Notifications</span>
          <div className="flex items-center justify-between gap-3"><span className="text-[9px] sm:text-[10px]">Enable Email Notifications</span><span className="flex h-3 w-6 items-center justify-end rounded-full bg-primary px-0.5"><span className="size-2 rounded-full bg-primary-foreground" /></span></div>
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-[3px] bg-primary" /><span className="text-[8px] text-muted-foreground sm:text-[10px]">Daily summary · Security alerts</span></div>
        </div>
      </div>
      <div className="mt-auto flex justify-end gap-1.5 border-t pt-2">
        <span className="rounded border px-2 py-1 text-[8px] text-muted-foreground sm:text-[9px]">Cancel</span>
        <span className="rounded bg-primary px-2 py-1 text-[8px] text-primary-foreground sm:text-[9px]">Save Changes</span>
      </div>
    </div>
  )
}

function SettingsDialogThumbnail() {
  return (
    <div aria-hidden="true" className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background p-4 text-foreground sm:p-5">
      <div className="flex flex-col gap-1 opacity-50">
        <span className="text-[8px] font-medium sm:text-[9px]">WORKSPACE</span>
        <span className="font-heading text-xs font-semibold sm:text-sm">Workspace Overview</span>
        <span className="text-[8px] text-muted-foreground sm:text-[9px]">A quick look at your workspace and preferences.</span>
        <span className="mt-3 flex items-center gap-1.5 text-[8px] text-muted-foreground sm:text-[9px]">Notification preferences · Daily Digest</span>
        <span className="mt-2 w-fit rounded-md bg-primary px-2 py-1 text-[8px] text-primary-foreground sm:text-[9px]">Manage Preferences</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 p-2 sm:p-4">
        <div className="flex max-h-full w-full max-w-[300px] flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b px-3 py-2.5 sm:px-4 sm:py-3">
            <span className="font-heading text-[10px] font-semibold sm:text-xs">Notification Preferences</span>
            <span className="mt-0.5 block text-[8px] leading-relaxed text-muted-foreground sm:text-[9px]">Choose what reaches your inbox and how your workspace opens.</span>
          </div>
          <div className="flex min-h-0 flex-col gap-2.5 overflow-hidden px-3 py-2.5 sm:px-4 sm:py-3">
            <span className="text-[8px] font-semibold sm:text-[9px]">Notification Settings</span>
            <div className="flex items-center justify-between gap-3"><span className="text-[8px] sm:text-[9px]">Enable Email Notifications</span><span className="flex h-3 w-6 items-center justify-end rounded-full bg-primary px-0.5"><span className="size-2 rounded-full bg-primary-foreground" /></span></div>
            <div className="flex items-center justify-between rounded border bg-background px-2 py-1 text-[8px] text-muted-foreground sm:text-[9px]"><span>Daily Digest</span><span>⌄</span></div>
            <div className="flex flex-col gap-1 text-[8px] sm:text-[9px]"><span className="text-muted-foreground">Notify About</span><span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-primary" />Important Updates</span><span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-primary" />Assigned Items</span></div>
            <span className="border-t pt-2 text-[8px] font-semibold sm:text-[9px]">Display Preferences</span>
            <div className="flex items-center justify-between rounded border bg-background px-2 py-1 text-[8px] text-muted-foreground sm:text-[9px]"><span>List</span><span>⌄</span></div>
          </div>
          <div className="mt-auto flex justify-end gap-1.5 border-t bg-muted/40 px-3 py-2 sm:px-4">
            <span className="rounded border px-2 py-1 text-[7px] text-muted-foreground sm:text-[8px]">Cancel</span>
            <span className="rounded bg-primary px-2 py-1 text-[7px] text-primary-foreground sm:text-[8px]">Save Changes</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateThumbnail() {
  return (
    <div aria-hidden="true" className="flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-heading text-sm font-semibold tracking-tight sm:text-base">Team directory</span>
          <span className="truncate text-xs text-muted-foreground">Manage people, access, and organization details.</span>
        </div>
        <span className="shrink-0 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground">+ Add Record</span>
      </div>
      <div className="flex items-center gap-2 border-b px-4 py-2.5 sm:px-5">
        <span className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground sm:max-w-56">
          <SearchIcon className="size-3.5 shrink-0" />
          <span className="truncate">Search records...</span>
        </span>
        <span className="hidden h-8 w-28 shrink-0 items-center rounded-md border px-2.5 text-xs text-muted-foreground sm:flex">All statuses</span>
        <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border sm:flex"><SlidersHorizontalIcon className="size-3.5 text-muted-foreground" /></span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-2 pt-1 sm:px-4">
        <div className="grid grid-cols-[minmax(130px,1.2fr)_minmax(100px,1fr)_minmax(80px,.7fr)] gap-3 border-b px-2 py-2 text-[11px] font-medium text-muted-foreground sm:grid-cols-[minmax(180px,1.35fr)_minmax(120px,1fr)_minmax(90px,.7fr)_minmax(80px,.6fr)]">
          <span>Name</span><span>Company</span><span>Department</span><span className="hidden sm:block">Status</span>
        </div>
        {thumbnailRows.map((row, index) => (
          <div key={row.name} className="grid grid-cols-[minmax(130px,1.2fr)_minmax(100px,1fr)_minmax(80px,.7fr)] items-center gap-3 border-b px-2 py-2.5 last:border-0 sm:grid-cols-[minmax(180px,1.35fr)_minmax(120px,1fr)_minmax(90px,.7fr)_minmax(80px,.6fr)]">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-xs font-medium">{row.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">{row.email}</span>
            </span>
            <span className="truncate text-xs">{row.company}</span>
            <span className="truncate text-xs text-muted-foreground">{["Product", "Operations", "Finance"][index]}</span>
            <span className={`hidden w-fit rounded-full px-2 py-0.5 text-[11px] sm:block ${row.status === "Active" ? "bg-success-soft text-success" : "bg-info-soft text-info"}`}>{row.status}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
        <span>Showing 1–3 of 12 records</span>
        <span>Rows&nbsp;&nbsp; 5 &nbsp;&nbsp; ‹ &nbsp; ›</span>
      </div>
    </div>
  )
}

export function TemplatesGallery() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All")
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null)
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false)
  const [closeConfirmationOpen, setCloseConfirmationOpen] = useState(false)

  function handlePreviewOpenChange(open: boolean) {
    if (open) return
    if (activeTemplate?.slug === "create-edit-form" && formHasUnsavedChanges) {
      setCloseConfirmationOpen(true)
      return
    }
    setActiveTemplate(null)
    setFormHasUnsavedChanges(false)
  }

  function closePreviewAndDiscard() {
    setCloseConfirmationOpen(false)
    setActiveTemplate(null)
    setFormHasUnsavedChanges(false)
  }

  const filteredTemplates = useMemo(
    () => activeCategory === "All" ? templates : templates.filter(({ category }) => category === activeCategory),
    [activeCategory],
  )

  return (
    <Dialog open={activeTemplate !== null} onOpenChange={handlePreviewOpenChange}>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-12 sm:gap-10 sm:py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">Templates</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Reusable page templates for enterprise SaaS applications.</p>
        <ToggleGroup
          type="single"
          value={activeCategory}
          onValueChange={(value) => { if (value) setActiveCategory(value as CategoryFilter) }}
          variant="outline"
          size="sm"
          aria-label="Filter templates by category"
          className="mt-3"
        >
          <ToggleGroupItem value="All">All</ToggleGroupItem>
          {availableCategories.map((category) => <ToggleGroupItem key={category} value={category}>{category}</ToggleGroupItem>)}
        </ToggleGroup>
      </header>

      <section aria-label="Template gallery" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.slug} className="group overflow-hidden gap-0 py-0 transition-shadow hover:shadow-lg">
            <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted">
              {template.slug === "settings-panels" ? (
                <Image src="/images/settings-panels-thumbnail.png" alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="bg-card object-contain" />
              ) : template.slug === "analytics-dashboard" ? <AnalyticsDashboardThumbnail /> : template.slug === "settings-form" ? <SettingsFormThumbnail /> : template.slug === "settings-dialog" ? <SettingsDialogThumbnail /> : template.slug === "advanced-filterable-table" ? <AdvancedFilterableTableThumbnail /> : template.slug === "create-edit-form" ? <CreateEditFormThumbnail /> : <TemplateThumbnail />}
              <div className="template-preview-overlay absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 p-5 text-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                <div className="flex max-w-sm flex-col gap-1.5">
                  <p className="font-heading text-lg font-semibold">{template.name}</p>
                  <p className="text-sm leading-relaxed text-white/85">{template.description}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <DialogTrigger asChild>
                    <Button onClick={() => { setFormHasUnsavedChanges(false); setCloseConfirmationOpen(false); setActiveTemplate(template) }} size="sm" variant="secondary">Preview</Button>
                  </DialogTrigger>
                  <Button asChild size="sm" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/15 hover:text-white">
                    <Link href={`/templates/${template.slug}`}>View Documentation</Link>
                  </Button>
                </div>
              </div>
            </div>
            <CardHeader className="gap-2 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="font-heading text-lg leading-snug">{template.name}</CardTitle>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <CardDescription className="min-h-12 leading-relaxed">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between border-t px-5 py-3 text-sm text-muted-foreground">
              <span>{template.reference}</span>
              <ArrowUpRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </CardContent>
          </Card>
        ))}
      </section>

      </main>
      {activeTemplate && (
          <DialogContent
            data-parry-theme
            aria-describedby="template-preview-description"
            className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[90dvh] sm:w-[90vw] sm:max-w-[90vw] xl:w-[88vw] xl:max-w-[88vw]"
          >
            <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 sm:px-6">
              <DialogTitle className="font-heading text-lg font-semibold">{activeTemplate.name}</DialogTitle>
              <DialogDescription id="template-preview-description">{activeTemplate.description}</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6">
              {activeTemplate.slug === "analytics-dashboard" ? <AnalyticsDashboard /> : activeTemplate.slug === "settings-panels" ? <SettingsPanelsPreview /> : activeTemplate.slug === "settings-form" ? <SettingsFormPreview /> : activeTemplate.slug === "settings-dialog" ? <SettingsDialogPreview /> : activeTemplate.slug === "advanced-filterable-table" ? <AdvancedFilterableTablePreview /> : activeTemplate.slug === "create-edit-form" ? <CreateEditForm onDirtyChange={setFormHasUnsavedChanges} onRequestBack={() => handlePreviewOpenChange(false)} /> : <DataManagementListPreview showControls />}
            </div>
            <footer className="flex shrink-0 flex-col gap-3 border-t bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{activeTemplate.category}</Badge>
                <span className="text-sm text-muted-foreground">{activeTemplate.reference}</span>
              </div>
              <Button asChild size="sm">
                <Link href={`/templates/${activeTemplate.slug}`}>
                  View Documentation <ArrowUpRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </footer>
          </DialogContent>
      )}
      {activeTemplate?.slug === "create-edit-form" && (
        <Dialog open={closeConfirmationOpen} onOpenChange={setCloseConfirmationOpen}>
          <DialogContent data-parry-theme>
            <DialogHeader>
              <DialogTitle>Discard unsaved changes?</DialogTitle>
              <DialogDescription>Your form has unsaved edits. Keep working or discard them and close the preview.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCloseConfirmationOpen(false)}>Keep Editing</Button>
              <Button type="button" variant="destructive" onClick={closePreviewAndDiscard}>Discard Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
