"use client"

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeftIcon, CheckIcon, CircleIcon, LoaderCircleIcon, MailCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout, AuthModeSwitch, PasswordInput, SocialSignInButtons } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// shortcut: shape check only, the real backend decides whether the address exists.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "A letter", test: (value: string) => /\p{L}/u.test(value) },
  { label: "A number", test: (value: string) => /\d/.test(value) },
]

const meetsPasswordRules = (value: string) => passwordRules.every((rule) => rule.test(value))

function PasswordRules({ id, value }: { id: string; value: string }) {
  return (
    <ul id={id} className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {passwordRules.map((rule) => {
        const met = rule.test(value)
        return (
          <li key={rule.label} className={met ? "flex items-center gap-1 text-success" : "flex items-center gap-1"}>
            {met ? <CheckIcon aria-hidden="true" className="size-3.5" /> : <CircleIcon aria-hidden="true" className="size-3" />}
            {rule.label}
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        )
      })}
    </ul>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="text-sm text-destructive">{message}</p> : null
}

// Focus the first field that failed, in the order the keys are listed.
function focusFirstError(prefix: string, errors: Record<string, string | undefined>) {
  const key = Object.keys(errors).find((name) => errors[name])
  if (key) document.getElementById(`${prefix}-${key}`)?.focus()
  return Boolean(key)
}

function describedBy(id: string, error?: string, help?: string) {
  return [error ? `${id}-error` : null, help].filter(Boolean).join(" ") || undefined
}

function simulateRequest(setPending: (pending: boolean) => void, done: () => void) {
  setPending(true)
  window.setTimeout(() => {
    setPending(false)
    done()
  }, 800)
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 h-11 w-full text-base">
      {pending && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : label}
    </Button>
  )
}

const showProviderToast = (provider: string) => toast.info(`${provider} sign-in is not connected in this preview.`, { position: "bottom-right" })

type LoginErrors = { email?: string; password?: string }

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<LoginErrors>({})
  const [pending, setPending] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: LoginErrors = {}
    if (!email.trim()) nextErrors.email = "Enter your email address."
    else if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email address, like name@company.com."
    if (!password) nextErrors.password = "Enter your password."
    setErrors(nextErrors)
    if (nextErrors.email) return emailRef.current?.focus()
    if (nextErrors.password) return passwordRef.current?.focus()

    simulateRequest(setPending, () => {
      setPassword("")
      toast.success("Logged in to this preview.", { description: "No account was checked; this template does not contact a server.", position: "bottom-right" })
    })
  }

  return (
    <AuthLayout footer={<>Don&apos;t have an account yet? <Link href="/templates/register" className="font-medium text-link hover:underline">Sign up</Link></>}>
      <AuthModeSwitch active="login" />
      <header className="flex flex-col gap-1.5 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Please enter your details to log in.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            ref={emailRef}
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending}
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="h-10"
          />
          {errors.email && <p id="login-email-error" className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="login-password">Password</Label>
            <Link href="/templates/forgot-password" className="text-xs font-medium text-link hover:underline">Forgot password?</Link>
          </div>
          <PasswordInput
            ref={passwordRef}
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            required
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className="h-10"
          />
          {errors.password && <p id="login-password-error" className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <SubmitButton pending={pending} label="Log In" pendingLabel="Logging in…" />
      </form>

      <SocialSignInButtons onSelect={showProviderToast} disabled={pending} />
    </AuthLayout>
  )
}

type RegisterErrors = { name?: string; email?: string; password?: string; confirm?: string; terms?: string }

export function RegisterForm() {
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [pending, setPending] = useState(false)
  const update = (field: keyof typeof values) => (event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, [field]: event.target.value }))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = values.email.trim()
    const nextErrors: RegisterErrors = {
      name: values.name.trim() ? undefined : "Enter your full name.",
      email: !email ? "Enter your work email." : emailPattern.test(email) ? undefined : "Enter a valid email address, like name@company.com.",
      password: !values.password ? "Create a password." : meetsPasswordRules(values.password) ? undefined : "Use at least 8 characters with a letter and a number.",
      confirm: !values.confirm ? "Confirm your password." : values.confirm === values.password ? undefined : "Passwords don't match.",
      terms: terms ? undefined : "Accept the terms to create an account.",
    }
    setErrors(nextErrors)
    if (focusFirstError("register", nextErrors)) return

    simulateRequest(setPending, () => {
      setValues((current) => ({ ...current, password: "", confirm: "" }))
      toast.success("Account created in this preview.", { description: "No account was stored; this template does not contact a server.", position: "bottom-right" })
    })
  }

  return (
    <AuthLayout footer={<>Already have an account? <Link href="/templates/login" className="font-medium text-link hover:underline">Log in</Link></>}>
      <AuthModeSwitch active="register" />
      <header className="flex flex-col gap-1.5 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Create your account</h2>
        <p className="text-sm text-muted-foreground">Set up your workspace in a couple of minutes.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-name">Full name</Label>
          <Input id="register-name" autoComplete="name" placeholder="Enter your full name" value={values.name} onChange={update("name")} disabled={pending} required aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("register-name", errors.name)} className="h-10" />
          <FieldError id="register-name-error" message={errors.name} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-email">Work email</Label>
          <Input id="register-email" type="email" autoComplete="email" placeholder="name@company.com" value={values.email} onChange={update("email")} disabled={pending} required aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("register-email", errors.email)} className="h-10" />
          <FieldError id="register-email-error" message={errors.email} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-password">Password</Label>
          <PasswordInput id="register-password" autoComplete="new-password" placeholder="Create a password" value={values.password} onChange={update("password")} disabled={pending} required aria-invalid={Boolean(errors.password)} aria-describedby={describedBy("register-password", errors.password, "register-password-rules")} className="h-10" />
          <PasswordRules id="register-password-rules" value={values.password} />
          <FieldError id="register-password-error" message={errors.password} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-confirm">Confirm password</Label>
          <PasswordInput id="register-confirm" autoComplete="new-password" placeholder="Enter the password again" value={values.confirm} onChange={update("confirm")} disabled={pending} required aria-invalid={Boolean(errors.confirm)} aria-describedby={describedBy("register-confirm", errors.confirm)} className="h-10" />
          <FieldError id="register-confirm-error" message={errors.confirm} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <Checkbox id="register-terms" checked={terms} onCheckedChange={(checked) => setTerms(checked === true)} disabled={pending} aria-invalid={Boolean(errors.terms)} aria-describedby={describedBy("register-terms", errors.terms)} className="mt-0.5" />
            <Label htmlFor="register-terms" className="leading-snug font-normal text-muted-foreground">I agree to the Terms of Service and Privacy Policy.</Label>
          </div>
          <FieldError id="register-terms-error" message={errors.terms} />
        </div>

        <SubmitButton pending={pending} label="Create account" pendingLabel="Creating account…" />
      </form>

      <SocialSignInButtons onSelect={showProviderToast} disabled={pending} />
    </AuthLayout>
  )
}

const RESEND_COOLDOWN_SECONDS = 30

// Stable ref callback: runs on mount only, so the cooldown ticks don't steal focus back.
const focusOnMount = (node: HTMLElement | null) => node?.focus()

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string>()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = email.trim()
    const nextError = !value ? "Enter your email address." : emailPattern.test(value) ? undefined : "Enter a valid email address, like name@company.com."
    setError(nextError)
    if (focusFirstError("forgot", { email: nextError })) return

    simulateRequest(setPending, () => {
      setSentTo(value)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    })
  }

  function resend() {
    setCooldown(RESEND_COOLDOWN_SECONDS)
    toast.success("Reset link sent again in this preview.", { description: "No email was sent; this template does not contact a server.", position: "bottom-right" })
  }

  const backToLogin = (
    <Link href="/templates/login" className="inline-flex items-center gap-1.5 self-center text-sm font-medium text-link hover:underline">
      <ArrowLeftIcon aria-hidden="true" className="size-4" />
      Back to login
    </Link>
  )

  if (sentTo) {
    return (
      <AuthLayout footer={<>Didn&apos;t get it? Check your spam folder or <button type="button" onClick={() => setSentTo(undefined)} className="font-medium text-link hover:underline">use a different email</button>.</>}>
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success"><MailCheckIcon aria-hidden="true" className="size-6" /></span>
          <h2 tabIndex={-1} ref={focusOnMount} className="font-heading text-2xl font-semibold tracking-tight outline-none">Check your email</h2>
          <p className="text-sm text-muted-foreground">If an account exists for <span className="font-medium text-foreground">{maskEmail(sentTo)}</span>, we sent a link to reset your password. It expires in 30 minutes.</p>
        </header>
        <Button type="button" variant="outline" size="lg" onClick={resend} disabled={cooldown > 0} className="h-11 w-full">
          {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend link"}
        </Button>
        {backToLogin}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout footer={<>Remember your password? <Link href="/templates/login" className="font-medium text-link hover:underline">Log in</Link></>}>
      <header className="flex flex-col gap-1.5 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Forgot your password?</h2>
        <p className="text-sm text-muted-foreground">Enter the email you use to log in and we&apos;ll send you a reset link.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="forgot-email">Email address</Label>
          <Input id="forgot-email" type="email" autoComplete="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} required aria-invalid={Boolean(error)} aria-describedby={describedBy("forgot-email", error)} className="h-10" />
          <FieldError id="forgot-email-error" message={error} />
        </div>
        <SubmitButton pending={pending} label="Send reset link" pendingLabel="Sending…" />
      </form>
      {backToLogin}
    </AuthLayout>
  )
}

// Show only the first character of the local part, so the page doesn't echo the full address.
function maskEmail(email: string) {
  return email.replace(/^(.)[^@]*/, "$1•••")
}

type ChangePasswordErrors = { current?: string; next?: string; confirm?: string }
const emptyChangePassword = { current: "", next: "", confirm: "" }

export function ChangePasswordForm() {
  const [values, setValues] = useState(emptyChangePassword)
  const [errors, setErrors] = useState<ChangePasswordErrors>({})
  const [pending, setPending] = useState(false)
  const update = (field: keyof typeof values) => (event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, [field]: event.target.value }))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: ChangePasswordErrors = {
      current: values.current ? undefined : "Enter your current password.",
      next: !values.next ? "Create a new password."
        : !meetsPasswordRules(values.next) ? "Use at least 8 characters with a letter and a number."
        : values.next === values.current ? "Choose a password different from your current one."
        : undefined,
      confirm: !values.confirm ? "Confirm your new password." : values.confirm === values.next ? undefined : "Passwords don't match.",
    }
    setErrors(nextErrors)
    if (focusFirstError("change", nextErrors)) return

    simulateRequest(setPending, () => {
      setValues(emptyChangePassword)
      toast.success("Password changed in this preview.", { description: "Nothing was saved; this template does not contact a server.", position: "bottom-right" })
    })
  }

  return (
    <AuthLayout>
      <Link href="/templates/login" className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-link hover:underline">
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to login
      </Link>
      <header className="flex flex-col gap-1.5 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Change your password</h2>
        <p className="text-sm text-muted-foreground">Choose a new password you don&apos;t use for other accounts.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="change-current">Current password</Label>
          <PasswordInput id="change-current" autoComplete="current-password" placeholder="Enter your current password" value={values.current} onChange={update("current")} disabled={pending} required aria-invalid={Boolean(errors.current)} aria-describedby={describedBy("change-current", errors.current)} className="h-10" />
          <FieldError id="change-current-error" message={errors.current} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="change-next">New password</Label>
          <PasswordInput id="change-next" autoComplete="new-password" placeholder="Create a new password" value={values.next} onChange={update("next")} disabled={pending} required aria-invalid={Boolean(errors.next)} aria-describedby={describedBy("change-next", errors.next, "change-next-rules")} className="h-10" />
          <PasswordRules id="change-next-rules" value={values.next} />
          <FieldError id="change-next-error" message={errors.next} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="change-confirm">Confirm new password</Label>
          <PasswordInput id="change-confirm" autoComplete="new-password" placeholder="Enter the new password again" value={values.confirm} onChange={update("confirm")} disabled={pending} required aria-invalid={Boolean(errors.confirm)} aria-describedby={describedBy("change-confirm", errors.confirm)} className="h-10" />
          <FieldError id="change-confirm-error" message={errors.confirm} />
        </div>

        <SubmitButton pending={pending} label="Update password" pendingLabel="Updating…" />
      </form>
    </AuthLayout>
  )
}
