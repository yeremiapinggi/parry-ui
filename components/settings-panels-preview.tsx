"use client"

import { useState } from "react"
import {
  CheckIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  createDefaultSettingsValues,
  settingsPanelSectionById,
  settingsPanelSections,
  type SectionId,
  type SettingField,
  type SettingKey,
  type SettingsSection,
  type SettingsValues,
} from "@/lib/settings-panels-config"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const sectionById = settingsPanelSectionById

function sectionValues(values: SettingsValues, section: SettingsSection) {
  return Object.fromEntries(section.fields.map(({ key }) => [key, values[key]]))
}

function sectionsEqual(first: SettingsValues, second: SettingsValues, section: SettingsSection) {
  return JSON.stringify(sectionValues(first, section)) === JSON.stringify(sectionValues(second, section))
}

export function SettingsPanelsPreview() {
  const [activeSection, setActiveSection] = useState<SectionId>("general")
  const [draftValues, setDraftValues] = useState<SettingsValues>(createDefaultSettingsValues())
  const [savedValues, setSavedValues] = useState<SettingsValues>(createDefaultSettingsValues())
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SettingKey, string>>>({})
  const [saving, setSaving] = useState(false)
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [discardIntent, setDiscardIntent] = useState<"navigation" | "cancel">("navigation")
  const [destructiveDialogOpen, setDestructiveDialogOpen] = useState(false)

  const activeDefinition = sectionById[activeSection]
  const hasUnsavedChanges = !sectionsEqual(draftValues, savedValues, activeDefinition)

  function updateValue(key: SettingKey, value: string | boolean | string[]) {
    setDraftValues((current) => ({ ...current, [key]: value }) as SettingsValues)
    if (fieldErrors[key]) setFieldErrors((current) => ({ ...current, [key]: undefined }))
  }

  function validateCurrentSection() {
    const errors: Partial<Record<SettingKey, string>> = {}
    activeDefinition.fields.forEach((field) => {
      const fieldValue = draftValues[field.key]
      if (field.required && typeof fieldValue === "string" && !fieldValue.trim()) {
        errors[field.key] = `${field.label} is required.`
      }
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function saveCurrentSection(nextSection?: SectionId) {
    if (!validateCurrentSection()) return
    const section = activeDefinition
    const sectionDraft = sectionValues(draftValues, section)
    setSaving(true)
    window.setTimeout(() => {
      setSavedValues((current) => ({ ...current, ...sectionDraft }) as SettingsValues)
      setFieldErrors({})
      setSaving(false)
      setDiscardDialogOpen(false)
      if (nextSection) setActiveSection(nextSection)
      setPendingSection(null)
      toast.success("Settings saved successfully.", { position: "bottom-right" })
    }, 450)
  }

  function requestSectionChange(nextSection: SectionId) {
    if (nextSection === activeSection) return
    if (hasUnsavedChanges) {
      setPendingSection(nextSection)
      setDiscardIntent("navigation")
      setDiscardDialogOpen(true)
      return
    }
    setActiveSection(nextSection)
    setFieldErrors({})
  }

  function restoreCurrentSection() {
    setDraftValues((current) => ({ ...current, ...sectionValues(savedValues, activeDefinition) }) as SettingsValues)
    setFieldErrors({})
  }

  function requestCancel() {
    if (!hasUnsavedChanges) return
    setPendingSection(null)
    setDiscardIntent("cancel")
    setDiscardDialogOpen(true)
  }

  function discardAndContinue() {
    restoreCurrentSection()
    setDiscardDialogOpen(false)
    if (pendingSection) setActiveSection(pendingSection)
    setPendingSection(null)
  }

  function resetSectionToDefaults() {
    const defaults = sectionValues(createDefaultSettingsValues(), activeDefinition)
    setDraftValues((current) => ({ ...current, ...defaults }) as SettingsValues)
    setFieldErrors({})
  }

  function renderField(field: SettingField) {
    const fieldId = `settings-${field.key}`
    const error = fieldErrors[field.key]
    const value = draftValues[field.key]
    const descriptionId = field.description ? `${fieldId}-description` : undefined
    const errorId = error ? `${fieldId}-error` : undefined

    if (field.type === "switch") {
      return (
        <div key={field.key} className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
          <div className="flex flex-col gap-1">
            <Label htmlFor={fieldId} className="text-sm font-medium">{field.label}</Label>
            {field.description && <p id={descriptionId} className="max-w-xl text-sm leading-relaxed text-muted-foreground">{field.description}</p>}
          </div>
          <Switch id={fieldId} checked={value === true} onCheckedChange={(checked) => updateValue(field.key, checked)} disabled={saving} aria-describedby={descriptionId} />
        </div>
      )
    }

    if (field.type === "checkbox-group") {
      const checkedValues = Array.isArray(value) ? value : []
      return (
        <fieldset key={field.key} className="flex flex-col gap-3">
          <legend className="text-sm font-medium">{field.label}</legend>
          {field.description && <p className="text-sm leading-relaxed text-muted-foreground">{field.description}</p>}
          <div className="flex flex-col gap-3">
            {field.options?.map((option) => {
              const optionId = `${fieldId}-${option.value}`
              const checked = checkedValues.includes(option.value)
              return (
                <div key={option.value} className="flex items-start gap-3">
                  <Checkbox
                    id={optionId}
                    checked={checked}
                    disabled={saving}
                    onCheckedChange={(nextChecked) => updateValue(field.key, nextChecked === true ? [...checkedValues, option.value] : checkedValues.filter((item) => item !== option.value))}
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor={optionId} className="font-normal">{option.label}</Label>
                    {option.description && <span className="text-sm leading-relaxed text-muted-foreground">{option.description}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </fieldset>
      )
    }

    if (field.type === "radio") {
      return (
        <fieldset key={field.key} className="flex flex-col gap-3">
          <legend className="text-sm font-medium">{field.label}</legend>
          <RadioGroup value={String(value)} onValueChange={(nextValue) => updateValue(field.key, nextValue)} disabled={saving} aria-label={field.label} className="flex flex-col gap-3">
            {field.options?.map((option) => {
              const optionId = `${fieldId}-${option.value}`
              return (
                <div key={option.value} className="flex items-start gap-3">
                  <RadioGroupItem id={optionId} value={option.value} />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor={optionId} className="font-normal">{option.label}</Label>
                    {option.description && <span className="text-sm leading-relaxed text-muted-foreground">{option.description}</span>}
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </fieldset>
      )
    }

    return (
      <div key={field.key} className="flex flex-col gap-2">
        <Label htmlFor={fieldId} className="text-sm font-medium">{field.label}{field.required && <span aria-hidden="true" className="text-destructive"> *</span>}</Label>
        {field.type === "input" && (
          <Input
            id={fieldId}
            value={String(value)}
            onChange={(event) => updateValue(field.key, event.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || saving}
            required={field.required}
            aria-invalid={Boolean(error)}
            aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
          />
        )}
        {field.type === "textarea" && (
          <Textarea
            id={fieldId}
            value={String(value)}
            onChange={(event) => updateValue(field.key, event.target.value)}
            placeholder={field.placeholder}
            disabled={saving}
            aria-describedby={descriptionId}
            rows={3}
          />
        )}
        {field.type === "select" && (
          <Select value={String(value)} onValueChange={(nextValue) => updateValue(field.key, nextValue)} disabled={saving}>
            <SelectTrigger id={fieldId} aria-label={field.label} className="w-full" aria-describedby={descriptionId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent data-parry-theme>
              <SelectGroup>{field.options?.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup>
            </SelectContent>
          </Select>
        )}
        {field.description && <p id={descriptionId} className="text-sm leading-relaxed text-muted-foreground">{field.description}</p>}
        <p id={errorId} aria-live="polite" className="min-h-5 text-sm text-destructive">{error ?? " "}</p>
      </div>
    )
  }

  const sectionIcon = (section: SettingsSection) => {
    const Icon = section.icon
    return <Icon aria-hidden="true" className="size-4 shrink-0" />
  }

  return (
    <section aria-label="Settings Panels preview" data-parry-theme className="flex min-w-0 flex-col gap-6 bg-background text-foreground">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Workspace Settings</h2>
          {hasUnsavedChanges && <Badge variant="outline" className="border-destructive/30 text-destructive">Unsaved changes</Badge>}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">Manage workspace configurations and preferences.</p>
      </header>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 lg:sticky lg:top-4">
          <Label htmlFor="settings-section-mobile" className="text-sm font-medium lg:sr-only">Settings section</Label>
          <Select value={activeSection} onValueChange={(value) => requestSectionChange(value as SectionId)} disabled={saving}>
            <SelectTrigger id="settings-section-mobile" className="w-full lg:hidden">
              <SelectValue placeholder="Choose a section" />
            </SelectTrigger>
            <SelectContent data-parry-theme>
              <SelectGroup>{settingsPanelSections.map((section) => <SelectItem key={section.id} value={section.id}>{section.title}</SelectItem>)}</SelectGroup>
            </SelectContent>
          </Select>
          <nav aria-label="Workspace settings sections" className="hidden flex-col gap-1 lg:flex">
            {settingsPanelSections.map((section) => {
              const selected = section.id === activeSection
              return (
                <button
                  key={section.id}
                  type="button"
                  aria-current={selected ? "page" : undefined}
                  disabled={saving}
                  onClick={() => requestSectionChange(section.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${selected ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <span className="flex min-w-0 items-center gap-3">{sectionIcon(section)}<span>{section.title}</span></span>
                  {selected && <ChevronRightIcon aria-hidden="true" className="size-4" />}
                </button>
              )
            })}
          </nav>
          <div className="hidden rounded-md border bg-muted/30 p-3 lg:block">
            <p className="text-xs font-medium">Demo workspace</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Changes stay in this preview and won&apos;t affect a real workspace.</p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border bg-card text-card-foreground">
          <div className="flex items-start gap-3 px-4 py-5 sm:px-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">{sectionIcon(activeDefinition)}</div>
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold tracking-tight">{activeDefinition.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{activeDefinition.description}</p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-6 px-4 py-5 sm:px-6">
            {activeDefinition.fields.map(renderField)}
            {activeSection === "security" && (
              <div className="rounded-md border border-destructive/30 bg-destructive-soft/30 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold">Danger Zone</h4>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">This demo action illustrates a destructive confirmation. It does not change or delete any workspace data.</p>
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => setDestructiveDialogOpen(true)} disabled={saving}>
                    <TriangleAlertIcon data-icon="inline-start" /> Demo destructive action
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Separator />
          <div className="flex flex-col gap-3 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button type="button" variant="ghost" size="sm" onClick={resetSectionToDefaults} disabled={saving}>
              <RotateCcwIcon data-icon="inline-start" /> Reset to Defaults
            </Button>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={requestCancel} disabled={!hasUnsavedChanges || saving}>Cancel Changes</Button>
              <Button type="button" size="sm" onClick={() => saveCurrentSection()} disabled={!hasUnsavedChanges || saving}>
                {saving ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <CheckIcon data-icon="inline-start" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogContent data-parry-theme>
          <DialogHeader>
            <DialogTitle>{discardIntent === "cancel" ? "Discard unsaved changes?" : "Unsaved changes"}</DialogTitle>
            <DialogDescription>{discardIntent === "cancel" ? "Your edits to this section have not been saved." : "Save your changes before moving to another settings section, or discard them."}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setDiscardDialogOpen(false)} disabled={saving}>Stay on Current Section</Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={discardAndContinue} disabled={saving}>Discard Changes</Button>
              {discardIntent === "navigation" && pendingSection && (
                <Button type="button" onClick={() => saveCurrentSection(pendingSection)} disabled={saving}>Save and Continue</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={destructiveDialogOpen} onOpenChange={setDestructiveDialogOpen}>
        <DialogContent data-parry-theme>
          <DialogHeader>
            <DialogTitle>Confirm demo action</DialogTitle>
            <DialogDescription>This is a demonstration only. No workspace data will be changed or deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDestructiveDialogOpen(false)}>Cancel</Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setDestructiveDialogOpen(false)
                toast.success("Demo action confirmed. No workspace data was changed.", { position: "bottom-right" })
              }}
            >
              Confirm demo action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
