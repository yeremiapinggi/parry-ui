"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  SaveIcon,
  ShieldCheckIcon,
} from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type ConnectionType = "API" | "Webhook"
type AuthenticationType = "None" | "API Key" | "OAuth"
type TestResult = "idle" | "testing" | "success" | "failed"

type WizardValues = {
  integrationName: string
  description: string
  connectionType: ConnectionType
  endpointUrl: string
  authenticationType: AuthenticationType
  apiKey: string
  clientId: string
  clientSecret: string
  simulateFailure: boolean
}

type WizardDraft = {
  version: 1
  values: WizardValues
  currentStep: number
  completedSteps: number[]
  testResult: Exclude<TestResult, "testing">
}

type WizardField = keyof WizardValues

const draftStorageKey = "parry-ui-multi-step-form-wizard-draft-v1"

const steps = [
  { title: "Basic Information", shortTitle: "Basics", description: "Name the integration and choose how it connects." },
  { title: "Configuration", shortTitle: "Configure", description: "Set the endpoint and authentication details." },
  { title: "Test Connection", shortTitle: "Test", description: "Run a local demo test before reviewing the integration." },
  { title: "Review & Confirm", shortTitle: "Review", description: "Check the configuration before completing the demo." },
]

const defaultValues: WizardValues = {
  integrationName: "",
  description: "",
  connectionType: "API",
  endpointUrl: "",
  authenticationType: "None",
  apiKey: "",
  clientId: "",
  clientSecret: "",
  simulateFailure: false,
}

const connectionFields = new Set<WizardField>([
  "connectionType",
  "endpointUrl",
  "authenticationType",
  "apiKey",
  "clientId",
  "clientSecret",
  "simulateFailure",
])

function isConnectionType(value: unknown): value is ConnectionType {
  return value === "API" || value === "Webhook"
}

function isAuthenticationType(value: unknown): value is AuthenticationType {
  return value === "None" || value === "API Key" || value === "OAuth"
}

function restoredDraft(value: unknown): WizardDraft | null {
  if (!value || typeof value !== "object") return null

  const draft = value as Partial<WizardDraft>
  const values = draft.values
  if (draft.version !== 1 || !values || typeof values !== "object") return null

  const safeValues: WizardValues = {
    integrationName: typeof values.integrationName === "string" ? values.integrationName : "",
    description: typeof values.description === "string" ? values.description : "",
    connectionType: isConnectionType(values.connectionType) ? values.connectionType : "API",
    endpointUrl: typeof values.endpointUrl === "string" ? values.endpointUrl : "",
    authenticationType: isAuthenticationType(values.authenticationType) ? values.authenticationType : "None",
    apiKey: typeof values.apiKey === "string" ? values.apiKey : "",
    clientId: typeof values.clientId === "string" ? values.clientId : "",
    clientSecret: typeof values.clientSecret === "string" ? values.clientSecret : "",
    simulateFailure: values.simulateFailure === true,
  }
  const validSteps = Array.isArray(draft.completedSteps)
    ? draft.completedSteps.filter((step): step is number => Number.isInteger(step) && step >= 0 && step < steps.length)
    : []
  const validTestResult = draft.testResult === "success" || draft.testResult === "failed" ? draft.testResult : "idle"

  return {
    version: 1,
    values: safeValues,
    currentStep: Number.isInteger(draft.currentStep) ? Math.min(Math.max(draft.currentStep as number, 0), steps.length - 1) : 0,
    completedSteps: [...new Set(validSteps)].sort((first, second) => first - second),
    testResult: validTestResult,
  }
}

function isValidEndpoint(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function MultiStepFormWizard({ onDirtyChange }: { onDirtyChange?: (isDirty: boolean) => void }) {
  const [values, setValues] = useState<WizardValues>(defaultValues)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<WizardField, string>>>({})
  const [testResult, setTestResult] = useState<TestResult>("idle")
  const [testMessage, setTestMessage] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasSavedDraft, setHasSavedDraft] = useState(false)
  const [draftStatus, setDraftStatus] = useState("No draft saved")
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const testTimer = useRef<number | null>(null)
  const createTimer = useRef<number | null>(null)

  // Restore browser-local progress after hydration to keep server and initial client markup identical.
  /* eslint-disable react-hooks/set-state-in-effect -- Browser storage is the demo draft source and is unavailable during server rendering. */
  useEffect(() => {
    try {
      const serializedDraft = window.localStorage.getItem(draftStorageKey)
      if (serializedDraft) {
        const draft = restoredDraft(JSON.parse(serializedDraft))
        if (draft) {
          setValues(draft.values)
          setCurrentStep(draft.currentStep)
          setCompletedSteps(draft.completedSteps)
          setTestResult(draft.testResult)
          setHasSavedDraft(true)
          setDraftStatus("Draft restored from this browser")
        }
      }
    } catch {
      setDraftStatus("Saved draft could not be read")
    }
    setIsHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (!isDirty) return

    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", warnBeforeLeaving)
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving)
  }, [isDirty])

  useEffect(() => () => {
    if (testTimer.current !== null) window.clearTimeout(testTimer.current)
    if (createTimer.current !== null) window.clearTimeout(createTimer.current)
  }, [])

  function markDirty() {
    setIsDirty(true)
    setDraftStatus("Unsaved changes")
  }

  function updateField<K extends WizardField>(field: K, value: WizardValues[K], sourceStep: number) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      const next = { ...current, [field]: undefined }
      if (field === "authenticationType") {
        next.apiKey = undefined
        next.clientId = undefined
        next.clientSecret = undefined
      }
      return next
    })
    setCompletedSteps((current) => current.filter((step) => step < sourceStep))
    if (connectionFields.has(field)) invalidateTestResult()
    markDirty()
  }

  function invalidateTestResult() {
    if (testTimer.current !== null) {
      window.clearTimeout(testTimer.current)
      testTimer.current = null
    }
    setTestResult("idle")
    setTestMessage("")
    setCompletedSteps((current) => current.filter((step) => step < 2))
  }

  function completeStep(step: number) {
    setCompletedSteps((current) => [...new Set([...current, step])].sort((first, second) => first - second))
  }

  function validateStep(step: number) {
    const errors: Partial<Record<WizardField, string>> = {}

    if (step === 0 && !values.integrationName.trim()) {
      errors.integrationName = "Integration name is required."
    }

    if (step === 1) {
      if (!values.endpointUrl.trim()) {
        errors.endpointUrl = "Endpoint URL is required."
      } else if (!isValidEndpoint(values.endpointUrl.trim())) {
        errors.endpointUrl = "Enter a valid HTTP or HTTPS URL."
      }

      if (values.authenticationType === "API Key" && !values.apiKey.trim()) {
        errors.apiKey = "API key is required for this authentication type."
      }
      if (values.authenticationType === "OAuth" && !values.clientId.trim()) {
        errors.clientId = "Client ID is required for OAuth."
      }
      if (values.authenticationType === "OAuth" && !values.clientSecret.trim()) {
        errors.clientSecret = "Client secret is required for OAuth."
      }
    }

    setFieldErrors(errors)
    const firstInvalidField = Object.keys(errors)[0]
    if (firstInvalidField) {
      window.requestAnimationFrame(() => inputRefs.current[firstInvalidField]?.focus())
      return false
    }
    return true
  }

  function goToStep(step: number) {
    if (step !== currentStep && !completedSteps.includes(step)) return
    setCurrentStep(step)
  }

  function continueToNextStep() {
    if (currentStep === 2) {
      if (testResult !== "success") {
        setTestMessage("Complete a successful demo test before continuing.")
        return
      }
      completeStep(2)
      setCurrentStep(3)
      return
    }

    if (currentStep > 2 || !validateStep(currentStep)) return
    completeStep(currentStep)
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  function goBack() {
    setFieldErrors({})
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  function saveDraft() {
    const draft: WizardDraft = {
      version: 1,
      values,
      currentStep,
      completedSteps,
      testResult: testResult === "testing" ? "idle" : testResult,
    }

    try {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(draft))
      setHasSavedDraft(true)
      setIsDirty(false)
      setDraftStatus("Draft saved in this browser")
    } catch {
      setDraftStatus("Draft could not be saved")
    }
  }

  function resetWizard() {
    if (testTimer.current !== null) window.clearTimeout(testTimer.current)
    if (createTimer.current !== null) window.clearTimeout(createTimer.current)
    try {
      window.localStorage.removeItem(draftStorageKey)
    } catch {
      setDraftStatus("Draft could not be cleared")
    }
    setValues(defaultValues)
    setCurrentStep(0)
    setCompletedSteps([])
    setFieldErrors({})
    setTestResult("idle")
    setTestMessage("")
    setHasSavedDraft(false)
    setIsDirty(false)
    setIsCreating(false)
    setIsComplete(false)
    setDraftStatus("Draft cleared")
    setResetDialogOpen(false)
  }

  function runDemoTest() {
    if (testResult === "testing") return
    setTestResult("testing")
    setTestMessage("Checking URL format locally; no request will be sent.")
    testTimer.current = window.setTimeout(() => {
      const passes = isValidEndpoint(values.endpointUrl.trim()) && !values.simulateFailure
      setTestResult(passes ? "success" : "failed")
      setTestMessage(
        passes
          ? "Local demo passed; no request sent."
          : "Local demo failed; no request sent. Turn off simulation and retry.",
      )
      setCompletedSteps((current) => passes
        ? [...new Set([...current, 2])].sort((first, second) => first - second)
        : current.filter((step) => step < 2))
      testTimer.current = null
    }, 800)
  }

  function createDemoIntegration() {
    if (isCreating) return
    setIsCreating(true)
    createTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.removeItem(draftStorageKey)
      } catch {
        setDraftStatus("Demo complete; saved draft could not be cleared")
      }
      setHasSavedDraft(false)
      setIsDirty(false)
      setCompletedSteps([0, 1, 2, 3])
      setIsCreating(false)
      setIsComplete(true)
      setDraftStatus("Demo complete")
      createTimer.current = null
    }, 500)
  }

  const authenticationFields = values.authenticationType === "API Key"
    ? (
      <div className="flex flex-col gap-2">
        <Label htmlFor="wizard-api-key">API Key <span className="text-destructive">*</span></Label>
        <Input
          ref={(node) => { inputRefs.current.apiKey = node }}
          id="wizard-api-key"
          type="password"
          autoComplete="new-password"
          value={values.apiKey}
          onChange={(event) => updateField("apiKey", event.target.value, 1)}
          aria-invalid={Boolean(fieldErrors.apiKey)}
          aria-describedby={fieldErrors.apiKey ? "wizard-api-key-error" : "wizard-api-key-hint"}
        />
        {fieldErrors.apiKey ? <p id="wizard-api-key-error" className="text-sm text-destructive">{fieldErrors.apiKey}</p> : <p id="wizard-api-key-hint" className="text-sm leading-relaxed text-muted-foreground">Masked on screen and in the review summary.</p>}
      </div>
    )
    : values.authenticationType === "OAuth"
      ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="wizard-client-id">Client ID <span className="text-destructive">*</span></Label>
            <Input
              ref={(node) => { inputRefs.current.clientId = node }}
              id="wizard-client-id"
              autoComplete="off"
              value={values.clientId}
              onChange={(event) => updateField("clientId", event.target.value, 1)}
              aria-invalid={Boolean(fieldErrors.clientId)}
              aria-describedby={fieldErrors.clientId ? "wizard-client-id-error" : undefined}
            />
            {fieldErrors.clientId && <p id="wizard-client-id-error" className="text-sm text-destructive">{fieldErrors.clientId}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wizard-client-secret">Client Secret <span className="text-destructive">*</span></Label>
            <Input
              ref={(node) => { inputRefs.current.clientSecret = node }}
              id="wizard-client-secret"
              type="password"
              autoComplete="new-password"
              value={values.clientSecret}
              onChange={(event) => updateField("clientSecret", event.target.value, 1)}
              aria-invalid={Boolean(fieldErrors.clientSecret)}
              aria-describedby={fieldErrors.clientSecret ? "wizard-client-secret-error" : "wizard-client-secret-hint"}
            />
            {fieldErrors.clientSecret ? <p id="wizard-client-secret-error" className="text-sm text-destructive">{fieldErrors.clientSecret}</p> : <p id="wizard-client-secret-hint" className="text-sm leading-relaxed text-muted-foreground">Masked in the form and review summary.</p>}
          </div>
        </div>
      )
      : null

  return (
    <section data-parry-theme aria-label="Multi-Step Form Wizard" className="mx-auto flex min-h-[620px] w-full max-w-4xl flex-col bg-background pb-2 text-foreground">
      <div className="flex flex-col gap-6 px-1 pt-2 sm:gap-8 sm:px-2">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Create Integration</h2>
            <Badge variant="outline">Demo wizard</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Connect a service in four guided steps. Your entries stay in this browser preview.</p>
        </header>

        <nav aria-label="Integration setup steps">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {steps.map((step, index) => {
              const isCurrent = index === currentStep
              const isComplete = completedSteps.includes(index)
              const isAvailable = index <= currentStep || isComplete
              return (
                <li key={step.title}>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!isAvailable}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`${step.title}${isComplete ? ", completed" : isCurrent ? ", current step" : ", upcoming"}`}
                    onClick={() => goToStep(index)}
                    className={`h-auto w-full justify-start gap-2 rounded-lg border px-2.5 py-2 text-left sm:px-3 ${isCurrent ? "border-primary bg-secondary text-secondary-foreground hover:bg-secondary" : isComplete ? "border-primary/40 bg-muted/30 text-foreground hover:bg-muted" : "border-border bg-card text-muted-foreground"}`}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${isComplete ? "bg-primary text-primary-foreground" : isCurrent ? "bg-background text-foreground" : "bg-muted text-muted-foreground"}`}>
                      {isComplete ? <CheckIcon aria-hidden="true" className="size-3.5" /> : index + 1}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-xs font-medium sm:text-sm">{step.shortTitle}</span>
                      <span className="hidden truncate text-[11px] text-muted-foreground sm:block">{isComplete ? "Completed" : isCurrent ? "In progress" : "Upcoming"}</span>
                    </span>
                  </Button>
                </li>
              )
            })}
          </ol>
        </nav>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (currentStep === 3) createDemoIntegration()
            else continueToNextStep()
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1 border-b pb-4">
            <h3 className="font-heading text-lg font-semibold">{steps[currentStep].title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{steps[currentStep].description}</p>
          </div>

          {currentStep === 0 && !isComplete && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="wizard-integration-name">Integration Name <span className="text-destructive">*</span></Label>
                <Input
                  ref={(node) => { inputRefs.current.integrationName = node }}
                  id="wizard-integration-name"
                  autoComplete="off"
                  placeholder="e.g. Customer Data API"
                  value={values.integrationName}
                  onChange={(event) => updateField("integrationName", event.target.value, 0)}
                  aria-invalid={Boolean(fieldErrors.integrationName)}
                  aria-describedby={fieldErrors.integrationName ? "wizard-integration-name-error" : undefined}
                />
                {fieldErrors.integrationName && <p id="wizard-integration-name-error" className="text-sm text-destructive">{fieldErrors.integrationName}</p>}
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="wizard-description">Description <span className="font-normal text-muted-foreground">Optional</span></Label>
                <Textarea
                  id="wizard-description"
                  rows={3}
                  placeholder="What will this integration be used for?"
                  value={values.description}
                  onChange={(event) => updateField("description", event.target.value, 0)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="wizard-connection-type">Connection Type</Label>
                <Select value={values.connectionType} onValueChange={(value) => updateField("connectionType", value as ConnectionType, 0)}>
                  <SelectTrigger id="wizard-connection-type" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent data-parry-theme>
                    <SelectGroup>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Webhook">Webhook</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 1 && !isComplete && (
            <div className="flex flex-col gap-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="wizard-endpoint-url">Endpoint URL <span className="text-destructive">*</span></Label>
                  <Input
                    ref={(node) => { inputRefs.current.endpointUrl = node }}
                    id="wizard-endpoint-url"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://api.example.com/v1"
                    value={values.endpointUrl}
                    onChange={(event) => updateField("endpointUrl", event.target.value, 1)}
                    aria-invalid={Boolean(fieldErrors.endpointUrl)}
                    aria-describedby={fieldErrors.endpointUrl ? "wizard-endpoint-url-error" : "wizard-endpoint-url-hint"}
                  />
                  {fieldErrors.endpointUrl ? <p id="wizard-endpoint-url-error" className="text-sm text-destructive">{fieldErrors.endpointUrl}</p> : <p id="wizard-endpoint-url-hint" className="text-sm leading-relaxed text-muted-foreground">Use a complete HTTP or HTTPS URL.</p>}
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="wizard-auth-type">Authentication Type</Label>
                  <Select value={values.authenticationType} onValueChange={(value) => updateField("authenticationType", value as AuthenticationType, 1)}>
                    <SelectTrigger id="wizard-auth-type" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent data-parry-theme>
                      <SelectGroup>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="API Key">API Key</SelectItem>
                        <SelectItem value="OAuth">OAuth</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {authenticationFields}
              {values.authenticationType === "None" && <p className="text-sm leading-relaxed text-muted-foreground">No credential fields are needed for this connection.</p>}
              <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
                <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>Demo only. Draft values, including masked credentials, are stored in this browser. Do not enter production secrets.</p>
              </div>
            </div>
          )}

          {currentStep === 2 && !isComplete && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">Ready to test {values.integrationName.trim() ? <span className="text-muted-foreground">· {values.integrationName}</span> : null}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">This demo checks that the endpoint is a valid HTTP(S) URL. It does not send a request or contact an external service.</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 focus-within:ring-3 focus-within:ring-ring/50">
                <Checkbox
                  checked={values.simulateFailure}
                  onCheckedChange={(checked) => updateField("simulateFailure", checked === true, 2)}
                  aria-label="Simulate a failed connection test"
                />
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Simulate a failed connection</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">Use this demo control to preview the failure state. Turn it off and test again to pass.</span>
                </span>
              </label>
              {testResult !== "idle" && (
                <div aria-live="polite" role="status" className={`flex items-start gap-3 rounded-lg border p-3 sm:p-4 ${testResult === "success" ? "border-primary/40 bg-muted/30" : testResult === "failed" ? "border-destructive/50 bg-destructive/5" : "bg-muted/30"}`}>
                  {testResult === "testing" ? <LoaderCircleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin" /> : testResult === "success" ? <CircleCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /> : <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />}
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{testResult === "testing" ? "Testing connection…" : testResult === "success" ? "Demo test successful" : "Demo test failed"}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{testMessage}</span>
                  </div>
                </div>
              )}
              {testMessage && testResult === "idle" && <p role="status" className="text-sm text-destructive">{testMessage}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" disabled={testResult === "testing" || !isHydrated} onClick={runDemoTest}>
                  {testResult === "testing" ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <ShieldCheckIcon data-icon="inline-start" />}
                  {testResult === "success" || testResult === "failed" ? "Test Again" : "Test Connection"}
                </Button>
                <span className="text-xs leading-relaxed text-muted-foreground">Local simulation · No network request</span>
              </div>
            </div>
          )}

          {currentStep === 3 && !isComplete && (
            <div className="flex flex-col gap-5">
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Integration Name</span>
                  <span className="text-sm font-medium">{values.integrationName}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Connection Type</span>
                  <span className="text-sm">{values.connectionType}</span>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-muted-foreground">Description</span>
                  <span className="text-sm leading-relaxed">{values.description || "No description provided"}</span>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-muted-foreground">Endpoint URL</span>
                  <span className="break-all font-mono text-sm">{values.endpointUrl}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Authentication</span>
                  <span className="text-sm">{values.authenticationType}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Credentials</span>
                  <span className="text-sm">{values.authenticationType === "None" ? "None" : "••••••••"}</span>
                </div>
                {values.authenticationType === "OAuth" && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">OAuth Client ID</span>
                    <span className="break-all font-mono text-sm">{values.clientId}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t pt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Connection test</span>
                  <span className="text-sm text-muted-foreground">{testResult === "success" ? "Demo test passed" : "No successful test"}</span>
                </div>
                <Badge variant={testResult === "success" ? "secondary" : "outline"}>{testResult === "success" ? "Passed" : "Not verified"}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                <span className="mr-auto text-sm text-muted-foreground">Edit a section</span>
                <Button type="button" variant="outline" size="sm" onClick={() => goToStep(0)}>Edit basics</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => goToStep(1)}>Edit configuration</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => goToStep(2)}>Edit test</Button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">Creating this demo shows a local completion state only. No real integration will be created.</p>
            </div>
          )}

          {isComplete && (
            <div role="status" aria-live="polite" className="flex flex-col items-start gap-4 rounded-lg border bg-card p-5 sm:p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckIcon aria-hidden="true" className="size-5" /></span>
              <div className="flex flex-col gap-2">
                <h4 className="font-heading text-lg font-semibold">Demo complete</h4>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">The wizard reached its completion state. No real integration was created and no external service was contacted.</p>
              </div>
            </div>
          )}

          <footer className="sticky bottom-4 z-10 mt-2 flex flex-row items-center justify-between gap-2 rounded-xl border bg-card p-3 text-card-foreground shadow-lg sm:p-4">
            <div className="flex min-w-0 max-w-20 flex-col gap-0.5 sm:max-w-none sm:gap-1">
              <span className="text-xs font-medium sm:text-sm">Step {isComplete ? steps.length : currentStep + 1} of {steps.length}</span>
              <span aria-live="polite" className="truncate text-[10px] text-muted-foreground sm:text-xs">{isDirty ? "Unsaved changes" : draftStatus}</span>
              {hasSavedDraft && !isComplete && (
                <Button type="button" variant="link" size="xs" className="h-auto w-fit px-0 text-muted-foreground" onClick={() => setResetDialogOpen(true)}>Reset Draft</Button>
              )}
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
              <Button type="button" variant="outline" size="sm" className="px-2 sm:px-2.5" disabled={currentStep === 0 || isComplete || isCreating} onClick={goBack}>
                <ArrowLeftIcon data-icon="inline-start" className="hidden sm:block" /><span>Back</span>
              </Button>
              <Button type="button" variant="secondary" size="sm" className="px-2 sm:px-2.5" aria-label="Save Draft" title="Save Draft" disabled={!isHydrated || !isDirty || isComplete || isCreating} onClick={saveDraft}>
                <SaveIcon data-icon="inline-start" className="hidden sm:block" /><span className="sm:hidden">Save</span><span className="hidden sm:inline">Save Draft</span>
              </Button>
              {isComplete ? (
                <Button type="button" variant="outline" size="sm" onClick={resetWizard}><RotateCcwIcon data-icon="inline-start" className="hidden sm:block" /><span>Start another integration</span></Button>
              ) : (
                <Button type="submit" size="sm" disabled={!isHydrated || isCreating || (currentStep === 2 && testResult !== "success")}>
                  {isCreating ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : null}
                  {isCreating ? "Completing…" : currentStep === 3 ? "Create Integration" : "Continue"}
                  {!isCreating && currentStep < 3 ? <ArrowRightIcon data-icon="inline-end" className="hidden sm:block" /> : null}
                </Button>
              )}
            </div>
          </footer>
        </form>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent data-parry-theme>
          <DialogHeader>
            <DialogTitle>Reset saved draft?</DialogTitle>
            <DialogDescription>This clears the locally saved progress and resets the wizard fields in this preview. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>Keep Draft</Button>
            <Button type="button" variant="destructive" onClick={resetWizard}>Reset Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
