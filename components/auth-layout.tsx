"use client"

import { useState, type ComponentProps, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, LogInIcon, UserPlusIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { tabsListVariants } from "@/components/ui/tabs"

const testimonials = [
  {
    quote: "We moved every regional team onto one workspace in a week. Reviews that took a day now close before lunch.",
    name: "Alya Pratama",
    role: "Head of Operations",
    company: "Northstar Labs",
  },
  {
    quote: "Our agents finally see the full customer history in one place, so handovers no longer start from zero.",
    name: "Rafael Putra",
    role: "Customer Experience Lead",
    company: "Horizon Group",
  },
  {
    quote: "Setting up integrations used to need an engineer. Now our analysts connect new sources on their own.",
    name: "Mei Tan",
    role: "Data Program Manager",
    company: "Meridian Works",
  },
]

export function AuthTestimonialPanel() {
  const [index, setIndex] = useState(0)
  const testimonial = testimonials[index]
  const step = (delta: number) => setIndex((current) => (current + delta + testimonials.length) % testimonials.length)

  return (
    <aside
      aria-label="Customer testimonials"
      // Stays Midnight in both themes so the white copy keeps its contrast.
      className="relative hidden overflow-hidden rounded-xl bg-sidebar bg-[radial-gradient(120%_80%_at_85%_0%,color-mix(in_oklch,var(--ring),transparent_35%),transparent_70%),radial-gradient(90%_60%_at_0%_30%,color-mix(in_oklch,var(--sidebar-accent),transparent_10%),transparent_75%)] p-4 text-white lg:flex lg:flex-col lg:justify-end"
    >
      <figure className="flex flex-col gap-6 rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
        <blockquote aria-live="polite" className="text-lg leading-relaxed text-pretty">&ldquo;{testimonial.quote}&rdquo;</blockquote>
        <div className="flex items-end justify-between gap-4">
          <figcaption className="flex flex-col gap-1">
            <span className="font-heading text-xl font-semibold">{testimonial.name}</span>
            <span className="text-sm font-medium">{testimonial.role}</span>
            <span className="text-sm text-white/80">{testimonial.company}</span>
          </figcaption>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => step(-1)} aria-label="Previous testimonial" className="text-white hover:bg-white/15 hover:text-white dark:hover:bg-white/15">
              <ArrowLeftIcon />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => step(1)} aria-label="Next testimonial" className="text-white hover:bg-white/15 hover:text-white dark:hover:bg-white/15">
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </figure>
    </aside>
  )
}

export function AuthLayout({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-[44rem] w-full gap-4 rounded-2xl border bg-card p-3 shadow-sm lg:grid-cols-2">
      <div className="flex flex-col items-center px-2 py-8 sm:px-6">
        <div className="flex w-full max-w-sm flex-1 flex-col justify-center gap-6">{children}</div>
        {footer && <p className="pt-8 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
      <AuthTestimonialPanel />
    </div>
  )
}

const modes = [
  { value: "login", label: "Login", href: "/templates/login", icon: LogInIcon },
  { value: "register", label: "Sign Up", href: "/templates/register", icon: UserPlusIcon },
] as const

// Links, not Tabs: each mode is its own page, so tab semantics would misdescribe the navigation.
export function AuthModeSwitch({ active }: { active: (typeof modes)[number]["value"] }) {
  return (
    <nav aria-label="Authentication" className={cn(tabsListVariants(), "h-8 self-center")}>
      {modes.map(({ value, label, href, icon: Icon }) => (
        <Link
          key={value}
          href={href}
          aria-current={value === active ? "page" : undefined}
          className="inline-flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-sm [&_svg]:size-4"
        >
          <Icon aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

export function PasswordInput({ className, ...props }: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setVisible((current) => !current)}
        aria-label="Show password"
        aria-pressed={visible}
        aria-controls={props.id}
        disabled={props.disabled}
        className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9Z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  )
}

const providers = [
  { name: "Google", icon: <GoogleIcon /> },
  { name: "Microsoft", icon: <MicrosoftIcon /> },
  { name: "SSO", icon: <KeyRoundIcon aria-hidden="true" /> },
]

export function SocialSignInButtons({ onSelect, disabled }: { onSelect: (provider: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Separator className="flex-1" />
        <span>OR</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex flex-col gap-2.5">
        {providers.map(({ name, icon }) => (
          <Button key={name} type="button" variant="outline" size="lg" disabled={disabled} onClick={() => onSelect(name)} className="w-full">
            {icon}
            Continue with {name}
          </Button>
        ))}
      </div>
    </div>
  )
}
