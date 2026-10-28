"use client"

import { useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout, AuthModeSwitch, PasswordInput, SocialSignInButtons } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// shortcut: shape check only, the real backend decides whether the address exists.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

    setPending(true)
    window.setTimeout(() => {
      setPending(false)
      setPassword("")
      toast.success("Logged in to this preview.", { description: "No account was checked; this template does not contact a server.", position: "bottom-right" })
    }, 800)
  }

  function handleProvider(provider: string) {
    toast.info(`${provider} sign-in is not connected in this preview.`, { position: "bottom-right" })
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

        <Button type="submit" size="lg" disabled={pending} className="mt-2 h-11 w-full text-base">
          {pending && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" aria-hidden="true" />}
          {pending ? "Logging in…" : "Log In"}
        </Button>
      </form>

      <SocialSignInButtons onSelect={handleProvider} disabled={pending} />
    </AuthLayout>
  )
}
