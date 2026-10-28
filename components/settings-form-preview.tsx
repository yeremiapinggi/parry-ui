"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

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

type SettingsFormValues = {
  workspaceName: string
  workspaceDescription: string
  language: string
  timezone: string
  emailNotifications: boolean
  notificationFrequency: string
  alertPreferences: string[]
  defaultView: string
  displayDensity: string
  automaticRefresh: boolean
}

type SettingsFormErrors = Partial<Record<"workspaceName", string>>

const storageKey = "parry-ui-settings-form-v1"

function createDefaultValues(): SettingsFormValues {
  return {
    workspaceName: "Northstar Operations",
    workspaceDescription: "A shared workspace for coordinating regional operations.",
    language: "en",
    timezone: "america-los-angeles",
    emailNotifications: true,
    notificationFrequency: "daily",
    alertPreferences: ["security", "workspace-activity"],
    defaultView: "overview",
    displayDensity: "comfortable",
    automaticRefresh: true,
  }
}

function isSettingsFormValues(value: unknown): value is SettingsFormValues {
  if (!value || typeof value !== "object") return false
  const settings = value as Record<string, unknown>
  return (
    typeof settings.workspaceName === "string" &&
    typeof settings.workspaceDescription === "string" &&
    typeof settings.language === "string" &&
    typeof settings.timezone === "string" &&
    typeof settings.emailNotifications === "boolean" &&
    typeof settings.notificationFrequency === "string" &&
    Array.isArray(settings.alertPreferences) && settings.alertPreferences.every((item) => typeof item === "string") &&
    typeof settings.defaultView === "string" &&
    typeof settings.displayDensity === "string" &&
    typeof settings.automaticRefresh === "boolean"
  )
}

export function SettingsFormPreview() {
  const router = useRouter()
  const workspaceNameRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<SettingsFormValues>(createDefaultValues)
  const [savedValues, setSavedValues] = useState<SettingsFormValues>(createDefaultValues)
  const [fieldErrors, setFieldErrors] = useState<SettingsFormErrors>({})
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const hasUnsavedChanges = JSON.stringify(values) !== JSON.stringify(savedValues)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let restoredValues = createDefaultValues()
      try {
        const storedValue = window.localStorage.getItem(storageKey)
        if (storedValue) {
          const parsedValue: unknown = JSON.parse(storedValue)
          if (isSettingsFormValues(parsedValue)) restoredValues = parsedValue
        }
      } catch {
        restoredValues = createDefaultValues()
      }
      setValues(restoredValues)
      setSavedValues(restoredValues)
      setHydrated(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!hasUnsavedChanges) return

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
      setPendingNavigation(`${destination.pathname}${destination.search}${destination.hash}`)
      setDiscardDialogOpen(true)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("click", handleInternalNavigation, true)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("click", handleInternalNavigation, true)
    }
  }, [hasUnsavedChanges])

  function updateValue<Key extends keyof SettingsFormValues>(key: Key, value: SettingsFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
    if (key === "workspaceName" && typeof value === "string" && value.trim()) {
      setFieldErrors((current) => ({ ...current, workspaceName: undefined }))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hydrated || saving) return

    const nextErrors: SettingsFormErrors = {}
    const normalizedName = values.workspaceName.trim()
    if (!normalizedName) nextErrors.workspaceName = "Workspace name is required."

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      workspaceNameRef.current?.focus()
      return
    }

    const nextValues = {
      ...values,
      workspaceName: normalizedName,
      workspaceDescription: values.workspaceDescription.trim(),
    }
    setSaving(true)
    window.requestAnimationFrame(() => {
      let stored = true
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextValues))
      } catch {
        stored = false
      }
      setValues(nextValues)
      setSavedValues(nextValues)
      setFieldErrors({})
      setSaving(false)
      toast.success("Settings saved in this preview.", {
        description: stored ? "Your changes are saved in this browser." : "Browser storage is unavailable; changes are saved for this session only.",
        position: "bottom-right",
      })
    })
  }

  function requestCancel() {
    if (!hasUnsavedChanges || saving) return
    setPendingNavigation(null)
    setDiscardDialogOpen(true)
  }

  function discardChanges() {
    setValues(savedValues)
    setFieldErrors({})
    setDiscardDialogOpen(false)
    if (pendingNavigation) router.push(pendingNavigation)
    setPendingNavigation(null)
  }

  function handleDialogOpenChange(open: boolean) {
    setDiscardDialogOpen(open)
    if (!open) setPendingNavigation(null)
  }

  const notificationsDisabled = !values.emailNotifications || !hydrated || saving
  const nameError = fieldErrors.workspaceName

  return (
    <section aria-label="Settings Form preview" className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">General Settings</h2>
          {hasUnsavedChanges && <Badge variant="outline" className="border-warning/40 bg-warning-soft text-warning">Unsaved Changes</Badge>}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">Manage workspace information and preferences.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col">
        <section aria-labelledby="workspace-information-heading" className="flex flex-col gap-6 py-6 first:pt-0">
          <div className="flex flex-col gap-1">
            <h3 id="workspace-information-heading" className="font-heading text-lg font-semibold">Workspace Information</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Set the name, language, and time zone people see across this workspace.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-form-workspace-name">Workspace Name <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              ref={workspaceNameRef}
              id="settings-form-workspace-name"
              value={values.workspaceName}
              onChange={(event) => updateValue("workspaceName", event.target.value)}
              disabled={!hydrated || saving}
              required
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "settings-form-workspace-name-error" : "settings-form-workspace-name-help"}
            />
            <p id={nameError ? "settings-form-workspace-name-error" : "settings-form-workspace-name-help"} aria-live="polite" className={nameError ? "text-sm text-destructive" : "text-sm leading-relaxed text-muted-foreground"}>
              {nameError ?? "This name appears in workspace navigation and invitations."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-form-workspace-description">Workspace Description</Label>
            <Textarea
              id="settings-form-workspace-description"
              value={values.workspaceDescription}
              onChange={(event) => updateValue("workspaceDescription", event.target.value)}
              disabled={!hydrated || saving}
              rows={3}
              aria-describedby="settings-form-workspace-description-help"
            />
            <p id="settings-form-workspace-description-help" className="text-sm leading-relaxed text-muted-foreground">A short summary to help teammates understand what this workspace is for.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-form-language">Default Language</Label>
              <Select value={values.language} onValueChange={(value) => updateValue("language", value)} disabled={!hydrated || saving}>
                <SelectTrigger id="settings-form-language" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent data-parry-theme position="popper"><SelectGroup>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
              <p className="text-sm leading-relaxed text-muted-foreground">Used for system messages and date formatting.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-form-timezone">Timezone</Label>
              <Select value={values.timezone} onValueChange={(value) => updateValue("timezone", value)} disabled={!hydrated || saving}>
                <SelectTrigger id="settings-form-timezone" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent data-parry-theme position="popper"><SelectGroup>
                  <SelectItem value="america-los-angeles">Pacific Time (UTC−08:00)</SelectItem>
                  <SelectItem value="america-new-york">Eastern Time (UTC−05:00)</SelectItem>
                  <SelectItem value="europe-london">London (UTC+00:00)</SelectItem>
                  <SelectItem value="asia-jakarta">Jakarta (UTC+07:00)</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
              <p className="text-sm leading-relaxed text-muted-foreground">Used to display dates and schedule workspace activity.</p>
            </div>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="notifications-heading" className="flex flex-col gap-6 py-6">
          <div className="flex flex-col gap-1">
            <h3 id="notifications-heading" className="font-heading text-lg font-semibold">Notifications</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Choose which updates arrive in your inbox and how often.</p>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor="settings-form-email-notifications" className="text-sm font-medium">Enable Email Notifications</Label>
              <p id="settings-form-email-notifications-help" className="text-sm leading-relaxed text-muted-foreground">Receive workspace updates and alerts by email.</p>
            </div>
            <Switch id="settings-form-email-notifications" checked={values.emailNotifications} onCheckedChange={(checked) => updateValue("emailNotifications", checked)} disabled={!hydrated || saving} aria-describedby="settings-form-email-notifications-help" />
          </div>

          <fieldset disabled={notificationsDisabled} className="flex flex-col gap-4 disabled:opacity-60">
            <legend className="text-sm font-medium">Notification Frequency</legend>
            <p id="settings-form-frequency-help" className="text-sm leading-relaxed text-muted-foreground">Choose how often email notifications are grouped.</p>
            <RadioGroup value={values.notificationFrequency} onValueChange={(value) => updateValue("notificationFrequency", value)} aria-label="Notification Frequency" aria-describedby="settings-form-frequency-help" className="flex flex-col gap-3">
              {[{ value: "immediately", label: "As they happen" }, { value: "daily", label: "Daily summary" }, { value: "weekly", label: "Weekly summary" }].map((option) => (
                <div key={option.value} className="flex items-center gap-3">
                  <RadioGroupItem id={`settings-form-frequency-${option.value}`} value={option.value} />
                  <Label htmlFor={`settings-form-frequency-${option.value}`} className="font-normal">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          <fieldset disabled={notificationsDisabled} className="flex flex-col gap-4 disabled:opacity-60">
            <legend className="text-sm font-medium">Alert Preferences</legend>
            <p id="settings-form-alerts-help" className="text-sm leading-relaxed text-muted-foreground">Select the updates you want included in email notifications.</p>
            <div className="flex flex-col gap-3">
              {[{ value: "product-updates", label: "Product updates" }, { value: "security", label: "Security alerts" }, { value: "workspace-activity", label: "Workspace activity" }].map((option) => {
                const checked = values.alertPreferences.includes(option.value)
                const id = `settings-form-alert-${option.value}`
                return (
                  <div key={option.value} className="flex items-center gap-3">
                    <Checkbox id={id} checked={checked} disabled={notificationsDisabled} onCheckedChange={(nextChecked) => updateValue("alertPreferences", nextChecked === true ? [...values.alertPreferences, option.value] : values.alertPreferences.filter((item) => item !== option.value))} aria-describedby="settings-form-alerts-help" />
                    <Label htmlFor={id} className="font-normal">{option.label}</Label>
                  </div>
                )
              })}
            </div>
            {!values.emailNotifications && <p className="text-sm leading-relaxed text-muted-foreground">Turn on email notifications to edit these preferences. Your selections are preserved while notifications are off.</p>}
          </fieldset>
        </section>

        <Separator />

        <section aria-labelledby="preferences-heading" className="flex flex-col gap-6 py-6">
          <div className="flex flex-col gap-1">
            <h3 id="preferences-heading" className="font-heading text-lg font-semibold">Preferences</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Personalize how this workspace opens and displays information.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-form-default-view">Default View</Label>
            <Select value={values.defaultView} onValueChange={(value) => updateValue("defaultView", value)} disabled={!hydrated || saving}>
              <SelectTrigger id="settings-form-default-view" className="w-full sm:max-w-md"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme position="popper"><SelectGroup>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="my-tasks">My tasks</SelectItem>
                <SelectItem value="recent-activity">Recent activity</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
            <p className="text-sm leading-relaxed text-muted-foreground">The first page shown when you open this workspace.</p>
          </div>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium">Display Density</legend>
            <p id="settings-form-density-help" className="text-sm leading-relaxed text-muted-foreground">Choose the amount of space between items.</p>
            <RadioGroup value={values.displayDensity} onValueChange={(value) => updateValue("displayDensity", value)} disabled={!hydrated || saving} aria-label="Display Density" aria-describedby="settings-form-density-help" className="flex flex-col gap-3">
              {[{ value: "comfortable", label: "Comfortable", description: "More spacing for easier scanning." }, { value: "compact", label: "Compact", description: "Fit more content on the screen." }].map((option) => (
                <div key={option.value} className="flex items-start gap-3">
                  <RadioGroupItem id={`settings-form-density-${option.value}`} value={option.value} className="mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor={`settings-form-density-${option.value}`} className="font-normal">{option.label}</Label>
                    <span className="text-sm leading-relaxed text-muted-foreground">{option.description}</span>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor="settings-form-automatic-refresh" className="text-sm font-medium">Automatic Refresh</Label>
              <p id="settings-form-automatic-refresh-help" className="text-sm leading-relaxed text-muted-foreground">Refresh workspace information automatically while you work.</p>
            </div>
            <Switch id="settings-form-automatic-refresh" checked={values.automaticRefresh} onCheckedChange={(checked) => updateValue("automaticRefresh", checked)} disabled={!hydrated || saving} aria-describedby="settings-form-automatic-refresh-help" />
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">{saving ? "Saving changes in this preview…" : hydrated ? "Your settings are saved only in this browser preview." : "Loading saved demo settings…"}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={requestCancel} disabled={!hasUnsavedChanges || saving}>Cancel</Button>
            <Button type="submit" disabled={!hydrated || !hasUnsavedChanges || saving}>
              {saving ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <CheckIcon data-icon="inline-start" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </footer>
      </form>

      <Dialog open={discardDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent data-parry-theme>
          <DialogHeader>
            <DialogTitle>{pendingNavigation ? "Discard unsaved changes?" : "Discard your changes?"}</DialogTitle>
            <DialogDescription>{pendingNavigation ? "You have edits that have not been saved. Continue and discard these changes?" : "Your edits will be replaced with the most recently saved settings."}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>Keep editing</Button>
            <Button type="button" variant="destructive" onClick={discardChanges}>Discard changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
