"use client"

import { useState, type ComponentProps, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, LogInIcon, UserPlusIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SocialIcon } from "@/components/ui/social-button"
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

const providers = [
  { name: "Google", icon: <SocialIcon provider="google" /> },
  { name: "Microsoft", icon: <SocialIcon provider="microsoft" /> },
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
