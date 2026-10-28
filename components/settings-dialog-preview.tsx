"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { BellRingIcon, CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

type SettingsValues = {
  emailNotifications: boolean
  frequency: string
  notifyAbout: string[]
  defaultView: string
  compactMode: boolean
}

type SettingsErrors = Partial<Record<"frequency" | "notifyAbout" | "defaultView", string>>

const defaultSettings: SettingsValues = {
  emailNotifications: true,
  frequency: "daily",
  notifyAbout: ["important-updates", "assigned-items"],
  defaultView: "list",
  compactMode: false,
}

const frequencyOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "daily", label: "Daily Digest" },
  { value: "weekly", label: "Weekly Digest" },
]

const notificationOptions = [
  { value: "important-updates", label: "Important Updates" },
  { value: "assigned-items", label: "Assigned Items" },
  { value: "system-announcements", label: "System Announcements" },
]

function summarizeSettings(settings: SettingsValues) {
  if (!settings.emailNotifications) return "Email notifications off"
  const frequency = frequencyOptions.find((option) => option.value === settings.frequency)?.label ?? "Frequency not set"
  const topics = settings.notifyAbout
    .map((value) => notificationOptions.find((option) => option.value === value)?.label)
    .filter(Boolean)
  return `${frequency} · ${topics.join(", ") || "No topics selected"}`
}

export function SettingsDialogPreview() {
  const [open, setOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [draft, setDraft] = useState<SettingsValues>(defaultSettings)
  const [saved, setSaved] = useState<SettingsValues>(defaultSettings)
  const [errors, setErrors] = useState<SettingsErrors>({})
  const [saving, setSaving] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const frequencyTriggerRef = useRef<HTMLButtonElement>(null)
  const firstTopicRef = useRef<HTMLButtonElement>(null)
  const defaultViewTriggerRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const saveTimerRef = useRef<number | null>(null)
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(saved)
  const notificationFieldsDisabled = !draft.emailNotifications || saving

  useEffect(() => () => {
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
  }, [])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => {
      if (confirmationOpen) confirmButtonRef.current?.focus()
      else headingRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [confirmationOpen, open])

  function updateDraft<Key extends keyof SettingsValues>(key: Key, value: SettingsValues[Key]) {
    setDraft((current) => ({ ...current, [key]: value }))
    if (key === "emailNotifications" && value === false) {
      setErrors((current) => ({ ...current, frequency: undefined, notifyAbout: undefined }))
    } else if (key === "frequency" || key === "notifyAbout" || key === "defaultView") {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  function openDialog() {
    setDraft(saved)
    setErrors({})
    setConfirmationOpen(false)
    setOpen(true)
  }

  function closeDialog() {
    setOpen(false)
    setConfirmationOpen(false)
    setErrors({})
  }

  function requestClose() {
    if (saving || confirmationOpen) return
    if (hasChanges) {
      setConfirmationOpen(true)
      return
    }
    closeDialog()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) openDialog()
    else requestClose()
  }

  function discardChanges() {
    setDraft(saved)
    setErrors({})
    closeDialog()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasChanges || saving) return

    const nextErrors: SettingsErrors = {}
    if (draft.emailNotifications) {
      if (!frequencyOptions.some((option) => option.value === draft.frequency)) {
        nextErrors.frequency = "Choose how often to receive notifications."
      }
      if (draft.notifyAbout.length === 0) {
        nextErrors.notifyAbout = "Select at least one notification topic."
      }
    }
    if (draft.defaultView !== "list" && draft.defaultView !== "grid") {
      nextErrors.defaultView = "Choose a default view."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      window.requestAnimationFrame(() => {
        if (nextErrors.frequency) frequencyTriggerRef.current?.focus()
        else if (nextErrors.notifyAbout) firstTopicRef.current?.focus()
        else defaultViewTriggerRef.current?.focus()
      })
      return
    }

    setErrors({})
    setSaving(true)
    saveTimerRef.current = window.setTimeout(() => {
      setSaved(draft)
      setSaving(false)
      closeDialog()
      toast.success("Notification preferences saved.", {
        description: "Your workspace overview has been updated.",
        position: "bottom-right",
      })
      saveTimerRef.current = null
    }, 450)
  }

  return (
    <section aria-label="Settings Dialog live preview" className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-2 sm:py-6">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">Workspace</Badge>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Workspace Overview</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">A quick look at your workspace and the preferences that shape your day.</p>
        </div>
      </header>

      <div className="flex flex-col gap-5 border-y py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
            <BellRingIcon aria-hidden="true" className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm font-medium">Notification preferences</p>
            <p aria-live="polite" className="text-sm leading-relaxed text-muted-foreground">{summarizeSettings(saved)}</p>
            <p className="text-xs text-muted-foreground">Default view: {saved.defaultView === "grid" ? "Grid" : "List"} · Compact mode {saved.compactMode ? "on" : "off"}</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full shrink-0 sm:w-auto">Manage Preferences</Button>
          </DialogTrigger>
          <DialogContent
            data-parry-theme
            data-settings-dialog
            showCloseButton={false}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              headingRef.current?.focus()
            }}
            className="font-data flex h-[88dvh] max-h-[88dvh] min-h-0 w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:w-[min(34rem,calc(100vw-3rem))] sm:max-w-[34rem]"
          >
            <DialogHeader className="relative shrink-0 border-b px-6 py-5 pr-14">
              <DialogTitle ref={headingRef} tabIndex={-1} className="font-data text-xl font-semibold leading-7 outline-none">Notification Preferences</DialogTitle>
              <DialogDescription className="text-sm leading-5">Choose what reaches your inbox and how your workspace opens.</DialogDescription>
              {!confirmationOpen && (
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Close notification preferences" onClick={requestClose} disabled={saving} className="absolute top-5 right-6">
                  <XIcon aria-hidden="true" />
                </Button>
              )}
            </DialogHeader>

            {confirmationOpen ? (
              <section role="alertdialog" aria-labelledby="settings-dialog-discard-title" aria-describedby="settings-dialog-discard-description" className="flex flex-1 flex-col justify-center gap-5 p-5 sm:p-6">
                <div className="flex flex-col gap-2">
                  <h3 id="settings-dialog-discard-title" className="font-data text-base font-semibold leading-6">Discard unsaved changes?</h3>
                  <p id="settings-dialog-discard-description" className="text-[13px] leading-5 text-muted-foreground">Your edits will be replaced with the most recently saved preferences.</p>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setConfirmationOpen(false)}>Keep Editing</Button>
                  <Button type="button" variant="destructive" onClick={discardChanges} ref={confirmButtonRef}>Discard Changes</Button>
                </div>
              </section>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-6">
                  <section aria-labelledby="settings-dialog-notifications-heading" className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <h3 id="settings-dialog-notifications-heading" className="font-data text-base font-semibold leading-6">Notification Settings</h3>
                      <p className="text-[13px] leading-5 text-muted-foreground">Control email delivery and choose which updates matter.</p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="settings-dialog-email" className="text-sm font-medium leading-5">Enable Email Notifications</Label>
                        <p id="settings-dialog-email-description" className="text-[13px] leading-5 text-muted-foreground">Receive selected workspace updates by email.</p>
                      </div>
                      <Switch size="sm" id="settings-dialog-email" checked={draft.emailNotifications} onCheckedChange={(checked) => updateDraft("emailNotifications", checked)} disabled={saving} aria-describedby="settings-dialog-email-description" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="settings-dialog-frequency" className="text-sm font-medium leading-5">Notification Frequency <span aria-hidden="true" className="text-destructive">*</span></Label>
                      <Select value={draft.frequency} onValueChange={(value) => updateDraft("frequency", value)} disabled={notificationFieldsDisabled}>
                        <SelectTrigger ref={frequencyTriggerRef} id="settings-dialog-frequency" className="w-full" aria-invalid={Boolean(errors.frequency)} aria-describedby={errors.frequency ? "settings-dialog-frequency-error" : "settings-dialog-frequency-help"}>
                          <SelectValue placeholder="Choose a frequency" />
                        </SelectTrigger>
                        <SelectContent data-parry-theme position="popper" sideOffset={4}>
                          <SelectGroup>{frequencyOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup>
                        </SelectContent>
                      </Select>
                      <p id={errors.frequency ? "settings-dialog-frequency-error" : "settings-dialog-frequency-help"} aria-live="polite" className={errors.frequency ? "text-[13px] leading-5 text-destructive" : "text-[13px] leading-5 text-muted-foreground"}>
                        {errors.frequency ?? "Choose when enabled notification topics arrive."}
                      </p>
                    </div>

                    <fieldset disabled={notificationFieldsDisabled} aria-describedby={errors.notifyAbout ? "settings-dialog-topics-error" : "settings-dialog-topics-help"} className="flex flex-col gap-2 disabled:opacity-60">
                      <legend className="text-sm font-medium leading-5">Notify About <span aria-hidden="true" className="text-destructive">*</span></legend>
                      <p id={errors.notifyAbout ? "settings-dialog-topics-error" : "settings-dialog-topics-help"} aria-live="polite" className={errors.notifyAbout ? "text-[13px] leading-5 text-destructive" : "text-[13px] leading-5 text-muted-foreground"}>
                        {errors.notifyAbout ?? "Select one or more types of updates."}
                      </p>
                      <div className="flex flex-col gap-3">
                        {notificationOptions.map((option) => {
                          const checked = draft.notifyAbout.includes(option.value)
                          const id = `settings-dialog-topic-${option.value}`
                          return (
                            <div key={option.value} className="flex items-center gap-2">
                              <Checkbox
                                id={id}
                                ref={option.value === notificationOptions[0].value ? firstTopicRef : undefined}
                                checked={checked}
                                disabled={notificationFieldsDisabled}
                                aria-invalid={Boolean(errors.notifyAbout)}
                                aria-describedby={errors.notifyAbout ? "settings-dialog-topics-error" : "settings-dialog-topics-help"}
                                onCheckedChange={(nextChecked) => updateDraft("notifyAbout", nextChecked === true ? [...draft.notifyAbout, option.value] : draft.notifyAbout.filter((item) => item !== option.value))}
                              />
                              <Label htmlFor={id} className="min-h-6 text-sm font-normal leading-5">{option.label}</Label>
                            </div>
                          )
                        })}
                      </div>
                    </fieldset>
                    {!draft.emailNotifications && <p className="text-[13px] leading-5 text-muted-foreground">Email delivery is off. Your frequency and selected topics are preserved.</p>}
                  </section>

                  <Separator />

                  <section aria-labelledby="settings-dialog-display-heading" className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <h3 id="settings-dialog-display-heading" className="font-data text-base font-semibold leading-6">Display Preferences</h3>
                      <p className="text-[13px] leading-5 text-muted-foreground">Set the starting view and density of workspace content.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="settings-dialog-default-view" className="text-sm font-medium leading-5">Default View <span aria-hidden="true" className="text-destructive">*</span></Label>
                      <Select value={draft.defaultView} onValueChange={(value) => updateDraft("defaultView", value)} disabled={saving}>
                        <SelectTrigger ref={defaultViewTriggerRef} id="settings-dialog-default-view" className="w-full" aria-invalid={Boolean(errors.defaultView)} aria-describedby={errors.defaultView ? "settings-dialog-default-view-error" : "settings-dialog-default-view-help"}>
                          <SelectValue placeholder="Choose a default view" />
                        </SelectTrigger>
                        <SelectContent data-parry-theme position="popper" sideOffset={4}>
                          <SelectGroup>
                            <SelectItem value="list">List</SelectItem>
                            <SelectItem value="grid">Grid</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p id={errors.defaultView ? "settings-dialog-default-view-error" : "settings-dialog-default-view-help"} aria-live="polite" className={errors.defaultView ? "text-[13px] leading-5 text-destructive" : "text-[13px] leading-5 text-muted-foreground"}>
                        {errors.defaultView ?? "Choose how workspace content is arranged by default."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="settings-dialog-compact-mode" className="text-sm font-medium leading-5">Compact Mode</Label>
                        <p id="settings-dialog-compact-description" className="text-[13px] leading-5 text-muted-foreground">Reduce spacing to fit more content on screen.</p>
                      </div>
                      <Switch size="sm" id="settings-dialog-compact-mode" checked={draft.compactMode} onCheckedChange={(checked) => updateDraft("compactMode", checked)} disabled={saving} aria-describedby="settings-dialog-compact-description" />
                    </div>
                  </section>
                </div>

                <DialogFooter className="sticky bottom-0 mx-0 mb-0 shrink-0 flex-row justify-end gap-3 rounded-none border-t bg-popover px-6 py-4 sm:px-6">
                  <Button type="button" variant="outline" size="lg" onClick={requestClose} disabled={saving}>Cancel</Button>
                  <Button type="submit" size="lg" disabled={!hasChanges || saving}>
                    {saving ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <CheckIcon data-icon="inline-start" />}
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">Manage notification and display preferences without leaving this page.</p>
    </section>
  )
}
