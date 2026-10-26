"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import { DataManagementListPreview } from "@/components/data-management-list-preview"
import { SettingsPanelsPreview } from "@/components/settings-panels-preview"
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
    description: "A configurable table for finding, filtering, and maintaining business records.",
    category: "Table",
    reference: "Parry UI · Data management",
  },
  {
    slug: "settings-panels",
    name: "Settings Panels",
    description: "A section-based settings workspace for managing complex application configurations.",
    category: "Settings",
    reference: "Parry UI · Workspace settings",
  },
]

const availableCategories = Array.from(new Set(templates.map(({ category }) => category)))

const thumbnailRows = [
  { name: "Alya Pratama", email: "alya.pratama@northstar.co", company: "Northstar Labs", status: "Active" },
  { name: "Rafael Putra", email: "rafael.putra@horizon.id", company: "Horizon Group", status: "Active" },
  { name: "Mei Tan", email: "mei.tan@meridian.co", company: "Meridian Works", status: "Invited" },
]

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

  const filteredTemplates = useMemo(
    () => activeCategory === "All" ? templates : templates.filter(({ category }) => category === activeCategory),
    [activeCategory],
  )

  return (
    <Dialog open={activeTemplate !== null} onOpenChange={(open) => { if (!open) setActiveTemplate(null) }}>
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
              ) : <TemplateThumbnail />}
              <div className="template-preview-overlay absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 p-5 text-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                <div className="flex max-w-sm flex-col gap-1.5">
                  <p className="font-heading text-lg font-semibold">{template.name}</p>
                  <p className="text-sm leading-relaxed text-white/85">{template.description}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <DialogTrigger asChild>
                    <Button onClick={() => setActiveTemplate(template)} size="sm" variant="secondary">Preview</Button>
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
              {activeTemplate.slug === "settings-panels" ? <SettingsPanelsPreview /> : <DataManagementListPreview showControls />}
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
    </Dialog>
  )
}
